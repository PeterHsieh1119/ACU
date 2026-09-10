import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MERIDIANS, REGIONS, POINTS, ROUTES } from '../data/acupoints.js';
import { MUSCLES, MUSCLE_GROUPS } from '../data/muscles.js';
import { PNF_PATTERNS, PNF_REGIONS } from '../data/pnf.js';
import { NERVES, NERVE_GROUPS } from '../data/nerves.js';
import { VESSELS, VESSEL_GROUPS, VESSEL_KINDS } from '../data/vessels.js';
import { buildBody, makeSnapper, bodyAxisPoint } from './body.js';
import { loadAnatomy, mirrorGeometry } from './anatomy.js';
import { makeRetarget, makeAxisPoint, makeSkinClamp } from './retarget.js';
import { tube } from './geom.js';

const $ = id => document.getElementById(id);
const hex = n => '#' + n.toString(16).padStart(6, '0');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ============================================================
// 場景
// ============================================================
const container = $('canvas3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1216);
scene.fog = new THREE.Fog(0x0e1216, 4.5, 9);

const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 50);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxDistance = 6;
controls.minDistance = 0.18;
controls.autoRotateSpeed = 1.1;

const BODY_CENTER = new THREE.Vector3(0, 0.95, 0);
const HOME = { pos: new THREE.Vector3(0.75, 1.30, 2.05), target: BODY_CENTER.clone() };
camera.position.copy(HOME.pos);
controls.target.copy(HOME.target);

scene.add(new THREE.HemisphereLight(0xdfe8f0, 0x2a3038, 1.35));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(1.6, 2.6, 2.2);
scene.add(keyLight);
const fill = new THREE.DirectionalLight(0x93a8bd, 0.75);
fill.position.set(-2.0, 1.4, -1.8);
scene.add(fill);
const rim = new THREE.DirectionalLight(0x6fa8c8, 0.5);
rim.position.set(0, 0.4, -2.4);
scene.add(rim);

const grid = new THREE.GridHelper(4, 40, 0x27313c, 0x1a2027);
grid.material.transparent = true;
grid.material.opacity = 0.55;
scene.add(grid);

function resize() {
  const w = container.clientWidth || 1, h = container.clientHeight || 1;
  renderer.setSize(w, h);   // 需要一併更新 canvas 的 CSS 尺寸，否則在 DPR>1 的裝置上會被放大
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(container);

// ============================================================
// 人體：優先使用真實解剖資料，載入失敗才退回內建示意模型
// ============================================================
const loadingEl = $('loading');
const setLoading = t => { loadingEl.textContent = t; };
const statusEl = $('status');
const setStatus = t => { statusEl.textContent = t; statusEl.style.display = t ? 'block' : 'none'; };
const pct = (got, total) => (total ? ` ${Math.round(got / total * 100)}%` : '');

let anatomy = null;
try {
  anatomy = await loadAnatomy((got, total) => {
    setLoading(total ? `載入體表 ${Math.round(got / total * 100)}%` : '載入體表…');
  });
} catch (err) {
  console.warn('[ACU] 解剖資料載入失敗，改用內建示意模型：', err.message);
}
setLoading('建立模型…');

const bodyGroup = new THREE.Group();
scene.add(bodyGroup);

let skinMat, placePoint, axisPoint;
let clampInside = p => p;   // 體內結構專用：把走行點壓回體表以內

if (anatomy) {
  skinMat = new THREE.MeshStandardMaterial({
    color: 0xdcbaa2, roughness: 0.74, metalness: 0.02,
    transparent: true, opacity: 0.42, depthWrite: false, side: THREE.FrontSide,
  });
  // 深度預繪：真實體表在腋下、指縫、胯下等處會有多層前向面重疊，
  // 半透明直接畫會重複混色而出現斑駁。先只寫深度不上色，再用單層著色。
  // 繪製順序：骨骼(0) → 肌肉(1) → 體表深度(1.5) → 體表(2) → 經絡線(3) → 穴位(4)
  const depthPass = new THREE.Mesh(anatomy.skin.geometry, new THREE.MeshBasicMaterial({
    colorWrite: false, depthWrite: true, transparent: true, side: THREE.FrontSide,
  }));
  depthPass.renderOrder = 1.5;
  bodyGroup.add(depthPass);
  const skin = new THREE.Mesh(anatomy.skin.geometry, skinMat);
  skin.renderOrder = 2;
  bodyGroup.add(skin);
  skinMat.userData.depthPass = depthPass;
  const retarget = makeRetarget(anatomy.landmarks, anatomy.skin.geometry, 0.005);
  const nearestAxis = makeAxisPoint(anatomy.landmarks);
  placePoint = (pos, opts = {}) => retarget(pos, opts);
  axisPoint = nearestAxis;
  clampInside = makeSkinClamp(anatomy.landmarks, anatomy.skin.geometry, 0.012);
} else {
  const built = buildBody();
  bodyGroup.add(built.group);
  skinMat = built.material;
  const snap = makeSnapper(built.collision, 0.005);
  const snapLoose = makeSnapper(built.collision, 0.007, 0.20);
  placePoint = (pos, opts = {}) => {
    if (opts.maxShift === 0) return { p: pos.slice(), n: [0, 0, 1] };   // 只做映射、不吸附體表
    const p = (opts.maxShift ? snapLoose : snap)(pos);
    const n = new THREE.Vector3(...p).sub(bodyAxisPoint(new THREE.Vector3(...p))).normalize();
    return { p, n: [n.x, n.y, n.z] };
  };
  axisPoint = bodyAxisPoint;
}

// 依部位限定體軸，避免胸腹穴位被判給手臂體軸而投影到身體另一側
const CHAINS_BY_REGION = {
  head: ['trunk'], neck: ['trunk'], chest: ['trunk'], abdomen: ['trunk'], back: ['trunk'],
  upper: ['arm'], lower: ['leg', 'foot'],
};

// 穴位落到體表；bilateral 的另一側直接鏡射（模型左右對稱）
const snapped = new Map();          // pointId -> { p:[x,y,z], n:[x,y,z] }（+x 側）
for (const pt of POINTS) {
  snapped.set(pt.id, placePoint(pt.pos, { level: pt.level, lat: pt.lat, allow: CHAINS_BY_REGION[pt.region] }));
}

const pointById = Object.fromEntries(POINTS.map(p => [p.id, p]));
const patternById = Object.fromEntries(PNF_PATTERNS.map(p => [p.id, p]));

function resolveRoutePoint(entry) {
  if (Array.isArray(entry)) return placePoint(entry).p;
  const s = snapped.get(entry);
  return s ? s.p : pointById[entry].pos;
}

// 兩個穴位之間如果距離較遠，直接連線會從身體內部穿過去。
// 這裡把長線段細分，每個補間點再吸附一次體表，經絡線就會沿著身體表面走。
function surfacePolyline(strand) {
  const anchors = strand.map(resolveRoutePoint);
  const out = [];
  const push = p => {
    const last = out[out.length - 1];
    if (last && Math.hypot(p[0] - last[0], p[1] - last[1], p[2] - last[2]) < 0.004) return;
    out.push(p);
  };
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1];
    push(a);
    const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.min(14, Math.floor(d / 0.035));
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      push(placePoint([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], { maxShift: 0.09 }).p);
    }
  }
  push(anchors[anchors.length - 1]);
  return out;
}

// ============================================================
// 經絡線
// ============================================================
const routeGroups = {};
for (const [key, strands] of Object.entries(ROUTES)) {
  const g = new THREE.Group();
  routeGroups[key] = g;
  scene.add(g);
  const mat = new THREE.MeshBasicMaterial({
    color: MERIDIANS[key].color, transparent: true, opacity: 0.75, toneMapped: false,
  });
  for (const strand of strands) {
    const pts = surfacePolyline(strand);
    if (pts.length < 2) continue;
    const steps = Math.min(420, Math.max(48, pts.length * 3));
    const sides = (key === 'REN' || key === 'DU') ? [pts] : [pts, pts.map(p => [-p[0], p[1], p[2]])];
    for (const side of sides) {
      const mesh = new THREE.Mesh(tube(side, { r: 0.0034, taper: [1, 1], radial: 6, tension: 0.2, steps }), mat);
      mesh.renderOrder = 3;
      g.add(mesh);
    }
  }
}

// ============================================================
// 穴位標記（InstancedMesh）
// ============================================================
const R_BASE = 0.0072, R_REL = 0.0105, R_SEL = 0.0155;

