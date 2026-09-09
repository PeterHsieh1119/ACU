// 簡化人體模型
//
// 座標沿用原本的骨架 landmark（身高 1.75 m，y 向上，+z 為前方，+x 為受檢者左側後鏡射）：
//   頭心 1.63｜下頜 1.545｜C7 1.45｜肩關節 1.415｜肘 1.17｜腕 0.93｜髖 0.92｜膝 0.52｜踝 0.12
// 這些數值是穴位資料的參考框架，改動會讓既有座標失準，因此體表只在這組 landmark 之間
// 用平滑的 loft 重建，不移動關節位置。
//
// 另外提供 makeSnapper()：把「大致正確」的穴位座標沿著體軸向外投影，精準吸附到體表上。

import * as THREE from 'three';
import { sweep, tube, ellipsoid } from './geom.js';

// ---------- 各部位剖面 ----------
// sweep 的 station：{ p:[x,y,z], r:[橫半徑, 縱半徑] }（axis:'y' 時縱半徑指前後向）

const TORSO = [
  { p: [0, 0.855, 0.004], r: [0.148, 0.096] },   // 骨盆底
  { p: [0, 0.895, 0.004], r: [0.163, 0.102] },
  { p: [0, 0.935, 0.003], r: [0.170, 0.106] },   // 髖最寬
  { p: [0, 0.985, 0.004], r: [0.152, 0.101] },
  { p: [0, 1.035, 0.005], r: [0.140, 0.097] },   // 臍
  { p: [0, 1.085, 0.004], r: [0.135, 0.094] },   // 腰最細
  { p: [0, 1.145, 0.004], r: [0.147, 0.099] },
  { p: [0, 1.205, 0.004], r: [0.164, 0.104] },
  { p: [0, 1.265, 0.004], r: [0.176, 0.107] },   // 胸
  { p: [0, 1.330, 0.002], r: [0.180, 0.104] },
  { p: [0, 1.390, 0.000], r: [0.175, 0.094] },
  { p: [0, 1.425, -0.004], r: [0.155, 0.081] },  // 肩線
  { p: [0, 1.448, -0.006], r: [0.110, 0.066] },  // 頸根
];

const NECK = [
  { p: [0, 1.415, -0.004], r: [0.062, 0.058] },
  { p: [0, 1.470, -0.006], r: [0.052, 0.050] },
  { p: [0, 1.520, -0.005], r: [0.049, 0.048] },
  { p: [0, 1.552, -0.002], r: [0.050, 0.050] },
];

const HEAD = [
  { p: [0, 1.523, 0.030], r: [0.040, 0.044] },   // 頦下
  { p: [0, 1.548, 0.024], r: [0.058, 0.064] },   // 頦
  { p: [0, 1.575, 0.012], r: [0.071, 0.084] },   // 口
  { p: [0, 1.605, 0.005], r: [0.082, 0.094] },   // 鼻底 / 耳屏
  { p: [0, 1.640, 0.000], r: [0.089, 0.103] },   // 眼
  { p: [0, 1.675, -0.003], r: [0.092, 0.104] },  // 眉
  { p: [0, 1.702, -0.006], r: [0.090, 0.100] },
  { p: [0, 1.726, -0.008], r: [0.078, 0.085] },
  { p: [0, 1.740, -0.008], r: [0.052, 0.057] },
  { p: [0, 1.750, -0.008], r: [0.013, 0.015] },  // 頭頂（百會）
];

const ARM = [
  { p: [0.190, 1.415, 0.004], r: [0.052, 0.052] },  // 肩關節
  { p: [0.206, 1.350, 0.005], r: [0.049, 0.049] },  // 三角肌止點
  { p: [0.222, 1.270, 0.006], r: [0.045, 0.045] },
  { p: [0.238, 1.195, 0.007], r: [0.038, 0.038] },
  { p: [0.245, 1.170, 0.008], r: [0.036, 0.036] },  // 肘
  { p: [0.256, 1.125, 0.009], r: [0.042, 0.041] },  // 前臂肌腹
  { p: [0.268, 1.050, 0.011], r: [0.037, 0.036] },
  { p: [0.279, 0.975, 0.014], r: [0.029, 0.028] },
  { p: [0.285, 0.932, 0.015], r: [0.026, 0.024] },  // 腕
];

const PALM = [
  { p: [0.286, 0.928, 0.016], r: [0.028, 0.013] },
  { p: [0.294, 0.898, 0.021], r: [0.036, 0.014] },
  { p: [0.300, 0.862, 0.025], r: [0.037, 0.014] },
  { p: [0.301, 0.846, 0.027], r: [0.036, 0.013] },
];

