import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MERIDIANS, POINTS, ROUTES } from '../data/acupoints.js';
import { MUSCLES } from '../data/muscles.js';
import { PNF_PATTERNS } from '../data/pnf.js';

// ---------- 基礎場景 ----------
const container = document.getElementById('canvas3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101418);

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 50);
camera.position.set(0.5, 1.5, 1.9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.95, 0);
controls.enableDamping = true;
controls.maxDistance = 6; controls.minDistance = 0.25;

scene.add(new THREE.HemisphereLight(0xdfe8f0, 0x30363c, 1.1));
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(1.5, 2.5, 2);
scene.add(dir);
const dir2 = new THREE.DirectionalLight(0x8899aa, 0.5);
dir2.position.set(-1.5, 1.5, -2);
scene.add(dir2);

const grid = new THREE.GridHelper(3, 30, 0x2a323c, 0x1b2129);
scene.add(grid);

function resize() {
  const w = container.clientWidth, h = container.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

// ---------- 人體（簡化示意模型） ----------
const skinMat = new THREE.MeshStandardMaterial({
  color: 0xc9a186, roughness: 0.65, metalness: 0.02,
  transparent: true, opacity: 0.8,
});
const body = new THREE.Group();
scene.add(body);

function ellipsoid(cx, cy, cz, rx, ry, rz) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), skinMat);
  m.position.set(cx, cy, cz);
  m.scale.set(rx, ry, rz);
  body.add(m);
}
function limb(a, b, r) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const geo = new THREE.CapsuleGeometry(r, len, 6, 14);
  const m = new THREE.Mesh(geo, skinMat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  body.add(m);
}
// 頭頸軀幹
ellipsoid(0, 1.63, 0, 0.097, 0.112, 0.105);           // 頭
limb([0, 1.44, 0], [0, 1.56, 0], 0.046);              // 頸
ellipsoid(0, 1.30, 0, 0.185, 0.17, 0.104);            // 胸
ellipsoid(0, 1.08, 0, 0.15, 0.14, 0.098);             // 腹
ellipsoid(0, 0.93, 0, 0.168, 0.115, 0.10);            // 骨盆
for (const s of [1, -1]) {
  ellipsoid(0.185 * s, 1.415, 0, 0.052, 0.05, 0.05);              // 肩
  limb([0.195 * s, 1.40, 0], [0.245 * s, 1.17, 0], 0.042);        // 上臂
  limb([0.245 * s, 1.17, 0], [0.285 * s, 0.93, 0.015], 0.033);    // 前臂
  ellipsoid(0.30 * s, 0.825, 0.025, 0.038, 0.075, 0.022);         // 手
  limb([0.095 * s, 0.92, 0], [0.09 * s, 0.52, 0], 0.062);         // 大腿
  limb([0.09 * s, 0.52, 0], [0.093 * s, 0.12, -0.01], 0.045);     // 小腿
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.06, 0.21), skinMat);
  foot.position.set(0.095 * s, 0.04, 0.055);
  body.add(foot);
}

document.getElementById('op-slider').addEventListener('input', (e) => {
  skinMat.opacity = e.target.value / 100;
});

// ---------- 資料索引 ----------
const pointById = Object.fromEntries(POINTS.map(p => [p.id, p]));
const patternById = Object.fromEntries(PNF_PATTERNS.map(p => [p.id, p]));
function patternsOfPoint(pt) {
  return PNF_PATTERNS.filter(pat => pat.muscles.some(m => pt.muscles.includes(m)));
}
function pointsOfPattern(pat) {
  return POINTS.filter(pt => pt.muscles.some(m => pat.muscles.includes(m)));
}

// ---------- 經絡與穴位 ----------
const meriGroups = {};   // key -> Group（含線與點，雙側）
const pointMeshes = [];  // 供 raycast
const spriteScale = 0.0078;

function mirrored(v) { return [-v[0], v[1], v[2]]; }