const instances = [];   // { pointId, pos, outward }
for (const pt of POINTS) {
  const base = snapped.get(pt.id);
  const sides = (pt.bilateral && Math.abs(base.p[0]) > 1e-4)
    ? [[base.p, base.n], [[-base.p[0], base.p[1], base.p[2]], [-base.n[0], base.n[1], base.n[2]]]]
    : [[base.p, base.n]];
  for (const [pos, nrm] of sides) {
    const outward = new THREE.Vector3(...nrm);
    if (!isFinite(outward.x) || outward.lengthSq() < 0.5) outward.set(0, 0, 1);
    instances.push({ pointId: pt.id, pos, outward: outward.normalize() });
  }
}
const instIndexByPoint = new Map();
instances.forEach((inst, i) => {
  if (!instIndexByPoint.has(inst.pointId)) instIndexByPoint.set(inst.pointId, []);
  instIndexByPoint.get(inst.pointId).push(i);
});

const ptMesh = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 10, 7),
  // transparent + 較大的 renderOrder：讓標記排在皮膚之後才畫，
  // 深度測試就會把身體另一側的穴位擋掉。
  new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, depthWrite: false }),
  instances.length,
);
ptMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
ptMesh.frustumCulled = false;
ptMesh.renderOrder = 4;
scene.add(ptMesh);

const _mat4 = new THREE.Matrix4(), _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion(), _scl = new THREE.Vector3(), _col = new THREE.Color();
const instScale = new Float32Array(instances.length);

function setInstance(i, scale, color) {
  instScale[i] = scale;
  _pos.fromArray(instances[i].pos);
  _scl.setScalar(scale);
  _mat4.compose(_pos, _quat, _scl);
  ptMesh.setMatrixAt(i, _mat4);
  ptMesh.setColorAt(i, _col.setHex(color));
}
instances.forEach((inst, i) => setInstance(i, R_BASE, MERIDIANS[pointById[inst.pointId].meridian].color));
ptMesh.instanceMatrix.needsUpdate = true;
ptMesh.instanceColor.needsUpdate = true;

// ============================================================
// 肌肉
// ============================================================
const muscleGroup = new THREE.Group();
scene.add(muscleGroup);
const muscleMeshes = {};   // id -> { meshes:[], mat }

// 示意幾何：來源解剖資料沒有的肌肉會一直用它，其餘肌肉在真實網格下載完成前先頂著。
// 走行點一樣要搬到真實骨架上，否則會浮在真實體表外面（maxShift 0 = 只映射、不吸附）。
function approxGeometries(mu) {
  const strands = (mu.paths || [mu.path])
    .map(pts => anatomy ? pts.map(p => placePoint(p, { maxShift: 0 }).p) : pts);
  return strands
    .flatMap(pts => mu.midline ? [pts] : [pts, pts.map(p => [-p[0], p[1], p[2]])])
    .map(pts => tube(pts, { r: mu.r, radial: 10 }));
}

function setMuscleGeometries(id, geometries, rec) {
  const prev = muscleMeshes[id];
  if (prev) {
    for (const m of prev.meshes) { muscleGroup.remove(m); m.geometry.dispose(); }
  }
  const mat = (prev && prev.mat) || new THREE.MeshStandardMaterial({
    color: 0xff5a52, emissive: 0x3d0f0f, roughness: 0.55, metalness: 0.0,
    transparent: true, opacity: MUSCLES[id].deep ? 0.55 : 0.92, depthWrite: false,
  });
  const meshes = geometries.map(geo => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    mesh.userData.muscleId = id;
    mesh.renderOrder = 1;
    muscleGroup.add(mesh);
    return mesh;
  });
  muscleMeshes[id] = { meshes, mat, deep: !!MUSCLES[id].deep, real: !!rec, bounds: rec ? rec.bounds : null };
}

for (const [id, mu] of Object.entries(MUSCLES)) setMuscleGeometries(id, approxGeometries(mu), null);

// 真實肌肉網格背景載入，到了再換掉示意幾何
let muscleAssets = anatomy ? 'loading' : 'none';
if (anatomy) {
  setStatus('肌肉網格載入中…');
  anatomy.loadMuscles((got, total) => setStatus(`肌肉網格載入中…${pct(got, total)}`)).then(map => {
    for (const [id, rec] of map) {
      setMuscleGeometries(id, rec.mirror ? [rec.geometry, mirrorGeometry(rec.geometry)] : [rec.geometry], rec);
    }
    muscleAssets = 'ready';
    applyHighlights();
    if (state.sel.kind === 'muscle') showMuscleInfo(state.sel.id);
    setStatus('');
  }).catch(err => {
    console.warn('[ACU] 肌肉網格載入失敗，維持示意幾何：', err.message);
    muscleAssets = 'failed';
    setStatus('');
  });
}

const MUS_BASE = 0xff5a52, MUS_HL = 0xffb057, MUS_SEL = 0xffe08a;

function renderMuscles(highlightIds, highlightColor) {
  const hl = new Set(highlightIds || []);
  for (const [id, rec] of Object.entries(muscleMeshes)) {
    const on = hl.has(id);
    const show = on || state.showAllMuscles;
    for (const m of rec.meshes) m.visible = show;
    if (!show) continue;
    rec.mat.color.setHex(on ? highlightColor : MUS_BASE);
    rec.mat.emissive.setHex(on ? 0x552a00 : 0x2a0a0a);
    const base = rec.deep ? 0.5 : 0.85;
    rec.mat.opacity = on ? (rec.deep ? 0.75 : 0.95) : (state.showAllMuscles ? base * 0.42 : base);
  }
}

// ============================================================
// 神經（示意幾何）
// ============================================================
// 來源解剖資料的 nervous 系統只有中樞神經與眼眶內的顱神經，四肢的周邊神經完全沒有，
// 所以這一層一律用走行控制點掃掠成管線，再 retarget 到真實骨架（maxShift 0＝只映射不吸附）。
// 好處是不用多下載一包資料，代價是位置只到「神經幹大致走在哪裡」的精度。
const NERVE_CHAINS = {
  head_neck: ['trunk'], trunk: ['trunk'],
  upper: ['trunk', 'arm'], lower: ['trunk', 'leg', 'foot'],
};
const NRV_BASE = 0xf2d34e, NRV_HL = 0xfff3b0, NRV_SEL = 0xffffff;

const nerveGroup = new THREE.Group();
scene.add(nerveGroup);
const nerveMeshes = {};   // id -> { meshes, mat, center }

for (const [id, nv] of Object.entries(NERVES)) {
  const allow = NERVE_CHAINS[nv.group];
  const strands = (nv.paths || [nv.path]).map(pts => pts.map(p => clampInside(placePoint(p, { maxShift: 0, allow }).p)));
  const mat = new THREE.MeshStandardMaterial({
    color: NRV_BASE, emissive: 0x4a3a00, roughness: 0.45, metalness: 0.0,
    transparent: true, opacity: 0.95, depthWrite: false,
  });
  const center = new THREE.Vector3();
  let n = 0;
  const meshes = [];
  const polylines = [];
  for (const pts of strands) {
    for (const side of (nv.midline ? [pts] : [pts, pts.map(p => [-p[0], p[1], p[2]])])) {
      const curve = new THREE.CatmullRomCurve3(side.map(q => new THREE.Vector3(...q)), false, 'catmullrom', 0.3);
      const mesh = new THREE.Mesh(tube(side, { r: nv.r, taper: [1, 1], radial: 8, tension: 0.3 }), mat);
      mesh.visible = false;
      mesh.userData.nerveId = id;
      mesh.renderOrder = 1.25;
      nerveGroup.add(mesh);
      meshes.push(mesh);
      // 取樣曲線本身（不是控制點）才問得出「這個穴位離神經幹多遠」
      polylines.push(curve.getPoints(Math.max(16, side.length * 8)));
    }
    for (const p of pts) { center.add(new THREE.Vector3(...p)); n++; }
  }
  nerveMeshes[id] = { meshes, mat, polylines, r: nv.r, center: center.multiplyScalar(1 / Math.max(1, n)) };
}

function renderNerves() {
  const sel = state.sel.kind === 'nerve' ? state.sel.id : null;
  const rel = state.sel.kind === 'nerve' ? null : nervesRelatedToSelection();
  for (const [id, rec] of Object.entries(nerveMeshes)) {
    const on = id === sel;
    const hl = !on && rel && rel.has(id);
    const show = state.showNerves || on || hl;
    for (const m of rec.meshes) m.visible = show;
    if (!show) continue;
    rec.mat.color.setHex(on ? NRV_SEL : hl ? NRV_HL : NRV_BASE);
    rec.mat.opacity = (on || hl) ? 1 : (state.showNerves ? 0.55 : 0.9);
  }
}

// ============================================================
// 血管（真實網格，打開圖層或選取時才下載）
// ============================================================
const vesselGroup = new THREE.Group();
scene.add(vesselGroup);
const vesselMeshes = {};   // id -> { meshes, mat, kind, center }
let vesselAssets = anatomy ? 'idle' : 'none';   // idle | loading | ready | failed | none

