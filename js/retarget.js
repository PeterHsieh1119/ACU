// 把依骨度分寸推算的穴位座標，搬到真實解剖模型上
//
// ACU 內建示意模型與 BodyParts3D 的關節位置並不一樣（肘、腕、膝、踝都差 3–6 公分），
// 直接套用會整條經絡歪掉。這裡的作法是：
//
//   1. 在兩個模型上各定義一組語意相同的體軸節點（肩→肘→腕→掌→指尖 等等）
//   2. 對每個穴位，找出它落在來源體軸的哪一段、段內比例 t、以及相對體軸的偏移方向
//   3. 在目標體軸的同一段、同一個 t 取得新的起點，偏移方向依兩段的夾角旋轉
//   4. 從新起點沿該方向射線打到真實體表，穴位就落在皮膚上
//
// 背俞穴、督脈等由椎體定義的穴位另外處理：直接用真實模型的棘突高度，不走比例映射。

import * as THREE from 'three';
import { makeSurfaceRay } from './surfaceray.js';

const v = (x, y, z) => new THREE.Vector3(x, y, z);

// 來源：ACU 內建示意模型的關節位置（與 js/body.js 的 AXES 對應，軀幹再細分成語意節點）
const SOURCE = {
  trunk: [
    v(0, 0.868, 0.004),   // 尾骨
    v(0, 0.928, 0.004),   // 髖
    v(0, 1.030, 0.005),   // 臍
    v(0, 1.200, 0.004),   // 胸劍聯合
    v(0, 1.280, 0.004),   // 乳頭線
    v(0, 1.430, 0.000),   // 胸骨上窩
    v(0, 1.450, 0.000),   // C7
    v(0, 1.545, -0.004),  // 下頜
    v(0, 1.630, 0.000),   // 頭心
    v(0, 1.750, 0.000),   // 頭頂
  ],
  arm: [
    v(0.190, 1.415, 0.004),  // 肩
    v(0.245, 1.170, 0.008),  // 肘
    v(0.285, 0.932, 0.015),  // 腕
    v(0.300, 0.856, 0.026),  // 掌
    v(0.297, 0.786, 0.029),  // 指尖
  ],
  leg: [
    v(0.095, 0.928, 0.005),  // 髖
    v(0.090, 0.520, 0.004),  // 膝
    v(0.093, 0.122, -0.008), // 踝
  ],
  foot: [
    v(0.095, 0.034, -0.055), // 跟
    v(0.098, 0.026, 0.170),  // 趾
  ],
};

/** 由 manifest 的 landmark 組出目標體軸 */
function targetChains(L) {
  const p = a => v(a[0], a[1], a[2]);
  const sp = L.spinous;
  const jugular = L.sternumTop[1] + 0.048;             // 胸骨柄上緣（胸骨體頂端往上約一個柄長）
  const nipple = (L.sternumBottom[1] + L.sternumTop[1]) / 2;
  return {
    trunk: [
      v(0, L.coccyx[1] + 0.003, -0.005),
      v(0, L.hip[1], 0),
      v(0, sp.L3 ? sp.L3[1] : 1.056, 0),
      v(0, L.sternumBottom[1], 0),
      v(0, nipple, 0),
      v(0, jugular, 0),
      v(0, sp.C7[1], -0.005),
      v(0, L.jaw[1], -0.010),
      p(L.headCenter).setX(0),
      p(L.vertex).setX(0),
    ],
    arm: [p(L.shoulder), p(L.elbow), p(L.wrist), p(L.palm), p(L.fingertip)],
    leg: [p(L.hip), p(L.knee), p(L.ankle)],
    foot: [p(L.heel), p(L.toe)],
  };
}

// 內建示意模型背部的 1 寸（BL 第一側線 1.5寸 = 0.045、第二側線 3寸 = 0.09）
const SOURCE_CUN_BACK = 0.03;

// 骶骨各節在 L5 棘突與尾骨之間的比例位置（來源資料的骶骨是一整塊，無法逐節取）
const SACRAL_FRACTION = { S1: 0.22, S2: 0.40, S3: 0.58, S4: 0.76 };

/** 由椎體高度直接定位的穴位，取得該節棘突下緣的 y／z */
export function levelPosition(L, level) {
  const sp = L.spinous;
  if (!sp) return null;
  if (sp[level]) return { y: sp[level][1], z: sp[level][2] };
  const frac = SACRAL_FRACTION[level];
  if (frac != null && sp.L5 && L.coccyx) {
    const a = sp.L5, b = L.coccyx;
    return { y: a[1] + (b[1] - a[1]) * frac, z: a[2] + (b[2] - a[2]) * frac };
  }
  return null;
}

/**
 * 建立 retarget 函式。
 * @param {object} landmarks manifest.landmarks
 * @param {THREE.BufferGeometry} skin 真實體表幾何
 * @param {number} lift 吸附後往體表外抬高多少公尺
 */