const FINGERS = [
  { p: [0.301, 0.848, 0.027], r: [0.035, 0.012] },
  { p: [0.300, 0.812, 0.028], r: [0.033, 0.011] },
  { p: [0.297, 0.786, 0.029], r: [0.027, 0.009] },
  { p: [0.294, 0.772, 0.030], r: [0.014, 0.006] },
];

const THUMB = [[0.296, 0.892, 0.020], [0.312, 0.868, 0.030], [0.324, 0.848, 0.032]];

const LEG = [
  { p: [0.095, 0.928, 0.005], r: [0.079, 0.079] },  // 髖
  { p: [0.098, 0.840, 0.006], r: [0.077, 0.077] },
  { p: [0.098, 0.720, 0.006], r: [0.070, 0.070] },
  { p: [0.094, 0.600, 0.005], r: [0.060, 0.060] },
  { p: [0.090, 0.520, 0.004], r: [0.050, 0.050] },  // 膝
  { p: [0.092, 0.470, -0.002], r: [0.052, 0.052] },
  { p: [0.096, 0.380, -0.006], r: [0.055, 0.055] }, // 腓腸肌肌腹
  { p: [0.096, 0.280, -0.006], r: [0.045, 0.045] },
  { p: [0.094, 0.180, -0.008], r: [0.033, 0.033] },
  { p: [0.093, 0.122, -0.008], r: [0.030, 0.029] }, // 踝
  { p: [0.094, 0.078, -0.010], r: [0.029, 0.028] }, // 伸進足部內，端蓋才不會外露
];

// axis:'z' → station 的 r 是 [左右半徑, 上下半徑]
const FOOT = [
  { p: [0.095, 0.034, -0.062], r: [0.028, 0.028] },  // 跟
  { p: [0.096, 0.038, -0.020], r: [0.036, 0.038] },
  { p: [0.097, 0.036, 0.030], r: [0.039, 0.036] },
  { p: [0.098, 0.030, 0.090], r: [0.041, 0.029] },
  { p: [0.098, 0.024, 0.145], r: [0.039, 0.022] },
  { p: [0.098, 0.020, 0.176], r: [0.028, 0.015] },  // 趾端
];

// cap 只在「露在外面」的端點打開，藏在其他部位裡的端點關掉，
// 否則半透明的皮膚會看到一片一片的橫斷面圓盤。
const PARTS = [
  { kind: 'sweep', axis: 'y', stations: TORSO, cap: false },
  { kind: 'sweep', axis: 'y', stations: NECK, cap: false },
  { kind: 'sweep', axis: 'y', stations: HEAD, radial: 34, cap: [false, true] },
  { kind: 'ellipsoid', c: [0, 1.618, 0.098], r: [0.016, 0.023, 0.018] },              // 鼻
  { kind: 'ellipsoid', c: [0.087, 1.630, 0.004], r: [0.009, 0.028, 0.020], mirror: true }, // 耳
  { kind: 'ellipsoid', c: [0.185, 1.415, 0.002], r: [0.056, 0.052, 0.052], mirror: true }, // 肩峰
  { kind: 'sweep', axis: 'y', stations: ARM, mirror: true, cap: false },
  { kind: 'sweep', axis: 'y', stations: PALM, mirror: true, cap: false },
  { kind: 'sweep', axis: 'y', stations: FINGERS, mirror: true, cap: [false, true] },
  { kind: 'tube', points: THUMB, r: 0.013, taper: [0.9, 1, 0.75], mirror: true },
  { kind: 'sweep', axis: 'y', stations: LEG, mirror: true, cap: false },
  { kind: 'sweep', axis: 'z', stations: FOOT, mirror: true },
];

// ---------- 體軸（吸附時的射線起點） ----------
const AXES = [
  [[0, 0.88, 0.004], [0, 1.20, 0.004], [0, 1.42, 0], [0, 1.52, -0.004], [0, 1.63, 0]],       // 軀幹＋頭頸
  [[0.190, 1.415, 0.004], [0.245, 1.170, 0.008], [0.285, 0.932, 0.015], [0.300, 0.856, 0.026], [0.297, 0.786, 0.029]],
  [[0.095, 0.928, 0.005], [0.090, 0.520, 0.004], [0.093, 0.122, -0.008]],
  [[0.095, 0.034, -0.055], [0.098, 0.026, 0.170]],
];

function mirrorStations(st) {
  return st.map(s => ({ p: [-s.p[0], s.p[1], s.p[2]], r: s.r }));
}