const VES_HL = 0xffd166, VES_SEL = 0xffffff;
const vesselBaseColor = kind => (VESSEL_KINDS[kind] || VESSEL_KINDS.artery).color;

async function ensureVessels() {
  if (vesselAssets !== 'idle') return vesselAssets === 'ready';
  vesselAssets = 'loading';
  setStatus('血管網格載入中…');
  try {
    const parts = await anatomy.loadVessels((got, total) => setStatus(`血管網格載入中…${pct(got, total)}`));
    for (const part of parts) {
      const meta = VESSELS[part.key];
      const kind = (meta && meta.kind) || part.kind || 'artery';
      const mat = new THREE.MeshStandardMaterial({
        color: vesselBaseColor(kind), emissive: kind === 'artery' ? 0x3a0c08 : 0x081c33,
        roughness: 0.4, metalness: 0.05, transparent: true, opacity: 0.95, depthWrite: false,
      });
      const geos = part.mirror ? [part.geometry, mirrorGeometry(part.geometry)] : [part.geometry];
      const center = new THREE.Vector3();
      const meshes = geos.map(geo => {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.visible = false;
        mesh.userData.vesselId = part.key;
        mesh.renderOrder = 1.2;
        vesselGroup.add(mesh);
        geo.computeBoundingSphere();
        return mesh;
      });
      // 鏡射的兩份中心會互相抵消成正中線，聚焦時取原始那一份即可
      center.copy(meshes[0].geometry.boundingSphere.center);
      // 每 6 個頂點取一個當距離查詢用的點雲：管壁頂點很密，全取只是白花時間
      const cloud = [];
      for (const m of meshes) {
        const a = m.geometry.attributes.position.array;
        for (let i = 0; i < a.length; i += 18) cloud.push(a[i], a[i + 1], a[i + 2]);
      }
      vesselMeshes[part.key] = { meshes, mat, kind, center, cloud: new Float32Array(cloud) };
    }
    vesselAssets = 'ready';
    setStatus('');
    // 面板上的「鄰近血管」在網格到齊前算不出來，補算一次
    if (state.sel.kind === 'point') showPointInfo(pointById[state.sel.id]);
    return true;
  } catch (err) {
    console.warn('[ACU] 血管網格載入失敗：', err.message);
    vesselAssets = 'failed';
    setStatus('');
    return false;
  }
}

function renderVessels() {
  const sel = state.sel.kind === 'vessel' ? state.sel.id : null;
  const rel = state.sel.kind === 'vessel' ? null : vesselsRelatedToSelection();
  for (const [id, rec] of Object.entries(vesselMeshes)) {
    const on = id === sel;
    const hl = !on && rel && rel.has(id);
    const show = state.showVessels || on || hl;
    for (const m of rec.meshes) m.visible = show;
    if (!show) continue;
    rec.mat.color.setHex(on ? VES_SEL : hl ? VES_HL : vesselBaseColor(rec.kind));
    rec.mat.opacity = (on || hl) ? 1 : (state.showVessels ? 0.6 : 0.9);
  }
}

// ============================================================
// 幾何鄰近查詢
// ============================================================
// 資料裡的 points 是人工整理的「臨床上要注意的組合」，覆蓋不到全部 375 穴。
// 這裡再用幾何補一層：算穴位到神經走行線／血管網格的最短距離，
// 把 3 公分內的一併列出來並標上距離。神經幾何是示意的，所以距離只當數量級參考。
const NEAR_LIMIT = 0.03;

