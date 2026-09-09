import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MERIDIANS, REGIONS, POINTS, ROUTES } from '../data/acupoints.js';
import { MUSCLES, MUSCLE_GROUPS } from '../data/muscles.js';
import { PNF_PATTERNS, PNF_REGIONS } from '../data/pnf.js';
import { buildBody, makeSnapper, bodyAxisPoint } from './body.js';
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
// 人體 + 體表吸附
// ============================================================
const { group: bodyGroup, material: skinMat, collision } = buildBody();
scene.add(bodyGroup);
const snap = makeSnapper(collision, 0.005);
// 經絡線的補間點允許被推得遠一點，這樣穿過身體的直線段會被拉回體表
const snapLoose = makeSnapper(collision, 0.007, 0.20);

// 穴位座標吸附到體表；bilateral 的另一側各自吸附（模型左右對稱，結果也對稱）
const snapped = new Map();          // pointId -> [x,y,z]（+x 側）
for (const pt of POINTS) snapped.set(pt.id, snap(pt.pos));

const pointById = Object.fromEntries(POINTS.map(p => [p.id, p]));
const patternById = Object.fromEntries(PNF_PATTERNS.map(p => [p.id, p]));

function resolveRoutePoint(entry) {
  if (Array.isArray(entry)) return snap(entry);
  return snapped.get(entry) || pointById[entry].pos;
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
    const n = Math.min(10, Math.floor(d / 0.045));
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      push(snapLoose([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]));
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
  const list = (pt.bilateral && Math.abs(base[0]) > 1e-4) ? [base, [-base[0], base[1], base[2]]] : [base];
  for (const pos of list) {
    const v = new THREE.Vector3(...pos);
    const outward = v.clone().sub(bodyAxisPoint(v)).normalize();
    if (!isFinite(outward.x) || outward.lengthSq() < 0.5) outward.set(0, 0, 1);
    instances.push({ pointId: pt.id, pos, outward });
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

for (const [id, mu] of Object.entries(MUSCLES)) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff5a52, emissive: 0x3d0f0f, roughness: 0.55, metalness: 0.0,
    transparent: true, opacity: mu.deep ? 0.55 : 0.92, depthWrite: false,
  });
  const meshes = [];
  const sides = mu.midline ? [mu.path] : [mu.path, mu.path.map(p => [-p[0], p[1], p[2]])];
  for (const path of sides) {
    const mesh = new THREE.Mesh(tube(path, { r: mu.r, radial: 10 }), mat);
    mesh.visible = false;
    mesh.userData.muscleId = id;
    mesh.renderOrder = 1;
    muscleGroup.add(mesh);
    meshes.push(mesh);
  }
  muscleMeshes[id] = { meshes, mat, deep: !!mu.deep };
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
// 狀態
// ============================================================
const state = {
  sel: { kind: null, id: null },        // 'point' | 'muscle' | 'pattern'
  meriVisible: Object.fromEntries(Object.keys(MERIDIANS).map(k => [k, true])),
  regions: new Set(),                   // 空集合 = 全部
  query: '',
  mquery: '',
  showRoutes: true,
  showLabels: false,
  showAllMuscles: false,
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

function bindInfoTags() {
  infoBody.querySelectorAll('[data-mus]').forEach(el => el.onclick = () => selectMuscle(el.dataset.mus));
  infoBody.querySelectorAll('[data-pat]').forEach(el => el.onclick = () => selectPattern(el.dataset.pat));
  infoBody.querySelectorAll('[data-pt]').forEach(el => el.onclick = () => selectPoint(el.dataset.pt));
}

function showPointInfo(pt) {
  const meta = MERIDIANS[pt.meridian];
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
      <dt>相關 PNF 模式（共用肌肉）</dt><dd>${pnfTags(patternsOfPoint(pt))}</dd>
    </dl>
    <div class="navrow">
      <button data-nav="prev" ${i <= 0 ? 'disabled' : ''}>← ${i > 0 ? esc(sibs[i - 1].name) : '—'}</button>
      <button data-nav="next" ${i >= sibs.length - 1 ? 'disabled' : ''}>${i < sibs.length - 1 ? esc(sibs[i + 1].name) : '—'} →</button>
    </div>
    <div class="warn">座標為示意近似、深度為教科書參考值，僅供學習，不可作為臨床操作依據。</div>`;
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
      <dt>神經支配</dt><dd>${esc(mu.nerve)}</dd>
      <dt>其上／鄰近穴位</dt><dd>${ptTags(pointsOfMuscle(id))}</dd>
      <dt>參與的 PNF 模式</dt><dd>${pnfTags(patternsOfMuscle(id))}</dd>
    </dl>
    <div class="warn">肌肉幾何為簡化示意（起止線＋梭形肌腹），不代表真實斷面形態。</div>`;
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
      <dt>建議參考穴位（位於模式肌肉鏈上）</dt><dd>${ptTags(pointsOfPattern(pat))}</dd>
    </dl>
    <div class="warn">肌肉成分整理自 Voss/Knott 傳統與《PNF in Practice》；穴位建議由「穴位–肌肉」對應自動推得，供選穴思路參考，非治療處方。</div>`;
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

function muscleCenter(id) {
  const path = MUSCLES[id].path;
  const v = new THREE.Vector3();
  for (const p of path) v.add(new THREE.Vector3(...p));
  return v.multiplyScalar(1 / path.length);
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
  const outward = v.clone().sub(bodyAxisPoint(v));
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

function syncSidebarSelection() {
  document.querySelectorAll('.prow[data-pt]').forEach(r => r.classList.toggle('sel', state.sel.kind === 'point' && r.dataset.pt === state.sel.id));
  document.querySelectorAll('.prow[data-mus]').forEach(r => r.classList.toggle('sel', state.sel.kind === 'muscle' && r.dataset.mus === state.sel.id));
  document.querySelectorAll('.pnfbtn').forEach(b => b.classList.toggle('sel', state.sel.kind === 'pattern' && b.dataset.pat === state.sel.id));
  const row = ptlist.querySelector('.prow.sel');
  if (row) row.scrollIntoView({ block: 'nearest' });
}

// ============================================================
// 圖層與視角控制
// ============================================================
$('op-slider').addEventListener('input', e => {
  const v = e.target.value / 100;
  skinMat.opacity = v;
  bodyGroup.visible = v > 0.005;
});
$('tg-routes').addEventListener('change', e => { state.showRoutes = e.target.checked; applyHighlights(); });
$('tg-labels').addEventListener('change', e => { state.showLabels = e.target.checked; labelsDirty = true; });
$('tg-allmus').addEventListener('change', e => { state.showAllMuscles = e.target.checked; applyHighlights(); });

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

function pick(clientX, clientY, radiusPx = 15) {
  const i = pickPoint(clientX, clientY, radiusPx);
  if (i >= 0) return { kind: 'point', id: instances[i].pointId };

  const visibleMuscles = muscleGroup.children.filter(m => m.visible);
  if (visibleMuscles.length) {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(visibleMuscles, false);
    if (hits.length) return { kind: 'muscle', id: hits[0].object.userData.muscleId };
  }
  return null;
}

const dom = renderer.domElement;
dom.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
dom.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) { downAt = null; return; }
  downAt = null;
  const hit = pick(e.clientX, e.clientY, e.pointerType === 'touch' ? 26 : 15);
  if (!hit) return;
  if (hit.kind === 'point') selectPoint(hit.id, { focus: false });
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
    tooltip.innerHTML = hit.kind === 'point'
      ? `${esc(pointById[hit.id].name)}<span class="sub">${esc(pointById[hit.id].code)}</span>`
      : `${esc(MUSCLES[hit.id].name)}<span class="sub">${esc(MUSCLES[hit.id].latin)}</span>`;
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
  const shown = wanted.slice(0, 70);

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
  const h = kind === 'point' ? `#p=${id}` : kind === 'muscle' ? `#m=${id}` : kind === 'pattern' ? `#f=${id}` : '';
  history.replaceState(null, '', h || location.pathname + location.search);
}
function readHash() {
  const m = location.hash.match(/^#(p|m|f)=(.+)$/);
  if (!m) return false;
  const id = decodeURIComponent(m[2]);
  if (m[1] === 'p' && pointById[id]) { selectPoint(id); return true; }
  if (m[1] === 'm' && MUSCLES[id]) { selectMuscle(id); return true; }
  if (m[1] === 'f' && patternById[id]) { selectPattern(id); return true; }
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
