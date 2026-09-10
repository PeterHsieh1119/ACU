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
import { BONE_CUN, landmarkOf } from '../data/cun.js';

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
  const jugular = landmarkOf(L, 'jugularNotch')[1];    // 胸骨上窩（天突）
  const nipple = (L.sternumBottom[1] + L.sternumTop[1]) / 2;
  return {
    trunk: [
      v(0, L.coccyx[1] + 0.003, -0.005),
      // 恥骨聯合上緣與臍：骨度的下腹部就是量這兩點。原本用股骨頭頂與第 3 腰椎棘突，
      // 分別高了 2.3 與 2.4 公分，關元、氣海、天樞那一排會整排偏上。
      v(0, landmarkOf(L, 'pubicSymphysis')[1], 0),
      v(0, landmarkOf(L, 'navel')[1], 0),
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
 * 把每一把骨度尺投影到對應的體軸段上，換算成「第 n 寸落在段內的哪個參數 t」。
 *
 * 骨度標誌（外踝尖、髕尖、大轉子）在體表，體軸節點是關節中心，兩者不重合；
 * 直接拿標誌當射線起點會讓穴位偏到骨頭外面。所以標誌只當尺規用：
 * 先把兩端投影到體軸段得到 t0／t1，再依寸數在 t0–t1 之間內插。
 */
function cunRulers(L, chains) {
  const out = {};
  const _ap = new THREE.Vector3();
  for (const [key, spec] of Object.entries(BONE_CUN)) {
    if (!spec.chain || !spec.ruler) continue;
    const chain = chains[spec.chain];
    if (!chain) continue;
    const A = chain[spec.seg], B = chain[spec.seg + 1];
    // 每一把尺各自留一份段向量：proj 會在 retarget 執行時才被呼叫（from 覆寫起算點），
    // 共用暫存變數的話拿到的會是迴圈最後一段的值。
    const ab = new THREE.Vector3().subVectors(B, A);
    const l2 = Math.max(1e-9, ab.lengthSq());
    const proj = name => {
      const q = landmarkOf(L, name);
      _ap.set(q[0], q[1], q[2]).sub(A);
      return _ap.dot(ab) / l2;
    };
    out[key] = { chain: spec.chain, seg: spec.seg, n: spec.n, t0: proj(spec.ruler[0]), t1: proj(spec.ruler[1]), proj };
  }
  return out;
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
  const rulers = cunRulers(landmarks, T);
  const intersect = makeSurfaceRay(skin);
  // 由體軸到體表最遠約 0.17 m（軀幹側面）；設 0.28 m 上限，射線就不會穿到身體另一側
  const FAR = 0.28;

  const _p = new THREE.Vector3(), _ab = new THREE.Vector3(), _ap = new THREE.Vector3();
  const _q = new THREE.Vector3(), _off = new THREE.Vector3(), _dir = new THREE.Vector3();
  const _tab = new THREE.Vector3(), _base = new THREE.Vector3(), _quat = new THREE.Quaternion();
  const _axis = new THREE.Vector3();

  const _mapped = new THREE.Vector3();

  /**
   * @param {number[]} pos 來源座標（+x 側或正中線）
   * @param {object} [opts]
   *   level    椎體代號（'T3'、'L2'、'S2'…），有給就用真實棘突高度定位
   *   lat      旁開幾寸（背部穴位；沒給就由來源座標推算）
   *   maxShift 體表交點離「預期位置」超過這個距離就不吸附，保留映射後的座標。
   *            穴位本來就在皮膚上，用預設的 Infinity；經絡走行的空中補間點才需要限制。
   *   allow    限定可用的體軸。胸腹背的穴位在幾何上常常離手臂體軸更近（例如淵腋、
   *            天池、大包），不限定就會被判給手臂、射線往內穿過整個身體打到對側。
   *   cun      { seg, n }：四肢穴位改用骨度分寸定位。seg 是 data/cun.js 的尺，
   *            n 是「從尺的遠端標誌往近端量幾寸」（腕橫紋上 7 寸 → forearm / 7）。
   *            座標本身只用來決定橫向偏移的方向，沿骨長軸的位置一律由寸數決定。
   */
  return function retarget(pos, opts = {}) {
    const { level = null, lat = null, maxShift = Infinity, allow = null, cun = null } = opts;
    _p.set(pos[0], pos[1], pos[2]);

    // 1. 找出最近的來源體軸段
    let bestD = Infinity, bestKey = null, bestSeg = 0, bestT = 0;
    for (const key of (allow && allow.length ? allow : keys)) {
      const chain = SOURCE[key];
      if (!chain) continue;
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
    // 4a. 骨度分寸特例：沿骨長軸的位置改由寸數決定，橫向偏移的方向沿用上面算出來的 _dir，
    //     實際落點仍由射線打到體表決定，所以偏移量本身不需要再縮放。
    const ruler = cun && rulers[cun.seg];
    if (ruler) {
      const tA = T[ruler.chain][ruler.seg], tB = T[ruler.chain][ruler.seg + 1];
      const perCun = (ruler.t1 - ruler.t0) / ruler.n;
      // 起算點預設是尺的遠端標誌；有些穴位的教科書定義換了一個標誌
      //（伏兔、血海從「髕底」往上量），但仍沿用同一段骨度的 1 寸長度。
      const from = cun.from ? ruler.proj(cun.from) : ruler.t1;
      _base.copy(tA).lerp(tB, from - perCun * cun.n);
      // 偏移方向只留橫向分量。來源座標的偏移已經含了「在關節中心上方／下方」的資訊，
      // 基準點又照寸數移動過一次，兩者相加會重複計算——崑崙會被拉到腳底板去。
      _axis.subVectors(tB, tA).normalize();
      _dir.addScaledVector(_axis, -_dir.dot(_axis));
      if (_dir.lengthSq() < 1e-6) _dir.subVectors(_p, _q).addScaledVector(_axis, 0);   // 近乎純軸向時退回原偏移
      _dir.normalize();
    }

    const lv = level && levelPosition(landmarks, level);
    if (lv) {
      const lateral = lat != null ? lat : Math.abs(pos[0]) / SOURCE_CUN_BACK;
      _base.set(lateral * (landmarks.cunBack || 0.021), lv.y, 0.02);
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

/**
 * 把一個點壓回體表以內。
 * retarget 是「保留與體軸的絕對偏移量」，穴位本來就在皮膚上所以沒差，
 * 但體內結構（神經走行點）就會出事：示意人體比真實模型瘦，同樣的偏移量
 * 搬過來常常已經穿出皮膚——坐骨神經會跑到臀部後面幾公分的空中。
 * 這裡沿「體軸 → 該點」的方向找體表交點，超出的就拉回體表內側。
 * 只做「拉回來」不做「壓深」：射線可能先穿過胸廓再打到三角肌，
 * 用比例去壓深會把肩部的神經吸到腋窩裡去，所以只留固定的皮下餘裕。
 * @param {number} margin 拉回後距離體表多少公尺
 */
export function makeSkinClamp(landmarks, skin, margin = 0.010) {
  const axis = makeAxisPoint(landmarks);
  const intersect = makeSurfaceRay(skin);
  const _P = new THREE.Vector3(), _D = new THREE.Vector3();
  return function clamp(p) {
    _P.set(p[0], p[1], p[2]);
    const A = axis(_P);
    _D.subVectors(_P, A);
    const len = _D.length();
    if (len < 1e-5) return p.slice();
    _D.divideScalar(len);
    const hits = intersect(A.x, A.y, A.z, _D.x, _D.y, _D.z, 0.30);
    // 落在最內層交點以內就是體內，不用動
    let surf = -1;
    for (const h of hits) if (h <= len && h > surf) surf = h;
    if (surf < 0) return p.slice();
    const maxLen = Math.max(0.004, surf - margin);
    if (len <= maxLen) return p.slice();
    return [A.x + _D.x * maxLen, A.y + _D.y * maxLen, A.z + _D.z * maxLen];
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