const _na = new THREE.Vector3(), _nb = new THREE.Vector3(), _np = new THREE.Vector3();
function distToPolyline(pos, pts) {
  _np.fromArray(pos);
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    _na.copy(pts[i]); _nb.subVectors(pts[i + 1], _na);
    const l2 = _nb.lengthSq();
    const t = l2 < 1e-12 ? 0 : Math.max(0, Math.min(1, _np.clone().sub(_na).dot(_nb) / l2));
    const d = _na.addScaledVector(_nb, t).distanceToSquared(_np);
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

function nearbyNerves(pos) {
  const out = [];
  for (const [id, rec] of Object.entries(nerveMeshes)) {
    let best = Infinity;
    for (const pl of rec.polylines) best = Math.min(best, distToPolyline(pos, pl) - rec.r);
    if (best <= NEAR_LIMIT) out.push({ id, d: Math.max(0, best) });
  }
  return out.sort((a, b) => a.d - b.d);
}

function nearbyVessels(pos) {
  const out = [];
  for (const [id, rec] of Object.entries(vesselMeshes)) {
    const c = rec.cloud;
    let best = Infinity;
    for (let i = 0; i < c.length; i += 3) {
      const dx = c[i] - pos[0], dy = c[i + 1] - pos[1], dz = c[i + 2] - pos[2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < best) best = d;
    }
    best = Math.sqrt(best);
    if (best <= NEAR_LIMIT) out.push({ id, d: best });
  }
  return out.sort((a, b) => a.d - b.d);
}

// ============================================================
// 反查索引：穴位 / 肌肉 → 神經、血管
// ============================================================
const nervesOfPoint = {}, nervesOfMuscle = {}, vesselsOfPoint = {};
for (const [id, nv] of Object.entries(NERVES)) {
  for (const p of nv.points) (nervesOfPoint[p] ||= []).push(id);
  for (const m of nv.muscles) (nervesOfMuscle[m] ||= []).push(id);
}
for (const [id, ve] of Object.entries(VESSELS)) {
  for (const p of ve.points) (vesselsOfPoint[p] ||= []).push(id);
}
const nervesOfPattern = pat => [...new Set(pat.muscles.flatMap(m => nervesOfMuscle[m] || []))];

/** 穴位的鄰近結構＝人工整理的組合 ∪ 幾何 3 公分內的；回傳已排序、標好距離的清單 */
const _nbCache = new Map();
function neighboursOfPoint(id) {
  const key = id + '|' + vesselAssets;
  let hit = _nbCache.get(key);
  if (hit) return hit;
  const pos = snapped.get(id).p;
  const curatedN = new Set(nervesOfPoint[id] || []);
  const curatedV = new Set(vesselsOfPoint[id] || []);
  const near = new Map(nearbyNerves(pos).map(x => [x.id, x.d]));
  const nearV = new Map(nearbyVessels(pos).map(x => [x.id, x.d]));
  const merge = (curated, dists, all) => [
    ...[...curated].map(k => ({ id: k, d: dists.get(k), curated: true })),
    ...[...dists.keys()].filter(k => !curated.has(k)).map(k => ({ id: k, d: dists.get(k), curated: false })),
  ].filter(x => all[x.id]).sort((a, b) => (b.curated - a.curated) || ((a.d ?? 9) - (b.d ?? 9)));
  hit = { nerves: merge(curatedN, near, NERVES), vessels: merge(curatedV, nearV, VESSELS) };
  _nbCache.set(key, hit);
  return hit;
}
const pointsOfNerve = id => NERVES[id].points.map(p => pointById[p]).filter(Boolean);
const pointsOfVessel = id => VESSELS[id].points.map(p => pointById[p]).filter(Boolean);

// ============================================================
// 狀態
// ============================================================
const state = {
  sel: { kind: null, id: null },        // 'point' | 'muscle' | 'pattern' | 'nerve' | 'vessel'
  meriVisible: Object.fromEntries(Object.keys(MERIDIANS).map(k => [k, true])),
  regions: new Set(),                   // 空集合 = 全部
  query: '',
  mquery: '',
  nquery: '',
  showRoutes: true,
  showLabels: false,
  showAllMuscles: false,
  showNerves: false,
  showVessels: false,
};

const pointsOfPattern = pat => POINTS.filter(pt => pt.muscles.some(m => pat.muscles.includes(m)));
const patternsOfPoint = pt => PNF_PATTERNS.filter(pat => pat.muscles.some(m => pt.muscles.includes(m)));
const patternsOfMuscle = id => PNF_PATTERNS.filter(pat => pat.muscles.includes(id));
const pointsOfMuscle = id => POINTS.filter(pt => pt.muscles.includes(id));

function matchesQuery(pt) {
  const q = state.query;
  if (!q) return true;
  return (pt.name + pt.code + pt.id + pt.loc + pt.ind + (pt.tags || []).join('')).toLowerCase().includes(q);
}
function passesFilter(pt) {
  return state.meriVisible[pt.meridian]
    && (state.regions.size === 0 || state.regions.has(pt.region))
    && matchesQuery(pt);
}
function filteredPoints() { return POINTS.filter(passesFilter); }

// ============================================================
// 高亮
// ============================================================
/** 目前選取的東西「牽涉到哪些神經 / 血管」，用來在 3D 場景裡一併點亮 */
function nervesRelatedToSelection() {
  const { kind, id } = state.sel;
  if (kind === 'point') return new Set(neighboursOfPoint(id).nerves.map(x => x.id));
  if (kind === 'muscle') return new Set(nervesOfMuscle[id] || []);
  if (kind === 'pattern') return new Set(nervesOfPattern(patternById[id]));
  return null;
}
function vesselsRelatedToSelection() {
  const { kind, id } = state.sel;
  if (kind === 'point') return new Set(neighboursOfPoint(id).vessels.map(x => x.id));
  return null;
}

function relatedSets() {
  const { kind, id } = state.sel;
  if (kind === 'pattern') {
    const pat = patternById[id];
    return { points: new Set(pointsOfPattern(pat).map(p => p.id)), muscles: pat.muscles, color: MUS_HL };
  }
  if (kind === 'muscle') {
    return { points: new Set(pointsOfMuscle(id).map(p => p.id)), muscles: [id], color: MUS_SEL };
  }
  if (kind === 'point') {
    const pt = pointById[id];
    return { points: new Set([id]), muscles: pt.muscles, color: MUS_HL };
  }
  if (kind === 'nerve') {
    return { points: new Set(NERVES[id].points), muscles: NERVES[id].muscles, color: MUS_HL };
  }
  if (kind === 'vessel') {
    return { points: new Set(VESSELS[id].points), muscles: [], color: MUS_HL };
  }
  return { points: new Set(), muscles: [], color: MUS_HL };
}

function applyHighlights() {
  const rel = relatedSets();
  for (let i = 0; i < instances.length; i++) {
    const pt = pointById[instances[i].pointId];
    if (!passesFilter(pt)) { setInstance(i, 0, 0x000000); continue; }
    const isSel = state.sel.kind === 'point' && state.sel.id === pt.id;
    const isRel = rel.points.has(pt.id);
    const color = isSel ? 0xffffff : isRel ? 0xfff0a8 : MERIDIANS[pt.meridian].color;
    setInstance(i, isSel ? R_SEL : isRel ? R_REL : R_BASE, color);
  }
  ptMesh.instanceMatrix.needsUpdate = true;
  ptMesh.instanceColor.needsUpdate = true;

  renderMuscles(rel.muscles, rel.color);
  renderNerves();
  renderVessels();

  for (const [k, g] of Object.entries(routeGroups)) g.visible = state.showRoutes && state.meriVisible[k];
  labelsDirty = true;
}

// ============================================================
// 資訊面板
// ============================================================
const infoEl = $('info'), infoBody = $('info-body');

function closeInfo() {
  infoEl.classList.remove('show');
  state.sel = { kind: null, id: null };
  syncSidebarSelection();
  applyHighlights();
  writeHash();
}
$('info-close').onclick = closeInfo;

function musTags(ids) {
  if (!ids.length) return '<span style="color:var(--dim2)">（此處無定義之骨骼肌，多位於腱、骨面或孔隙）</span>';
  return ids.map(id => `<span class="tag mus" data-mus="${id}">${MUSCLES[id] ? MUSCLES[id].name : id}</span>`).join('');
}
function pnfTags(list) {
  if (!list.length) return '<span style="color:var(--dim2)">無直接對應</span>';
  return list.map(p => `<span class="tag pnf" data-pat="${p.id}">${esc(p.name)}</span>`).join('');
}
function ptTags(list, limit = 40) {
  if (!list.length) return '<span style="color:var(--dim2)">無</span>';
  const shown = list.slice(0, limit);
  const more = list.length > limit ? `<span style="color:var(--dim2);font-size:11px"> …等 ${list.length} 穴</span>` : '';
  return shown.map(p => `<span class="tag pt" data-pt="${p.id}">${esc(p.name)}</span>`).join('') + more;
}

const cm = d => (d == null ? '' : `<span class="dist">${d < 0.005 ? '貼近' : (d * 100).toFixed(1) + ' cm'}</span>`);

function nrvTags(list, empty = '無對應資料') {
  if (!list || !list.length) return `<span style="color:var(--dim2)">${empty}</span>`;
  return list.map(x => {
    const id = typeof x === 'string' ? x : x.id;
    return `<span class="tag nrv" data-nrv="${id}">${esc(NERVES[id].name)}${typeof x === 'string' ? '' : cm(x.d)}</span>`;
  }).join('');
}
function vesTags(list, empty = '無鄰近的主要血管') {
  if (!list || !list.length) return `<span style="color:var(--dim2)">${empty}</span>`;
  return list.map(x => {
    const id = typeof x === 'string' ? x : x.id;
    const v = VESSELS[id];
    return `<span class="tag ves ${v.kind}" data-ves="${id}">${esc(v.name)}${typeof x === 'string' ? '' : cm(x.d)}</span>`;
  }).join('');
}

function bindInfoTags() {
  infoBody.querySelectorAll('[data-mus]').forEach(el => el.onclick = () => selectMuscle(el.dataset.mus));
  infoBody.querySelectorAll('[data-pat]').forEach(el => el.onclick = () => selectPattern(el.dataset.pat));
  infoBody.querySelectorAll('[data-pt]').forEach(el => el.onclick = () => selectPoint(el.dataset.pt));
  infoBody.querySelectorAll('[data-nrv]').forEach(el => el.onclick = () => selectNerve(el.dataset.nrv));
  infoBody.querySelectorAll('[data-ves]').forEach(el => el.onclick = () => selectVessel(el.dataset.ves));
}

function showPointInfo(pt) {
  const meta = MERIDIANS[pt.meridian];
  const nb = neighboursOfPoint(pt.id);
  const sibs = POINTS.filter(p => p.meridian === pt.meridian);
  const i = sibs.indexOf(pt);
  const tags = (pt.tags || []).map(t => `<span class="tag attr">${esc(t)}</span>`).join('');
  infoBody.innerHTML = `
    <h2>${esc(pt.name)}<small>${esc(pt.code)}</small></h2>
    <div class="sub" style="color:${hex(meta.color)}">${meta.name} · ${REGIONS[pt.region] || ''}</div>
    ${tags ? `<div>${tags}</div>` : ''}
    <dl>
      <dt>定位</dt><dd>${esc(pt.loc)}</dd>
      <dt>主治</dt><dd>${esc(pt.ind)}</dd>
      <dt>刺法參考</dt><dd>${esc(pt.depth)}</dd>
      <dt>下方／鄰近肌肉</dt><dd>${musTags(pt.muscles)}</dd>
      <dt>鄰近神經</dt><dd>${nrvTags(nb.nerves)}</dd>
      <dt>鄰近血管</dt><dd>${vesTags(nb.vessels, vesselAssets === 'ready' ? '3 公分內沒有列入的主要血管' : '打開「血管」圖層後才會計算')}</dd>
      <dt>相關 PNF 模式（共用肌肉）</dt><dd>${pnfTags(patternsOfPoint(pt))}</dd>
    </dl>
    <div class="navrow">
      <button data-nav="prev" ${i <= 0 ? 'disabled' : ''}>← ${i > 0 ? esc(sibs[i - 1].name) : '—'}</button>
      <button data-nav="next" ${i >= sibs.length - 1 ? 'disabled' : ''}>${i < sibs.length - 1 ? esc(sibs[i + 1].name) : '—'} →</button>
    </div>
    <div class="warn">座標為示意近似、深度為教科書參考值，僅供學習，不可作為臨床操作依據。
      標了距離的項目是由模型幾何算出的「3 公分內」結構，神經幾何為示意走行，距離只作數量級參考。</div>`;
  infoEl.classList.add('show');
  infoEl.scrollTop = 0;
  bindInfoTags();
  infoBody.querySelectorAll('[data-nav]').forEach(el => el.onclick = () => {
    const t = el.dataset.nav === 'prev' ? sibs[i - 1] : sibs[i + 1];
    if (t) selectPoint(t.id);
  });
}

function showMuscleInfo(id) {
  const mu = MUSCLES[id];
  infoBody.innerHTML = `
    <h2>${esc(mu.name)}</h2>
    <div class="sub" style="color:var(--dim)">${esc(mu.latin)} · ${MUSCLE_GROUPS[mu.group] || ''}${mu.deep ? ' · 深層' : ''}</div>
    <dl>
      <dt>起點</dt><dd>${esc(mu.origin)}</dd>
      <dt>止點</dt><dd>${esc(mu.insertion)}</dd>
      <dt>作用</dt><dd>${esc(mu.action)}</dd>
      <dt>神經支配</dt><dd>${esc(mu.nerve)}${(nervesOfMuscle[id] || []).length ? `<div style="margin-top:5px">${nrvTags(nervesOfMuscle[id])}</div>` : ''}</dd>
      <dt>其上／鄰近穴位</dt><dd>${ptTags(pointsOfMuscle(id))}</dd>
      <dt>參與的 PNF 模式</dt><dd>${pnfTags(patternsOfMuscle(id))}</dd>
    </dl>
    <div class="warn">${muscleMeshes[id] && muscleMeshes[id].real
      ? '幾何取自 BodyParts3D 解剖模型（CC BY 4.0），為教學用簡化網格。'
      : muscleAssets === 'loading'
        ? '真實解剖網格載入中，目前顯示的是示意幾何。'
        : '來源解剖資料未包含此肌肉，此處以簡化示意幾何（起止線＋梭形肌腹）表示。'}</div>`;
  infoEl.classList.add('show');
  infoEl.scrollTop = 0;
  bindInfoTags();
}

function showPatternInfo(pat) {
  const pair = pat.pair ? patternById[pat.pair] : null;
  infoBody.innerHTML = `
    <h2>${esc(pat.name)}</h2>
    <div class="sub" style="color:var(--hot)">${esc(pat.region)}${pair ? ` · 拮抗模式：<span class="tag pnf" data-pat="${pair.id}">${esc(pair.name)}</span>` : ''}</div>
    <dl>
      <dt>動作組成</dt><dd>${esc(pat.motion)}</dd>
      <dt>口訣</dt><dd>${esc(pat.cue)}</dd>
      ${pat.grip ? `<dt>徒手接觸</dt><dd>${esc(pat.grip)}</dd>` : ''}
      ${pat.clinical ? `<dt>功能與臨床</dt><dd>${esc(pat.clinical)}</dd>` : ''}
      ${pat.technique ? `<dt>常用技術</dt><dd>${esc(pat.technique)}</dd>` : ''}
      <dt>主要肌肉成分</dt><dd>${musTags(pat.muscles)}</dd>
      <dt>支配神經</dt><dd>${nrvTags(nervesOfPattern(pat))}</dd>
      <dt>建議參考穴位（位於模式肌肉鏈上）</dt><dd>${ptTags(pointsOfPattern(pat))}</dd>
    </dl>
    <div class="warn">肌肉成分整理自 Voss/Knott 傳統與《PNF in Practice》；穴位建議由「穴位–肌肉」對應自動推得，供選穴思路參考，非治療處方。</div>`;
  infoEl.classList.add('show');
  infoEl.scrollTop = 0;
  bindInfoTags();
}

function showNerveInfo(id) {
  const nv = NERVES[id];
  infoBody.innerHTML = `
    <h2>${esc(nv.name)}</h2>
    <div class="sub" style="color:${hex(NRV_BASE)}">${esc(nv.latin)} · ${esc(nv.roots)} · ${NERVE_GROUPS[nv.group] || ''}</div>
    <dl>
      <dt>走行</dt><dd>${esc(nv.course)}</dd>
      <dt>支配</dt><dd>${esc(nv.supply)}</dd>
      <dt>支配肌肉</dt><dd>${nv.muscles.length ? musTags(nv.muscles) : '<span style="color:var(--dim2)">純感覺神經，無運動支配</span>'}</dd>
      <dt>走行上／鄰近穴位</dt><dd>${ptTags(pointsOfNerve(id))}</dd>
      <dt>相關 PNF 模式</dt><dd>${pnfTags(PNF_PATTERNS.filter(p => p.muscles.some(m => nv.muscles.includes(m))))}</dd>
      <dt>針刺注意</dt><dd>${esc(nv.caution)}</dd>
    </dl>
    <div class="warn">⚠ 來源解剖資料（BodyParts3D）未收錄四肢周邊神經，此處的走行是依解剖描述繪製的<b>示意管線</b>，
      代表神經幹大致經過的區域，不是斷層重建，不可用於判斷實際穿刺路徑。</div>`;
  infoEl.classList.add('show');
  infoEl.scrollTop = 0;
  bindInfoTags();
}

function showVesselInfo(id) {
  const ve = VESSELS[id];
  const kind = VESSEL_KINDS[ve.kind];
  infoBody.innerHTML = `
    <h2>${esc(ve.name)}</h2>
    <div class="sub" style="color:${hex(kind.color)}">${esc(ve.latin)} · ${kind.name} · ${VESSEL_GROUPS[ve.group] || ''}</div>
    <dl>
      <dt>走行</dt><dd>${esc(ve.course)}</dd>
      <dt>鄰近穴位</dt><dd>${ptTags(pointsOfVessel(id))}</dd>
      <dt>針刺注意</dt><dd>${esc(ve.caution)}</dd>
    </dl>
    <div class="warn">${vesselAssets === 'ready'
      ? '幾何取自 BodyParts3D 解剖模型（CC BY 4.0），為教學用簡化網格。'
      : vesselAssets === 'loading' ? '血管網格載入中…'
        : '血管網格尚未載入或載入失敗，僅顯示文字資料。'}</div>`;
  infoEl.classList.add('show');
  infoEl.scrollTop = 0;
  bindInfoTags();
}

// ============================================================
// 選取
// ============================================================
function selectPoint(id, opts = {}) {
  const pt = pointById[id];
  if (!pt) return;
  state.sel = { kind: 'point', id };
  if (!state.meriVisible[pt.meridian]) toggleMeridian(pt.meridian, true);
  if (state.regions.size && !state.regions.has(pt.region)) { state.regions.clear(); renderRegionChips(); }
  if (!matchesQuery(pt)) { state.query = ''; $('search').value = ''; }
  renderPointList();
  syncSidebarSelection();
  applyHighlights();
  showPointInfo(pt);
  if (opts.focus !== false) focusOnPoint(id);
  writeHash();
  closeDrawerOnMobile();
}

function selectMuscle(id, opts = {}) {
  if (!MUSCLES[id]) return;
  state.sel = { kind: 'muscle', id };
  switchTab('pane-muscle');
  syncSidebarSelection();
  applyHighlights();
  showMuscleInfo(id);
  if (opts.focus !== false) focusOnVector(muscleCenter(id), 0.85);
  writeHash();
  closeDrawerOnMobile();
}

function selectPattern(id, opts = {}) {
  const pat = patternById[id];
  if (!pat) return;
  state.sel = { kind: 'pattern', id };
  switchTab('pane-pnf');
  syncSidebarSelection();
  applyHighlights();
  showPatternInfo(pat);
  if (opts.focus === true) focusHome();
  writeHash();
  closeDrawerOnMobile();
}

function selectNerve(id, opts = {}) {
  if (!NERVES[id]) return;
  state.sel = { kind: 'nerve', id };
  switchTab('pane-nv');
  syncSidebarSelection();
  applyHighlights();
  showNerveInfo(id);
  if (opts.focus !== false) focusOnVector(nerveMeshes[id].center.clone(), 0.8);
  writeHash();
  closeDrawerOnMobile();
}

function selectVessel(id, opts = {}) {
  if (!VESSELS[id]) return;
  state.sel = { kind: 'vessel', id };
  switchTab('pane-nv');
  syncSidebarSelection();
  applyHighlights();
  showVesselInfo(id);
  // 網格是延遲下載的，到了再補畫、補聚焦
  if (vesselAssets === 'idle') {
    ensureVessels().then(ok => {
      if (!ok || state.sel.kind !== 'vessel' || state.sel.id !== id) { if (ok) applyHighlights(); return; }
      applyHighlights();
      showVesselInfo(id);
      if (opts.focus !== false) focusOnVector(vesselMeshes[id].center.clone(), 0.8);
    });
  } else if (opts.focus !== false && vesselMeshes[id]) {
    focusOnVector(vesselMeshes[id].center.clone(), 0.8);
  }
  writeHash();
  closeDrawerOnMobile();
}

function muscleCenter(id) {
  const rec = muscleMeshes[id];
  if (rec && rec.bounds) {
    const [a, b] = rec.bounds;
    return new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  }
  const pts = (MUSCLES[id].paths || [MUSCLES[id].path]).flat();
  const v = new THREE.Vector3();
  for (const p of pts) v.add(new THREE.Vector3(...p));
  return v.multiplyScalar(1 / pts.length);
}

// ============================================================
// 鏡頭
// ============================================================
let camAnim = null;
const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function flyTo(toPos, toTarget, dur = 650) {
  camAnim = {
    t0: performance.now(), dur,
    fromPos: camera.position.clone(), fromTarget: controls.target.clone(),
    toPos: toPos.clone(), toTarget: toTarget.clone(),
  };
}

// 直向手機的水平視角很窄，固定距離會過度放大；改成由「想看到多大範圍」反推距離。
function distanceFor(regionSize) {
  const vFov = camera.fov * Math.PI / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  const fov = Math.min(vFov, hFov);
  return Math.max(0.35, Math.min(3, (regionSize / 2) / Math.tan(fov / 2)));
}

// 從體表外側看向目標，並把主體挪開資訊面板：
// 桌機的面板在右側 → 畫面往右平移，主體就落在左半邊；
// 手機的資訊卡從下方蓋住大半畫面 → 畫面往下平移，主體落在上半部。
// 平移量按「畫面框」的比例算，才不會在不同距離下失準。
const _right = new THREE.Vector3(), _up = new THREE.Vector3(), _dir = new THREE.Vector3();

function framedFlyTo(target, outward, regionSize) {
  const dist = distanceFor(regionSize);
  const viewH = 2 * dist * Math.tan(camera.fov * Math.PI / 360);
  const camPos = target.clone().addScaledVector(outward, dist);
  _dir.subVectors(target, camPos).normalize();
  _right.crossVectors(_dir, camera.up).normalize();
  _up.crossVectors(_right, _dir).normalize();

  const shift = new THREE.Vector3();
  if (window.innerWidth <= 880) shift.addScaledVector(_up, -0.24 * viewH);
  else shift.addScaledVector(_right, 0.16 * viewH * camera.aspect);
  flyTo(camPos.add(shift), target.clone().add(shift));
}

function focusOnPoint(id) {
  // 選離目前鏡頭較近的那一側，並從體表外側觀看
  const idxs = instIndexByPoint.get(id) || [];
  if (!idxs.length) return;
  let best = idxs[0], bestD = Infinity;
  for (const i of idxs) {
    const d = camera.position.distanceToSquared(_pos.fromArray(instances[i].pos));
    if (d < bestD) { bestD = d; best = i; }
  }
  const inst = instances[best];
  framedFlyTo(new THREE.Vector3(...inst.pos), inst.outward, 0.62);
}

function focusOnVector(v, regionSize = 0.8) {
  const outward = v.clone().sub(axisPoint(v));
  if (outward.lengthSq() < 1e-6) outward.set(0, 0, 1);
  framedFlyTo(v, outward.normalize(), regionSize);
}

function focusHome() { flyTo(HOME.pos, HOME.target); }

const VIEWS = {
  front: [0, 1.05, 2.35], back: [0, 1.05, -2.35],
  left: [-2.35, 1.05, 0.01], right: [2.35, 1.05, 0.01],
  top: [0.01, 3.1, 0.35],
};
function setView(name) {
  const v = VIEWS[name];
  if (!v) return;
  flyTo(new THREE.Vector3(...v), BODY_CENTER.clone());
}

// ============================================================
// 側欄
// ============================================================
function switchTab(paneId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.pane === paneId));
  document.querySelectorAll('.pane').forEach(p => p.classList.toggle('active', p.id === paneId));
}
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.pane)));