for (const [key, meta] of Object.entries(MERIDIANS)) {
  const g = new THREE.Group();
  meriGroups[key] = g;
  scene.add(g);

  const route = (ROUTES[key] || []).map(e => Array.isArray(e) ? e : pointById[e].pos);
  const sides = (key === 'REN' || key === 'DU') ? [route] : [route, route.map(mirrored)];
  for (const r of sides) {
    if (r.length < 2) continue;
    const curve = new THREE.CatmullRomCurve3(r.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0.1);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, Math.max(32, r.length * 10), 0.0032, 6),
      new THREE.MeshBasicMaterial({ color: meta.color, transparent: true, opacity: 0.85 })
    );
    g.add(tube);
  }
}

const ptGeo = new THREE.SphereGeometry(1, 14, 10);
for (const pt of POINTS) {
  const positions = pt.bilateral && pt.pos[0] !== 0 ? [pt.pos, mirrored(pt.pos)] : [pt.pos];
  for (const pos of positions) {
    const mat = new THREE.MeshStandardMaterial({
      color: MERIDIANS[pt.meridian].color, emissive: MERIDIANS[pt.meridian].color, emissiveIntensity: 0.35,
    });
    const m = new THREE.Mesh(ptGeo, mat);
    m.position.set(...pos);
    m.scale.setScalar(spriteScale);
    m.userData.pointId = pt.id;
    meriGroups[pt.meridian].add(m);
    pointMeshes.push(m);
  }
}

// ---------- 肌肉（預設隱藏，高亮時顯示） ----------
const muscleGroup = new THREE.Group();
scene.add(muscleGroup);
const muscleMeshes = {}; // id -> [mesh, mirroredMesh]

for (const [id, mu] of Object.entries(MUSCLES)) {
  const list = [];
  for (const side of [1, -1]) {
    const A = new THREE.Vector3(mu.path[0][0] * side, mu.path[0][1], mu.path[0][2]);
    const B = new THREE.Vector3(mu.path[1][0] * side, mu.path[1][1], mu.path[1][2]);
    const len = A.distanceTo(B);
    const geo = new THREE.CapsuleGeometry(mu.r, len, 4, 10);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff5252, emissive: 0xaa2222, emissiveIntensity: 0.5,
      transparent: true, opacity: mu.deep ? 0.45 : 0.9,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    m.visible = false;
    muscleGroup.add(m);
    list.push(m);
  }
  muscleMeshes[id] = list;
}

function showMuscles(ids, color) {
  for (const meshes of Object.values(muscleMeshes)) meshes.forEach(m => m.visible = false);
  for (const id of ids) {
    (muscleMeshes[id] || []).forEach(m => {
      m.visible = true;
      if (color) { m.material.color.set(color); }
    });
  }
}

// ---------- 狀態與高亮 ----------
let selectedPointId = null;
let selectedPatternId = null;

function resetPointStyles() {
  for (const m of pointMeshes) {
    const pt = pointById[m.userData.pointId];
    m.scale.setScalar(spriteScale);
    m.material.emissiveIntensity = 0.35;
    m.material.color.set(MERIDIANS[pt.meridian].color);
    m.material.emissive.set(MERIDIANS[pt.meridian].color);
  }
}

function applyHighlights() {
  resetPointStyles();
  const pat = selectedPatternId ? patternById[selectedPatternId] : null;
  if (pat) {
    const rel = new Set(pointsOfPattern(pat).map(p => p.id));
    for (const m of pointMeshes) {
      if (rel.has(m.userData.pointId)) {
        m.scale.setScalar(spriteScale * 1.7);
        m.material.emissiveIntensity = 1.0;
      }
    }
    showMuscles(pat.muscles, 0xff5252);
  } else if (selectedPointId) {
    showMuscles(pointById[selectedPointId].muscles, 0xffa040);
  } else {
    showMuscles([]);
  }
  if (selectedPointId) {
    for (const m of pointMeshes) {
      if (m.userData.pointId === selectedPointId) {
        m.scale.setScalar(spriteScale * 2.0);
        m.material.color.set(0xffffff);
        m.material.emissive.set(0xffffff);
        m.material.emissiveIntensity = 0.9;
      }
    }
  }
}