function geometryFor(part, radial) {
  const flip = part._flip;
  if (part.kind === 'sweep') {
    const st = flip ? mirrorStations(part.stations) : part.stations;
    return sweep(st, { axis: part.axis, radial: part.radial || radial, cap: part.cap !== undefined ? part.cap : true });
  }
  if (part.kind === 'tube') {
    const pts = flip ? part.points.map(p => [-p[0], p[1], p[2]]) : part.points;
    return tube(pts, { r: part.r, taper: part.taper, radial: Math.max(8, radial / 2) });
  }
  const c = flip ? [-part.c[0], part.c[1], part.c[2]] : part.c;
  return ellipsoid(c, part.r, radial);
}

function expand() {
  const out = [];
  for (const p of PARTS) {
    out.push({ ...p, _flip: false });
    if (p.mirror) out.push({ ...p, _flip: true });
  }
  return out;
}

/**
 * 建立人體。回傳可見的 group、皮膚材質，以及一組僅供射線吸附用（不加入場景）的碰撞網格。
 */
export function buildBody() {
  // depthWrite 開著是刻意的：穴位標記畫在皮膚之後、肌肉畫在皮膚之前，
  // 於是「身體另一側」的穴位會被體表擋住（前視圖不會看到背俞穴），
  // 而位於體內的肌肉仍然透出來，維持透視效果。
  const material = new THREE.MeshStandardMaterial({
    color: 0xd8b49a, roughness: 0.72, metalness: 0.02,
    transparent: true, opacity: 0.42,
    depthWrite: true,
    side: THREE.FrontSide,
  });

  const group = new THREE.Group();
  group.name = 'body';
  const collision = [];
  const colMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });

  for (const part of expand()) {
    const mesh = new THREE.Mesh(geometryFor(part, 26), material);
    mesh.renderOrder = 2;   // 肌肉(1) → 皮膚(2) → 經絡線(3) → 穴位標記(4)
    group.add(mesh);
    collision.push(new THREE.Mesh(geometryFor(part, 12), colMat));
  }

  return { group, material, collision };
}

// ---------- 體表吸附 ----------

/** 取得離某點最近的體軸位置（吸附與鏡頭聚焦都用得到） */
export function bodyAxisPoint(p) {
  return nearestOnAxes(p);
}

function nearestOnAxes(p) {
  let best = null, bestD = Infinity;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), ab = new THREE.Vector3(), ap = new THREE.Vector3();
  for (const axis of AXES) {
    for (const sign of [1, -1]) {
      for (let i = 0; i < axis.length - 1; i++) {
        a.set(axis[i][0] * sign, axis[i][1], axis[i][2]);
        b.set(axis[i + 1][0] * sign, axis[i + 1][1], axis[i + 1][2]);
        ab.subVectors(b, a); ap.subVectors(p, a);
        const t = Math.max(0, Math.min(1, ap.dot(ab) / Math.max(1e-9, ab.lengthSq())));
        const q = a.clone().addScaledVector(ab, t);
        const d = q.distanceToSquared(p);
        if (d < bestD) { bestD = d; best = q; }
      }
      if (axis[0][0] === 0) break;  // 位於正中線的體軸不必鏡射
    }
  }
  return best;
}

/**
 * 產生吸附函式：把座標沿「體軸 → 該點」的方向投影到最近的體表上。
 * 穴位本來就在皮膚上，所以吸附後的位置比手填的近似座標更準，也保證看得見、點得到。
 * @param {THREE.Mesh[]} collision buildBody() 回傳的碰撞網格
 * @param {number} lift 吸附後往外抬高多少（公尺），讓標記浮在皮膚外側
 * @param {number} maxShift 位移超過這個距離就放棄吸附，保留原始座標
 */
export function makeSnapper(collision, lift = 0.004, maxShift = 0.055) {
  const ray = new THREE.Raycaster();
  ray.far = 0.5;
  const p = new THREE.Vector3(), dir = new THREE.Vector3();

  return function snap(pos) {
    p.set(pos[0], pos[1], pos[2]);
    const origin = nearestOnAxes(p);
    if (!origin) return pos.slice();
    dir.subVectors(p, origin);
    if (dir.lengthSq() < 1e-8) return pos.slice();
    dir.normalize();
    ray.set(origin, dir);
    const hits = ray.intersectObjects(collision, false);
    if (!hits.length) return pos.slice();
    const target = hits[0].point.clone().addScaledVector(dir, lift);
    if (target.distanceTo(p) > maxShift) return pos.slice();
    return [target.x, target.y, target.z];
  };
}