// --- 部位 chips ---
function renderRegionChips() {
  const box = $('region-chips');
  box.innerHTML = '';
  for (const [k, label] of Object.entries(REGIONS)) {
    const n = POINTS.filter(p => p.region === k).length;
    const el = document.createElement('span');
    el.className = 'chip' + (state.regions.has(k) ? ' on' : '');
    el.textContent = `${label} ${n}`;
    el.onclick = () => {
      state.regions.has(k) ? state.regions.delete(k) : state.regions.add(k);
      renderRegionChips(); renderPointList(); applyHighlights();
    };
    box.appendChild(el);
  }
}

// --- 經絡清單 ---
const merilist = $('merilist');
for (const [key, meta] of Object.entries(MERIDIANS)) {
  const n = POINTS.filter(p => p.meridian === key).length;
  const row = document.createElement('div');
  row.className = 'mrow';
  row.innerHTML = `<span class="mdot" style="background:${hex(meta.color)}"></span>
    <input type="checkbox" checked data-meri="${key}"> ${meta.name} <span class="cnt">${n}穴</span>`;
  row.querySelector('input').addEventListener('change', e => toggleMeridian(key, e.target.checked));
  row.addEventListener('click', e => {
    if (e.target.tagName === 'INPUT') return;
    const cb = row.querySelector('input');
    toggleMeridian(key, !cb.checked);
  });
  merilist.appendChild(row);
}
function toggleMeridian(key, on) {
  state.meriVisible[key] = on;
  const cb = merilist.querySelector(`input[data-meri="${key}"]`);
  if (cb) cb.checked = on;
  renderPointList();
  applyHighlights();
}
$('btn-all').onclick = e => { e.preventDefault(); Object.keys(MERIDIANS).forEach(k => toggleMeridian(k, true)); };
$('btn-none').onclick = e => { e.preventDefault(); Object.keys(MERIDIANS).forEach(k => toggleMeridian(k, false)); };