export function makeRetarget(landmarks, skin, lift = 0.005) {
  const T = targetChains(landmarks);
  const keys = Object.keys(SOURCE);
  const intersect = makeSurfaceRay(skin);
  const FAR = 0.8;

  const _p = new THREE.Vector3(), _ab = new THREE.Vector3(), _ap = new THREE.Vector3();
  const _q = new THREE.Vector3(), _off = new THREE.Vector3(), _dir = new THREE.Vector3();
  const _tab = new THREE.Vector3(), _base = new THREE.Vector3(), _quat = new THREE.Quaternion();

  const _mapped = new THREE.Vector3();

  /**
   * @param {number[]} pos 來源座標（+x 側或正中線）
   * @param {string} [level] 椎體代號（'T3'、'L2'、'S2'…），有給就用真實棘突高度覆蓋
   * @param {number} [maxShift] 體表交點離「預期位置」超過這個距離就不吸附，保留映射後的座標。
   *                            穴位本來就在皮膚上，用預設的 Infinity；經絡走行的空中補間點才需要限制。
   */
  return function retarget(pos, level, maxShift = Infinity) {
    _p.set(pos[0], pos[1], pos[2]);

    // 1. 找出最近的來源體軸段
    let bestD = Infinity, bestKey = null, bestSeg = 0, bestT = 0;
    for (const key of keys) {
      const chain = SOURCE[key];
      for (let i = 0; i < chain.length - 1; i++) {
        const a = chain[i];
        _ab.subVectors(chain[i + 1], a);
        _ap.subVectors(_p, a);
        const t = Math.max(0, Math.min(1, _ap.dot(_ab) / Math.max(1e-9, _ab.lengthSq())));
        _q.copy(a).addScaledVector(_ab, t);
        const d = _q.distanceToSquared(_p);
        if (d < bestD) { bestD = d; bestKey = key; bestSeg = i; bestT = t; }
      }
    }
    if (!bestKey) return pos.slice();

    const sA = SOURCE[bestKey][bestSeg], sB = SOURCE[bestKey][bestSeg + 1];
    _ab.subVectors(sB, sA);
    _q.copy(sA).addScaledVector(_ab, bestT);
    _off.subVectors(_p, _q);

    // 2. 目標體軸上的對應起點
    const tA = T[bestKey][bestSeg], tB = T[bestKey][bestSeg + 1];
    _tab.subVectors(tB, tA);
    _base.copy(tA).addScaledVector(_tab, bestT);

    // 3. 偏移方向依兩段夾角旋轉
    _quat.setFromUnitVectors(_ab.clone().normalize(), _tab.clone().normalize());
    _dir.copy(_off).applyQuaternion(_quat);
    if (_dir.lengthSq() < 1e-10) _dir.set(0, 0, 1);
    _dir.normalize();

    // 4. 椎體特例。這些穴位的定義是「第 n 椎棘突下、旁開幾寸」，
    //    用角度去推會被真實背部的深度放大（膏肓會跑到肩胛骨外面），
    //    所以直接用真實棘突高度 + 真實骨度分寸算出側方距離，再往後打到背部皮膚。
    const lv = level && levelPosition(landmarks, level);
    if (lv) {
      const cun = Math.abs(pos[0]) / SOURCE_CUN_BACK;
      _base.set(cun * (landmarks.cunBack || 0.021), lv.y, 0.02);
      _dir.set(0, 0, -1);
    }

    // 5. 預期位置＝新起點加上等長的偏移，射線交點取「離預期位置最近」的那個。
    //    只取第一個交點會出事：從體軸往斜後方打，可能穿過手臂再打到背部。
    const offLen = Math.max(0.004, _off.length());
    _mapped.copy(_base).addScaledVector(_dir, offLen);

    const n = [_dir.x, _dir.y, _dir.z];
    if (maxShift === 0) return { p: [_mapped.x, _mapped.y, _mapped.z], n };   // 只映射、不吸附

    const hits = intersect(_base.x, _base.y, _base.z, _dir.x, _dir.y, _dir.z, FAR);
    // 交點取「離預期位置最近」的那個：只取第一個會出事，
    // 從體軸往斜後方打可能穿過手臂再打到背部。
    let hitT = -1, hitD = Infinity;
    for (const h of hits) {
      const d = Math.abs(h - offLen);
      if (d < hitD) { hitD = d; hitT = h; }
    }
    if (hitT < 0 || hitD > maxShift) return { p: [_mapped.x, _mapped.y, _mapped.z], n };
    const at = hitT + lift;
    return { p: [_base.x + _dir.x * at, _base.y + _dir.y * at, _base.z + _dir.z * at], n };
  };
}

/** 目標模型上「離某點最近的體軸位置」，鏡頭聚焦時用來決定從哪個方向看過去 */
export function makeAxisPoint(landmarks) {
  const T = targetChains(landmarks);
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _ab = new THREE.Vector3(), _ap = new THREE.Vector3();
  return function axisPoint(p) {
    let best = null, bestD = Infinity;
    for (const [key, chain] of Object.entries(T)) {
      const sides = key === 'trunk' ? [1] : [1, -1];
      for (const s of sides) {
        for (let i = 0; i < chain.length - 1; i++) {
          _a.copy(chain[i]); _a.x *= s;
          _b.copy(chain[i + 1]); _b.x *= s;
          _ab.subVectors(_b, _a); _ap.subVectors(p, _a);
          const t = Math.max(0, Math.min(1, _ap.dot(_ab) / Math.max(1e-9, _ab.lengthSq())));
          const q = _a.clone().addScaledVector(_ab, t);
          const d = q.distanceToSquared(p);
          if (d < bestD) { bestD = d; best = q; }
        }
      }
    }
    return best || p.clone();
  };
}