// ---------- 資訊面板 ----------
const infoEl = document.getElementById('info');
const infoBody = document.getElementById('info-body');
document.getElementById('info-close').onclick = () => {
  infoEl.classList.remove('show');
  selectedPointId = null;
  if (!selectedPatternId) applyHighlights(); else applyHighlights();
};

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

function showPointInfo(pt) {
  const meta = MERIDIANS[pt.meridian];
  const musTags = pt.muscles.length
    ? pt.muscles.map(id => `<span class="mus-tag">${MUSCLES[id] ? MUSCLES[id].name : id}</span>`).join('')
    : '<span style="color:var(--dim)">（此穴下方無定義之骨骼肌／位於腱、骨面或孔隙）</span>';
  const pats = patternsOfPoint(pt);
  const patTags = pats.length
    ? pats.map(p => `<span class="pnf-tag" data-pat="${p.id}">${p.name}</span>`).join('')
    : '<span style="color:var(--dim)">無直接對應</span>';
  infoBody.innerHTML = `
    <h2>${pt.name}<small>${pt.code}</small></h2>
    <div class="meri" style="color:#${meta.color.toString(16).padStart(6, '0')}">${meta.name}</div>
    <dl>
      <dt>定位</dt><dd>${esc(pt.loc)}</dd>
      <dt>主治</dt><dd>${esc(pt.ind)}</dd>
      <dt>刺法參考</dt><dd>${esc(pt.depth)}</dd>
      <dt>下方／鄰近肌肉</dt><dd>${musTags}</dd>
      <dt>相關 PNF 模式（共用肌肉）</dt><dd>${patTags}</dd>
    </dl>
    <div class="warn">深度為教科書參考值，僅供學習。</div>`;
  infoEl.classList.add('show');
  infoBody.querySelectorAll('.pnf-tag').forEach(el => {
    el.onclick = () => selectPattern(el.dataset.pat);
  });
}

function showPatternInfo(pat) {
  const mus = pat.muscles.map(id => `<span class="mus-tag">${MUSCLES[id] ? MUSCLES[id].name : id}</span>`).join('');
  const pts = pointsOfPattern(pat);
  const ptTags = pts.map(p => `<span class="pnf-tag" data-pt="${p.id}">${p.name} ${p.code}</span>`).join('') || '—';
  infoBody.innerHTML = `
    <h2>${pat.name}<small>${pat.region}</small></h2>
    <dl>
      <dt>動作組成</dt><dd>${esc(pat.motion)}</dd>
      <dt>口訣</dt><dd>${esc(pat.cue)}</dd>
      <dt>主要肌肉成分</dt><dd>${mus}</dd>
      <dt>建議參考穴位（位於模式肌肉鏈上）</dt><dd>${ptTags}</dd>
    </dl>
    <div class="warn">肌肉成分整理自 Voss/Knott 傳統與《PNF in Practice》；穴位建議由「穴位–肌肉」對應自動推得，供選穴思路參考。</div>`;
  infoEl.classList.add('show');
  infoBody.querySelectorAll('.pnf-tag').forEach(el => {
    el.onclick = () => selectPoint(el.dataset.pt);
  });
}

function selectPoint(id) {
  selectedPointId = id;
  selectedPatternId = null;
  document.querySelectorAll('.pnfbtn').forEach(b => b.classList.remove('sel'));
  const pt = pointById[id];
  if (!meriVisible[pt.meridian]) toggleMeridian(pt.meridian, true);
  applyHighlights();
  showPointInfo(pt);
  document.querySelectorAll('.prow').forEach(r => r.classList.toggle('sel', r.dataset.pt === id));
}

function selectPattern(id) {
  selectedPatternId = id;
  selectedPointId = null;
  document.querySelectorAll('.pnfbtn').forEach(b => b.classList.toggle('sel', b.dataset.pat === id));
  document.querySelector('.tab[data-pane="pane-pnf"]').click();
  applyHighlights();
  showPatternInfo(patternById[id]);
}