// --- 穴位清單 ---
const ptlist = $('ptlist');
function renderPointList() {
  const list = filteredPoints();
  $('ptcount').textContent = `穴位清單（${list.length} / ${POINTS.length}）`;
  ptlist.innerHTML = '';
  if (!list.length) {
    ptlist.innerHTML = '<div class="empty">沒有符合條件的穴位</div>';
    return;
  }
  const frag = document.createDocumentFragment();
  for (const pt of list) {
    const row = document.createElement('div');
    row.className = 'prow' + (state.sel.kind === 'point' && state.sel.id === pt.id ? ' sel' : '');
    row.dataset.pt = pt.id;
    row.innerHTML = `<span class="code">${esc(pt.code)}</span><span class="nm">${esc(pt.name)}</span>
      <span class="mer" style="color:${hex(MERIDIANS[pt.meridian].color)}">${MERIDIANS[pt.meridian].short}</span>`;
    row.onclick = () => selectPoint(pt.id);
    frag.appendChild(row);
  }
  ptlist.appendChild(frag);
}

const searchEl = $('search');
searchEl.addEventListener('input', () => {
  state.query = searchEl.value.trim().toLowerCase();
  renderPointList();
  applyHighlights();
});
$('search-clear').onclick = () => { searchEl.value = ''; state.query = ''; renderPointList(); applyHighlights(); };

// --- 肌肉清單 ---
const muslist = $('muslist');
function renderMuscleList() {
  const q = state.mquery;
  muslist.innerHTML = '';
  let total = 0;
  for (const [gk, gname] of Object.entries(MUSCLE_GROUPS)) {
    const items = Object.entries(MUSCLES).filter(([id, mu]) =>
      mu.group === gk && (!q || (mu.name + mu.latin + mu.action + mu.origin + mu.insertion).toLowerCase().includes(q)));
    if (!items.length) continue;
    total += items.length;
    const d = document.createElement('details');
    d.className = 'group';
    d.open = !!q || gk === 'shoulder' || gk === 'arm';
    d.innerHTML = `<summary>${gname}<span class="sp" style="color:var(--dim2);font-size:10.5px">${items.length}</span></summary>`;
    for (const [id, mu] of items) {
      const row = document.createElement('div');
      row.className = 'prow' + (state.sel.kind === 'muscle' && state.sel.id === id ? ' sel' : '');
      row.dataset.mus = id;
      row.innerHTML = `<span class="nm">${esc(mu.name)}${mu.deep ? '<span style="color:var(--dim2);font-size:10px"> 深</span>' : ''}</span>
        <span class="mer" style="color:var(--dim2);font-size:10px">${esc(mu.latin)}</span>`;
      row.onclick = () => selectMuscle(id);
      d.appendChild(row);
    }
    muslist.appendChild(d);
  }
  if (!total) muslist.innerHTML = '<div class="empty">沒有符合條件的肌肉</div>';
}
const msearchEl = $('msearch');
msearchEl.addEventListener('input', () => { state.mquery = msearchEl.value.trim().toLowerCase(); renderMuscleList(); });
$('msearch-clear').onclick = () => { msearchEl.value = ''; state.mquery = ''; renderMuscleList(); };
$('mclear').onclick = () => { if (state.sel.kind === 'muscle') closeInfo(); };

// --- PNF 清單 ---
const pnflist = $('pnflist');
function renderPnfList() {
  pnflist.innerHTML = '';
  for (const [rk, rname] of Object.entries(PNF_REGIONS)) {
    const items = PNF_PATTERNS.filter(p => p.regionKey === rk);
    if (!items.length) continue;
    const d = document.createElement('details');
    d.className = 'group';
    d.open = true;
    d.innerHTML = `<summary>${rname}<span class="sp" style="color:var(--dim2);font-size:10.5px">${items.length}</span></summary>`;
    for (const pat of items) {
      const b = document.createElement('button');
      b.className = 'pnfbtn' + (state.sel.kind === 'pattern' && state.sel.id === pat.id ? ' sel' : '');
      b.dataset.pat = pat.id;
      b.innerHTML = `${esc(pat.name)}<small>${esc(pat.motion.split('｜')[0])}</small>`;
      b.onclick = () => selectPattern(pat.id);
      d.appendChild(b);
    }
    pnflist.appendChild(d);
  }
}
$('pnfclear').onclick = () => { if (state.sel.kind === 'pattern') closeInfo(); };

