// 幾何工具：把「一串中心點 + 半徑」變成平滑的立體
//
// sweep()  — 橫斷面固定在世界軸上的 loft，斷面可為橢圓；用來做軀幹、頭頸、四肢、手足
// tube()   — 沿曲線的 Frenet 掃掠管，半徑可沿長度變化（梭形肌腹）；用來做肌肉
//
// 兩者都回傳一般的 BufferGeometry，可直接餵給任何 THREE.Material。

import * as THREE from 'three';

const V = new THREE.Vector3();

function toCurve(points, tension = 0.5) {
  return new THREE.CatmullRomCurve3(
    points.map(p => new THREE.Vector3(p[0], p[1], p[2])),
    false, 'catmullrom', tension,
  );
}

// 依「站點索引」線性內插半徑：CatmullRomCurve3 的 t 在各段之間是均分的，
// 所以 t*(站點數-1) 就是站點座標，不需要再做弧長重參數化。
function radiusAt(stations, t) {
  const seg = t * (stations.length - 1);
  const i = Math.min(stations.length - 2, Math.floor(seg));
  const f = seg - i;
  const a = stations[i].r, b = stations[i + 1].r;
  const a0 = Array.isArray(a) ? a[0] : a, a1 = Array.isArray(a) ? a[1] : a;
  const b0 = Array.isArray(b) ? b[0] : b, b1 = Array.isArray(b) ? b[1] : b;
  return [a0 + (b0 - a0) * f, a1 + (b1 - a1) * f];
}

/**
 * 橫斷面平行於世界平面的 loft。
 * @param {Array<{p:number[], r:number|number[]}>} stations 中心點與半徑（半徑可寫 [r橫, r縱]）
 * @param {object} opts axis: 'y' 斷面在 XZ 平面（直立結構）、'z' 斷面在 XY 平面（前後向結構）
 *                     cap: true/false 或 [起端, 止端]；藏在其他部位裡面的端點關掉，才不會露出橫斷面圓盤
 */
export function sweep(stations, opts = {}) {
  const { axis = 'y', radial = 26, steps = null, tension = 0.5, cap = true } = opts;
  const curve = toCurve(stations.map(s => s.p), tension);
  const n = steps || Math.max(12, (stations.length - 1) * 10);

  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const c = curve.getPoint(t, V.clone());
    const [ra, rb] = radiusAt(stations, t);
    for (let j = 0; j < radial; j++) {
      const th = (j / radial) * Math.PI * 2;
      const ca = Math.cos(th) * ra, cb = Math.sin(th) * rb;
      if (axis === 'y') pos.push(c.x + ca, c.y, c.z + cb);
      else pos.push(c.x + ca, c.y + cb, c.z);
      uv.push(j / radial, t);
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < radial; j++) {
      const j2 = (j + 1) % radial;
      const a = i * radial + j, b = i * radial + j2;
      const c = (i + 1) * radial + j, d = (i + 1) * radial + j2;
      idx.push(a, c, b, b, c, d);
    }
  }

  const caps = Array.isArray(cap) ? cap : [cap, cap];
  for (const end of [0, 1]) {
    if (caps[end]) {
      const c = curve.getPoint(end, V.clone());
      const center = pos.length / 3;
      pos.push(c.x, c.y, c.z); uv.push(0.5, end);
      const ring = end === 0 ? 0 : n * radial;
      for (let j = 0; j < radial; j++) {
        const j2 = (j + 1) % radial;
        if (end === 0) idx.push(center, ring + j2, ring + j);
        else idx.push(center, ring + j, ring + j2);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// 預設梭形肌腹：兩端收成腱、中段最飽滿
function fusiform(t) {
  return 0.34 + 0.66 * Math.pow(Math.sin(Math.PI * t), 0.75);
}

function profileAt(taper, t) {
  if (!taper) return fusiform(t);
  const seg = t * (taper.length - 1);
  const i = Math.min(taper.length - 2, Math.floor(seg));
  const f = seg - i;
  return taper[i] + (taper[i + 1] - taper[i]) * f;
}

/**
 * 沿曲線掃掠的圓管，半徑沿長度變化。
 * @param {number[][]} points 路徑控制點
 * @param {object} opts r 最大半徑、taper 半徑倍率剖面（不給則用梭形）
 */
export function tube(points, opts = {}) {
  const { r = 0.01, taper = null, radial = 12, steps = null, tension = 0.4 } = opts;
  const curve = toCurve(points, tension);
  const n = steps || Math.max(16, (points.length - 1) * 12);
  const frames = curve.computeFrenetFrames(n, false);

  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const c = curve.getPoint(t, V.clone());
    const N = frames.normals[i], B = frames.binormals[i];
    const rad = r * profileAt(taper, t);
    for (let j = 0; j < radial; j++) {
      const th = (j / radial) * Math.PI * 2;
      const cs = Math.cos(th) * rad, sn = Math.sin(th) * rad;
      pos.push(c.x + N.x * cs + B.x * sn, c.y + N.y * cs + B.y * sn, c.z + N.z * cs + B.z * sn);
      uv.push(j / radial, t);
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < radial; j++) {
      const j2 = (j + 1) % radial;
      const a = i * radial + j, b = i * radial + j2;
      const c = (i + 1) * radial + j, d = (i + 1) * radial + j2;
      idx.push(a, c, b, b, c, d);
    }
  }
  for (const end of [0, 1]) {
    const c = curve.getPoint(end, V.clone());
    const center = pos.length / 3;
    pos.push(c.x, c.y, c.z); uv.push(0.5, end);
    const ring = end === 0 ? 0 : n * radial;
    for (let j = 0; j < radial; j++) {
      const j2 = (j + 1) % radial;
      if (end === 0) idx.push(center, ring + j2, ring + j);
      else idx.push(center, ring + j, ring + j2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** 橢球（頭、關節、耳等小結構用） */
export function ellipsoid(center, radii, seg = 24) {
  const geo = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  geo.scale(radii[0], radii[1], radii[2]);
  geo.translate(center[0], center[1], center[2]);
  return geo;
}

/** 把整條路徑鏡射到另一側（x 取負） */
export function mirrorPath(path) {
  return path.map(p => [-p[0], p[1], p[2]]);
}
