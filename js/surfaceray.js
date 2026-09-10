// 體表射線求交的加速結構
//
// 載入時要把 200 多個穴位、上千個經絡走行點投影到體表上，每次都拿 44,744 個
// 三角形去試會花掉好幾秒。這裡把三角形依「高度」分桶：射線只需要測試它經過的
// 那幾層，實測快 20 倍以上。
//
// 桶只分 y 一個軸就夠了：這些射線幾乎都是從體軸往外水平打出去，y 範圍很窄。

const EPS = 1e-9;

// 同一份體表會被 retarget 與 makeSkinClamp 各要一次，分桶建表約 0.5 秒，共用即可
const cache = new WeakMap();

export function makeSurfaceRay(geometry, bucketCount = 160) {
  const cached = cache.get(geometry);
  if (cached && cached.bucketCount === bucketCount) return cached.fn;
  const fn = buildSurfaceRay(geometry, bucketCount);
  cache.set(geometry, { bucketCount, fn });
  return fn;
}

function buildSurfaceRay(geometry, bucketCount) {
  const pos = geometry.attributes.position.array;
  const index = geometry.index.array;
  const triCount = index.length / 3;

  let minY = Infinity, maxY = -Infinity;
  for (let i = 1; i < pos.length; i += 3) {
    if (pos[i] < minY) minY = pos[i];
    if (pos[i] > maxY) maxY = pos[i];
  }
  const span = Math.max(1e-6, maxY - minY);
  const toBucket = y => Math.max(0, Math.min(bucketCount - 1, Math.floor(((y - minY) / span) * bucketCount)));

  // 先數每桶多少個三角形，再一次配置扁平陣列（比巢狀陣列省記憶體也快）
  const counts = new Int32Array(bucketCount);
  const triLo = new Int32Array(triCount), triHi = new Int32Array(triCount);
  for (let t = 0; t < triCount; t++) {
    const a = index[t * 3] * 3, b = index[t * 3 + 1] * 3, c = index[t * 3 + 2] * 3;
    const y0 = Math.min(pos[a + 1], pos[b + 1], pos[c + 1]);
    const y1 = Math.max(pos[a + 1], pos[b + 1], pos[c + 1]);
    const lo = toBucket(y0), hi = toBucket(y1);
    triLo[t] = lo; triHi[t] = hi;
    for (let k = lo; k <= hi; k++) counts[k]++;
  }
  const starts = new Int32Array(bucketCount + 1);
  for (let k = 0; k < bucketCount; k++) starts[k + 1] = starts[k] + counts[k];
  const items = new Int32Array(starts[bucketCount]);
  const cursor = starts.slice(0, bucketCount);
  for (let t = 0; t < triCount; t++) {
    for (let k = triLo[t]; k <= triHi[t]; k++) items[cursor[k]++] = t;
  }

  const stamp = new Int32Array(triCount);
  let stampId = 0;

  /**
   * @returns {number[]} 命中距離（沿射線方向的 t，由近到遠），呼叫端自行換算座標
   */
  return function intersect(ox, oy, oz, dx, dy, dz, far = 1) {
    stampId++;
    const y0 = Math.min(oy, oy + dy * far), y1 = Math.max(oy, oy + dy * far);
    const lo = toBucket(y0), hi = toBucket(y1);
    const out = [];
    for (let k = lo; k <= hi; k++) {
      for (let s = starts[k]; s < starts[k + 1]; s++) {
        const t = items[s];
        if (stamp[t] === stampId) continue;
        stamp[t] = stampId;

        // Möller–Trumbore
        const ia = index[t * 3] * 3, ib = index[t * 3 + 1] * 3, ic = index[t * 3 + 2] * 3;
        const ax = pos[ia], ay = pos[ia + 1], az = pos[ia + 2];
        const e1x = pos[ib] - ax, e1y = pos[ib + 1] - ay, e1z = pos[ib + 2] - az;
        const e2x = pos[ic] - ax, e2y = pos[ic + 1] - ay, e2z = pos[ic + 2] - az;
        const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
        const det = e1x * px + e1y * py + e1z * pz;
        if (det > -EPS && det < EPS) continue;      // 平行
        const inv = 1 / det;
        const tx = ox - ax, ty = oy - ay, tz = oz - az;
        const u = (tx * px + ty * py + tz * pz) * inv;
        if (u < 0 || u > 1) continue;
        const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
        const vv = (dx * qx + dy * qy + dz * qz) * inv;
        if (vv < 0 || u + vv > 1) continue;
        const hit = (e2x * qx + e2y * qy + e2z * qz) * inv;
        if (hit > EPS && hit <= far) out.push(hit);
      }
    }
    out.sort((a, b) => a - b);
    return out;
  };
}