// --- 神經與血管清單 ---
const nvlist = $('nvlist');
function renderNerveVesselList() {
  const q = state.nquery;
  const hit = (...fields) => !q || fields.join(' ').toLowerCase().includes(q);
  nvlist.innerHTML = '';
  let total = 0;

  for (const [gk, gname] of Object.entries(NERVE_GROUPS)) {
    const items = Object.entries(NERVES).filter(([, nv]) => nv.group === gk && hit(nv.name, nv.latin, nv.roots, nv.supply, nv.caution));
    if (!items.length) continue;
    total += items.length;
    const d = document.createElement('details');
    d.className = 'group';
    d.open = true;
    d.innerHTML = `<summary>神經 · ${gname}<span class="sp" style="color:var(--dim2);font-size:10.5px">${items.length}</span></summary>`;
    for (const [id, nv] of items) {
      const row = document.createElement('div');
      row.className = 'prow' + (state.sel.kind === 'nerve' && state.sel.id === id ? ' sel' : '');
      row.dataset.nrv = id;
      row.innerHTML = `<span class="mdot" style="background:${hex(NRV_BASE)}"></span><span class="nm">${esc(nv.name)}</span>
        <span class="mer" style="color:var(--dim2);font-size:10px">${esc(nv.roots)}</span>`;
      row.onclick = () => selectNerve(id);
      d.appendChild(row);
    }
    nvlist.appendChild(d);
  }

  for (const [gk, gname] of Object.entries(VESSEL_GROUPS)) {
    const items = Object.entries(VESSELS).filter(([, ve]) => ve.group === gk && hit(ve.name, ve.latin, ve.course, ve.caution));
    if (!items.length) continue;
    total += items.length;
    const d = document.createElement('details');
    d.className = 'group';
    d.open = true;
    d.innerHTML = `<summary>血管 · ${gname}<span class="sp" style="color:var(--dim2);font-size:10.5px">${items.length}</span></summary>`;
    for (const [id, ve] of items) {
      const row = document.createElement('div');
      row.className = 'prow' + (state.sel.kind === 'vessel' && state.sel.id === id ? ' sel' : '');
      row.dataset.ves = id;
      row.innerHTML = `<span class="mdot" style="background:${hex(VESSEL_KINDS[ve.kind].color)}"></span><span class="nm">${esc(ve.name)}</span>
        <span class="mer" style="color:var(--dim2);font-size:10px">${VESSEL_KINDS[ve.kind].name}</span>`;
      row.onclick = () => selectVessel(id);
      d.appendChild(row);
    }
    nvlist.appendChild(d);
  }

  if (!total) nvlist.innerHTML = '<div class="empty">沒有符合條件的神經或血管</div>';
}
const nsearchEl = $('nsearch');
nsearchEl.addEventListener('input', () => { state.nquery = nsearchEl.value.trim().toLowerCase(); renderNerveVesselList(); });
$('nsearch-clear').onclick = () => { nsearchEl.value = ''; state.nquery = ''; renderNerveVesselList(); };
$('nvclear').onclick = () => { if (state.sel.kind === 'nerve' || state.sel.kind === 'vessel') closeInfo(); };

function syncSidebarSelection() {
  document.querySelectorAll('.prow[data-pt]').forEach(r => r.classList.toggle('sel', state.sel.kind === 'point' && r.dataset.pt === state.sel.id));
  document.querySelectorAll('.prow[data-mus]').forEach(r => r.classList.toggle('sel', state.sel.kind === 'muscle' && r.dataset.mus === state.sel.id));
  document.querySelectorAll('.pnfbtn').forEach(b => b.classList.toggle('sel', state.sel.kind === 'pattern' && b.dataset.pat === state.sel.id));
  document.querySelectorAll('.prow[data-nrv]').forEach(r => r.classList.toggle('sel', state.sel.kind === 'nerve' && r.dataset.nrv === state.sel.id));
  document.querySelectorAll('.prow[data-ves]').forEach(r => r.classList.toggle('sel', state.sel.kind === 'vessel' && r.dataset.ves === state.sel.id));
  const row = ptlist.querySelector('.prow.sel');
  if (row) row.scrollIntoView({ block: 'nearest' });
}

// ============================================================
// 圖層與視角控制
// ============================================================
$('op-slider').addEventListener('input', e => {
  const v = e.target.value / 100;
  skinMat.opacity = v;
  bodyGroup.visible = v > 0.005;   // 體表關掉時，深度預繪也一起關，穴位才會全部露出來
});
$('tg-routes').addEventListener('change', e => { state.showRoutes = e.target.checked; applyHighlights(); });
$('tg-labels').addEventListener('change', e => { state.showLabels = e.target.checked; labelsDirty = true; });
$('tg-allmus').addEventListener('change', e => { state.showAllMuscles = e.target.checked; applyHighlights(); });

$('tg-nerves').addEventListener('change', e => { state.showNerves = e.target.checked; applyHighlights(); });

// 血管網格是額外的一包資料，第一次打開才下載
const vesselToggle = $('tg-vessels');
if (!anatomy) { vesselToggle.disabled = true; vesselToggle.parentElement.style.opacity = 0.4; }
vesselToggle.addEventListener('change', async e => {
  state.showVessels = e.target.checked;
  applyHighlights();
  if (!state.showVessels || vesselAssets !== 'idle') return;
  vesselToggle.parentElement.style.opacity = 0.55;
  const ok = await ensureVessels();
  vesselToggle.parentElement.style.opacity = '';
  if (!ok) { vesselToggle.checked = false; state.showVessels = false; }
  applyHighlights();
});

// 骨骼是額外的一包資料，第一次打開才下載
let bonesGroup = null, bonesLoading = false;
const bonesToggle = $('tg-bones');
if (!anatomy) { bonesToggle.disabled = true; bonesToggle.parentElement.style.opacity = 0.4; }
bonesToggle.addEventListener('change', async e => {
  const on = e.target.checked;
  if (bonesGroup) { bonesGroup.visible = on; return; }
  if (!on || !anatomy || bonesLoading) return;
  bonesLoading = true;
  bonesToggle.parentElement.style.opacity = 0.55;
  setStatus('骨骼網格載入中…');
  try {
    const parts = await anatomy.loadBones((got, total) => setStatus(`骨骼網格載入中…${pct(got, total)}`));
    bonesGroup = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xeae3d4, roughness: 0.8, metalness: 0.0,
      transparent: true, opacity: 0.96, depthWrite: false,
    });
    for (const part of parts) {
      const geos = part.mirror ? [part.geometry, mirrorGeometry(part.geometry)] : [part.geometry];
      for (const geo of geos) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.renderOrder = 0;
        bonesGroup.add(mesh);
      }
    }
    bonesGroup.visible = bonesToggle.checked;
    scene.add(bonesGroup);
  } catch (err) {
    console.warn('[ACU] 骨骼載入失敗：', err.message);
    bonesToggle.checked = false;
  } finally {
    bonesLoading = false;
    bonesToggle.parentElement.style.opacity = '';
    setStatus('');
  }
});

document.querySelectorAll('#viewtools [data-view]').forEach(b => b.onclick = () => setView(b.dataset.view));
$('btn-reset').onclick = () => { controls.autoRotate = false; $('btn-spin').classList.remove('on'); focusHome(); };
$('btn-spin').onclick = e => {
  controls.autoRotate = !controls.autoRotate;
  e.currentTarget.classList.toggle('on', controls.autoRotate);
};

// 手機抽屜
const openDrawer = () => document.body.classList.add('drawer');
const closeDrawer = () => document.body.classList.remove('drawer');
$('menu-btn').onclick = openDrawer;
$('drawer-close').onclick = closeDrawer;
$('scrim').onclick = closeDrawer;
function closeDrawerOnMobile() { if (window.innerWidth <= 880) closeDrawer(); }

// ============================================================
// 滑鼠 / 觸控互動
// ============================================================
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const tooltip = $('tooltip');
let downAt = null, hoverKey = null;
const _pick = new THREE.Vector3(), _pickDir = new THREE.Vector3();