// ---------- Raycast 點選 ----------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', (e) => {
  renderer.domElement._downAt = [e.clientX, e.clientY];
});
renderer.domElement.addEventListener('pointerup', (e) => {
  const d = renderer.domElement._downAt;
  if (!d || Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 5) return; // 拖曳不算點擊
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const visibles = pointMeshes.filter(m => m.parent.visible);
  const hits = raycaster.intersectObjects(visibles, false);
  if (hits.length) selectPoint(hits[0].object.userData.pointId);
});

// ---------- 側欄：經絡清單 ----------
const meriVisible = {};
const merilist = document.getElementById('merilist');
for (const [key, meta] of Object.entries(MERIDIANS)) {
  meriVisible[key] = true;
  const n = POINTS.filter(p => p.meridian === key).length;
  const row = document.createElement('div');
  row.className = 'mrow';
  row.innerHTML = `<span class="mdot" style="background:#${meta.color.toString(16).padStart(6, '0')}"></span>
    <input type="checkbox" checked data-meri="${key}"> ${meta.name} <span class="cnt">${n}穴</span>`;
  row.querySelector('input').addEventListener('change', (e) => toggleMeridian(key, e.target.checked));
  row.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT') return;
    const cb = row.querySelector('input');
    cb.checked = !cb.checked;
    toggleMeridian(key, cb.checked);
  });
  merilist.appendChild(row);
}
function toggleMeridian(key, on) {
  meriVisible[key] = on;
  meriGroups[key].visible = on;
  const cb = merilist.querySelector(`input[data-meri="${key}"]`);
  if (cb) cb.checked = on;
  renderPointList();
}
document.getElementById('btn-all').onclick = () => Object.keys(MERIDIANS).forEach(k => toggleMeridian(k, true));
document.getElementById('btn-none').onclick = () => Object.keys(MERIDIANS).forEach(k => toggleMeridian(k, false));

// ---------- 側欄：穴位清單與搜尋 ----------
const ptlist = document.getElementById('ptlist');
const searchEl = document.getElementById('search');
searchEl.addEventListener('input', renderPointList);
function renderPointList() {
  const q = searchEl.value.trim().toLowerCase();
  ptlist.innerHTML = '';
  for (const pt of POINTS) {
    if (!meriVisible[pt.meridian]) continue;
    if (q && !(pt.name.includes(q) || pt.code.toLowerCase().includes(q) || pt.id.toLowerCase().includes(q))) continue;
    const row = document.createElement('div');
    row.className = 'prow';
    row.dataset.pt = pt.id;
    if (pt.id === selectedPointId) row.classList.add('sel');
    row.innerHTML = `<span class="code">${pt.code}</span><span>${pt.name}</span>
      <span style="margin-left:auto;font-size:10px;color:#${MERIDIANS[pt.meridian].color.toString(16).padStart(6, '0')}">${MERIDIANS[pt.meridian].name.slice(-3)}</span>`;
    row.onclick = () => selectPoint(pt.id);
    ptlist.appendChild(row);
  }
}
renderPointList();

// ---------- 側欄：PNF ----------
const pnflist = document.getElementById('pnflist');
for (const pat of PNF_PATTERNS) {
  const b = document.createElement('button');
  b.className = 'pnfbtn';
  b.dataset.pat = pat.id;
  b.innerHTML = `${pat.name}<small>${pat.motion.split('｜')[0]}</small>`;
  b.onclick = () => selectPattern(pat.id);
  pnflist.appendChild(b);
}
document.getElementById('pnfclear').onclick = () => {
  selectedPatternId = null;
  document.querySelectorAll('.pnfbtn').forEach(el => el.classList.remove('sel'));
  infoEl.classList.remove('show');
  applyHighlights();
};

// ---------- 分頁 ----------
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.pane').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.pane).classList.add('active');
  });
});

// ---------- 迴圈 ----------
resize();
(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
})();