// 穴位用螢幕空間挑選：比對 420 個標記做射線求交快得多，命中範圍也比較寬容，
// 手機上用手指點也點得到。背對鏡頭的標記直接略過，避免點到身體另一側。
function pickPoint(clientX, clientY, radiusPx) {
  const rect = renderer.domElement.getBoundingClientRect();
  let best = -1, bestScore = Infinity;
  for (let i = 0; i < instances.length; i++) {
    if (instScale[i] < 0.001) continue;
    const inst = instances[i];
    _pick.fromArray(inst.pos);
    _pickDir.subVectors(camera.position, _pick);
    const dist = _pickDir.length();
    if (_pickDir.divideScalar(dist).dot(inst.outward) < -0.1) continue;
    _pick.project(camera);
    if (_pick.z > 1) continue;
    const sx = rect.left + (_pick.x * 0.5 + 0.5) * rect.width;
    const sy = rect.top + (-_pick.y * 0.5 + 0.5) * rect.height;
    const d = Math.hypot(clientX - sx, clientY - sy);
    if (d > radiusPx) continue;
    const score = d + dist * 6;
    if (score < bestScore) { bestScore = score; best = i; }
  }
  return best;
}

// 穴位優先（螢幕空間、命中範圍較寬），再對目前可見的肌肉／神經／血管做一次射線求交，
// 取最近的那一個——三層疊在一起時才不會永遠只點到肌肉。
function pick(clientX, clientY, radiusPx = 15) {
  const i = pickPoint(clientX, clientY, radiusPx);
  if (i >= 0) return { kind: 'point', id: instances[i].pointId };

  const targets = [];
  for (const g of [muscleGroup, nerveGroup, vesselGroup]) {
    for (const m of g.children) if (m.visible) targets.push(m);
  }
  if (!targets.length) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(targets, false);
  if (!hits.length) return null;
  const { userData: u } = hits[0].object;
  if (u.nerveId) return { kind: 'nerve', id: u.nerveId };
  if (u.vesselId) return { kind: 'vessel', id: u.vesselId };
  return { kind: 'muscle', id: u.muscleId };
}

const dom = renderer.domElement;
dom.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
dom.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) { downAt = null; return; }
  downAt = null;
  const hit = pick(e.clientX, e.clientY, e.pointerType === 'touch' ? 26 : 15);
  if (!hit) return;
  if (hit.kind === 'point') selectPoint(hit.id, { focus: false });
  else if (hit.kind === 'nerve') selectNerve(hit.id, { focus: false });
  else if (hit.kind === 'vessel') selectVessel(hit.id, { focus: false });
  else selectMuscle(hit.id, { focus: false });
});
let hoverPending = null;
dom.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' || downAt) { tooltip.style.display = 'none'; return; }
  if (hoverPending) { hoverPending = [e.clientX, e.clientY]; return; }
  hoverPending = [e.clientX, e.clientY];
  requestAnimationFrame(() => { const p = hoverPending; hoverPending = null; if (p) doHover(p[0], p[1]); });
});

function doHover(cx, cy) {
  const e = { clientX: cx, clientY: cy };
  const hit = pick(e.clientX, e.clientY);
  const k = hit ? hit.kind + hit.id : null;
  dom.style.cursor = hit ? 'pointer' : 'default';
  if (!hit) { tooltip.style.display = 'none'; hoverKey = null; return; }
  if (k !== hoverKey) {
    hoverKey = k;
    const meta = hit.kind === 'point' ? [pointById[hit.id].name, pointById[hit.id].code]
      : hit.kind === 'nerve' ? [NERVES[hit.id].name, NERVES[hit.id].roots]
        : hit.kind === 'vessel' ? [VESSELS[hit.id].name, VESSEL_KINDS[VESSELS[hit.id].kind].name]
          : [MUSCLES[hit.id].name, MUSCLES[hit.id].latin];
    tooltip.innerHTML = `${esc(meta[0])}<span class="sub">${esc(meta[1])}</span>`;
  }
  const rect = dom.getBoundingClientRect();
  tooltip.style.display = 'block';
  tooltip.style.left = (e.clientX - rect.left + 14) + 'px';
  tooltip.style.top = (e.clientY - rect.top + 12) + 'px';
}
dom.addEventListener('pointerleave', () => { tooltip.style.display = 'none'; hoverKey = null; });

window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') { if (e.key === 'Escape') e.target.blur(); return; }
  if (e.key === 'Escape') { closeInfo(); closeDrawer(); return; }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const list = filteredPoints();
    if (!list.length) return;
    let i = state.sel.kind === 'point' ? list.findIndex(p => p.id === state.sel.id) : -1;
    i = e.key === 'ArrowDown' ? (i + 1) % list.length : (i <= 0 ? list.length - 1 : i - 1);
    selectPoint(list[i].id);
    e.preventDefault();
  }
});

// ============================================================
// 穴名標籤
// ============================================================
const labelBox = $('labels');
const labelPool = [];
let labelsDirty = true;
const _proj = new THREE.Vector3(), _camDir = new THREE.Vector3();

function updateLabels() {
  const rect = { w: container.clientWidth, h: container.clientHeight };
  const rel = relatedSets();
  const wanted = [];

  for (let i = 0; i < instances.length; i++) {
    if (instScale[i] < 0.001) continue;
    const inst = instances[i];
    const isSel = state.sel.kind === 'point' && state.sel.id === inst.pointId;
    const isRel = rel.points.has(inst.pointId);
    if (!isSel && !isRel && !state.showLabels) continue;

    _proj.fromArray(inst.pos);
    _camDir.subVectors(camera.position, _proj).normalize();
    if (!isSel && _camDir.dot(inst.outward) < 0.05) continue;   // 背對鏡頭的不標
    _proj.project(camera);
    if (_proj.z > 1 || Math.abs(_proj.x) > 1.02 || Math.abs(_proj.y) > 1.02) continue;
    wanted.push({
      x: (_proj.x * 0.5 + 0.5) * rect.w, y: (-_proj.y * 0.5 + 0.5) * rect.h,
      z: _proj.z, text: pointById[inst.pointId].name, sel: isSel,
    });
  }
  wanted.sort((a, b) => (b.sel - a.sel) || (a.z - b.z));

  // 避讓重疊：由近到遠依序擺放，和已擺好的標籤重疊就跳過。
  // 全部畫出來會糊成一片，反而看不到任何一個穴名。
  const placed = [];
  const shown = [];
  for (const d of wanted) {
    const w = d.text.length * 12 + 12, h = 17;
    const x0 = d.x - w / 2, y0 = d.y - h * 1.4, x1 = x0 + w, y1 = y0 + h;
    if (placed.some(r => x0 < r[2] && x1 > r[0] && y0 < r[3] && y1 > r[1])) continue;
    placed.push([x0, y0, x1, y1]);
    shown.push(d);
    if (shown.length >= 70) break;
  }

  while (labelPool.length < shown.length) {
    const el = document.createElement('div');
    el.className = 'lab';
    labelBox.appendChild(el);
    labelPool.push(el);
  }
  labelPool.forEach((el, i) => {
    const d = shown[i];
    if (!d) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.className = 'lab' + (d.sel ? ' sel' : '');
    el.textContent = d.text;
    el.style.left = d.x + 'px';
    el.style.top = d.y + 'px';
  });
}

// ============================================================
// URL 狀態
// ============================================================
function writeHash() {
  const { kind, id } = state.sel;
  const h = kind === 'point' ? `#p=${id}` : kind === 'muscle' ? `#m=${id}`
    : kind === 'pattern' ? `#f=${id}` : kind === 'nerve' ? `#n=${id}`
      : kind === 'vessel' ? `#v=${id}` : '';
  history.replaceState(null, '', h || location.pathname + location.search);
}
function readHash() {
  const m = location.hash.match(/^#(p|m|f|n|v)=(.+)$/);
  if (!m) return false;
  const id = decodeURIComponent(m[2]);
  if (m[1] === 'p' && pointById[id]) { selectPoint(id); return true; }
  if (m[1] === 'm' && MUSCLES[id]) { selectMuscle(id); return true; }
  if (m[1] === 'f' && patternById[id]) { selectPattern(id); return true; }
  if (m[1] === 'n' && NERVES[id]) { selectNerve(id); return true; }
  if (m[1] === 'v' && VESSELS[id]) { selectVessel(id); return true; }
  return false;
}
window.addEventListener('hashchange', readHash);

// ============================================================
// 啟動
// ============================================================
renderRegionChips();
renderPointList();
renderMuscleList();
renderPnfList();
renderNerveVesselList();
applyHighlights();
resize();
readHash();

let frame = 0;
(function animate() {
  requestAnimationFrame(animate);

  if (camAnim) {
    const k = Math.min(1, (performance.now() - camAnim.t0) / camAnim.dur);
    const e = easeInOut(k);
    camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, e);
    controls.target.lerpVectors(camAnim.fromTarget, camAnim.toTarget, e);
    if (k >= 1) camAnim = null;
    labelsDirty = true;
  }
  controls.update();
  if (controls.autoRotate) labelsDirty = true;

  if ((labelsDirty || frame % 3 === 0)) { updateLabels(); labelsDirty = false; }
  frame++;

  renderer.render(scene, camera);
})();

requestAnimationFrame(() => $('loading').classList.add('done'));
