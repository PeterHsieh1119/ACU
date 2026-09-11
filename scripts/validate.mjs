#!/usr/bin/env node
// 資料一致性檢查：CI 或改完資料後跑一次
//   node scripts/validate.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { POINTS, ROUTES, MERIDIANS, REGIONS } from '../data/acupoints.js';
import { MUSCLES, MUSCLE_GROUPS } from '../data/muscles.js';
import { PNF_PATTERNS, PNF_REGIONS } from '../data/pnf.js';
import { NERVES, NERVE_GROUPS } from '../data/nerves.js';
import { VESSELS, VESSEL_GROUPS, VESSEL_KINDS } from '../data/vessels.js';
import { LOCATE } from '../data/locate.js';
import { BONE_CUN, FINGER_CUN, cunScale, landmarkOf } from '../data/cun.js';
import { ORGANS, CONNECTIVES, ORGAN_GROUPS } from '../data/organs.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const fail = m => problems.push(m);
const ok = m => console.log('  ✓', m);

// ---------- 穴位 ----------
const STANDARD = { LU: 11, LI: 20, ST: 45, SP: 21, HT: 9, SI: 19, BL: 67, KI: 27, PC: 9, TE: 23, GB: 44, LR: 14, REN: 24, DU: 28 };
const ids = new Set();
for (const p of POINTS) {
  if (ids.has(p.id)) fail(`穴位 id 重複：${p.id}`);
  ids.add(p.id);
  if (!MERIDIANS[p.meridian]) fail(`${p.id} 的經絡不存在：${p.meridian}`);
  if (!REGIONS[p.region]) fail(`${p.id} 的部位不存在：${p.region}`);
  if (!Array.isArray(p.pos) || p.pos.length !== 3 || p.pos.some(v => typeof v !== 'number')) fail(`${p.id} 座標格式錯誤`);
  if (p.pos[0] < 0) fail(`${p.id} 的 x 為負；雙側穴位一律定義在 +x 側`);
  if (p.pos[1] < 0 || p.pos[1] > 1.8) fail(`${p.id} 的 y 超出人體範圍：${p.pos[1]}`);
  if (!p.bilateral && Math.abs(p.pos[0]) > 1e-6) fail(`${p.id} 標為非雙側卻不在正中線`);
  for (const m of p.muscles) if (!MUSCLES[m]) fail(`${p.id} 參照到不存在的肌肉：${m}`);
  for (const f of ['loc', 'ind', 'depth']) if (!p[f]) fail(`${p.id} 缺少 ${f}`);
  if (p.lat !== undefined && !p.level) fail(`${p.id} 有 lat 卻沒有 level`);
}
let counts = true;
for (const [k, n] of Object.entries(STANDARD)) {
  const c = POINTS.filter(p => p.meridian === k).length;
  if (c !== n) { counts = false; fail(`${MERIDIANS[k].name} 有 ${c} 穴，標準為 ${n} 穴`); }
}
if (counts) ok(`十四經 361 穴齊全，另有經外奇穴 ${POINTS.filter(p => p.meridian === 'EX').length} 穴`);

// ---------- 經絡走行 ----------
for (const [k, strands] of Object.entries(ROUTES)) {
  if (!MERIDIANS[k]) fail(`ROUTES 有未知經絡：${k}`);
  for (const strand of strands) {
    for (const e of strand) {
      if (Array.isArray(e)) {
        if (e.length !== 3) fail(`${k} 走行補間座標格式錯誤`);
      } else if (!ids.has(e)) fail(`${k} 走行參照到不存在的穴位：${e}`);
    }
  }
}
for (const k of Object.keys(MERIDIANS)) if (!(k in ROUTES)) fail(`ROUTES 缺少經絡：${k}`);
ok('經絡走行參照正確');

// ---------- 肌肉 ----------
for (const [id, mu] of Object.entries(MUSCLES)) {
  if (!MUSCLE_GROUPS[mu.group]) fail(`肌肉 ${id} 的分組不存在：${mu.group}`);
  const strands = mu.paths || (mu.path ? [mu.path] : []);
  if (!strands.length) fail(`肌肉 ${id} 缺少 path/paths`);
  for (const st of strands) {
    if (st.length < 2) fail(`肌肉 ${id} 的走行點少於 2 個`);
    for (const pt of st) if (!Array.isArray(pt) || pt.length !== 3) fail(`肌肉 ${id} 走行點格式錯誤`);
  }
  for (const f of ['name', 'latin', 'origin', 'insertion', 'action', 'nerve']) {
    if (!mu[f]) fail(`肌肉 ${id} 缺少 ${f}`);
  }
}
ok(`肌肉 ${Object.keys(MUSCLES).length} 條資料完整`);

// ---------- PNF ----------
const patIds = new Set(PNF_PATTERNS.map(p => p.id));
for (const pat of PNF_PATTERNS) {
  if (!PNF_REGIONS[pat.regionKey]) fail(`PNF ${pat.id} 的分區不存在：${pat.regionKey}`);
  if (pat.pair && !patIds.has(pat.pair)) fail(`PNF ${pat.id} 的拮抗模式不存在：${pat.pair}`);
  for (const m of pat.muscles) if (!MUSCLES[m]) fail(`PNF ${pat.id} 參照到不存在的肌肉：${m}`);
  if (!pat.muscles.length) fail(`PNF ${pat.id} 沒有肌肉成分`);
}
ok(`PNF ${PNF_PATTERNS.length} 個模式資料完整`);

// ---------- 神經 ----------
for (const [id, nv] of Object.entries(NERVES)) {
  if (!NERVE_GROUPS[nv.group]) fail(`神經 ${id} 的分組不存在：${nv.group}`);
  const strands = nv.paths || (nv.path ? [nv.path] : []);
  if (!strands.length) fail(`神經 ${id} 缺少 path/paths`);
  for (const st of strands) {
    if (st.length < 2) fail(`神經 ${id} 的走行點少於 2 個`);
    for (const pt of st) {
      if (!Array.isArray(pt) || pt.length !== 3) fail(`神經 ${id} 走行點格式錯誤`);
      else if (pt[0] < 0) fail(`神經 ${id} 走行點的 x 為負；一律定義在 +x 側`);
    }
  }
  if (!(nv.r > 0)) fail(`神經 ${id} 缺少半徑 r`);
  for (const f of ['name', 'latin', 'roots', 'course', 'supply', 'caution']) {
    if (!nv[f]) fail(`神經 ${id} 缺少 ${f}`);
  }
  for (const m of nv.muscles) if (!MUSCLES[m]) fail(`神經 ${id} 參照到不存在的肌肉：${m}`);
  for (const pt of nv.points) if (!ids.has(pt)) fail(`神經 ${id} 參照到不存在的穴位：${pt}`);
  if (!nv.points.length) fail(`神經 ${id} 沒有對應的穴位`);
}
ok(`神經 ${Object.keys(NERVES).length} 條資料完整`);

// ---------- 血管 ----------
for (const [id, ve] of Object.entries(VESSELS)) {
  if (!VESSEL_GROUPS[ve.group]) fail(`血管 ${id} 的分組不存在：${ve.group}`);
  if (!VESSEL_KINDS[ve.kind]) fail(`血管 ${id} 的種類不存在：${ve.kind}`);
  for (const f of ['name', 'latin', 'course', 'caution']) if (!ve[f]) fail(`血管 ${id} 缺少 ${f}`);
  for (const pt of ve.points) if (!ids.has(pt)) fail(`血管 ${id} 參照到不存在的穴位：${pt}`);
  if (!ve.points.length) fail(`血管 ${id} 沒有對應的穴位`);
}
ok(`血管 ${Object.keys(VESSELS).length} 條資料完整`);

// ---------- 取穴法與骨度分寸 ----------
{
  const extra = Object.keys(LOCATE).filter(k => !ids.has(k));
  if (extra.length) fail(`data/locate.js 有不存在的穴位 id：${extra.join(', ')}`);
  let withCun = 0;
  for (const p of POINTS) {
    const l = LOCATE[p.id];
    if (!l) { fail(`${p.id} 缺少取穴法（data/locate.js）`); continue; }
    if (!l.find || l.find.length < 8) fail(`${p.id} 的取穴法太短或缺漏`);
    if (!l.cun) continue;
    withCun++;
    const spec = BONE_CUN[l.cun.seg];
    if (!spec) { fail(`${p.id} 的骨度尺不存在：${l.cun.seg}`); continue; }
    if (!spec.ruler || !spec.chain) fail(`${p.id} 用的骨度尺 ${l.cun.seg} 沒有對應的體軸，無法定位`);
    // 負數＝往遠端量（照海在內踝尖下 1 寸），但不會超過 3 寸
    if (!(l.cun.n >= -3)) fail(`${p.id} 的骨度寸數不合法：${l.cun.n}`);
    if (!l.cun.from && l.cun.n > spec.n) fail(`${p.id} 的 ${l.cun.n} 寸超過 ${spec.name} 的 ${spec.n} 寸`);
    // 剛好落在尺的兩端（腕橫紋、外踝尖、肘橫紋）本來就不會寫寸數，其餘一定要寫
    const atEnd = l.cun.n === 0 || l.cun.n === spec.n;
    if (!atEnd && !/寸/.test(p.loc) && !/寸/.test(l.find)) fail(`${p.id} 有骨度錨點，但定位與取穴法都沒有提到寸數`);
  }
  ok(`取穴法 ${POINTS.length} 穴齊全，其中 ${withCun} 穴有骨度分寸錨點`);
}
for (const [key, s] of Object.entries(BONE_CUN)) {
  if (!(s.n > 0)) fail(`骨度 ${key} 缺少寸數`);
  for (const f of ['part', 'name', 'dir']) if (!s[f]) fail(`骨度 ${key} 缺少 ${f}`);
  if (s.chain && !s.ruler) fail(`骨度 ${key} 有 chain 卻沒有 ruler`);
}
if (FINGER_CUN.length < 3) fail('指寸法資料不足');
ok(`骨度分寸 ${Object.keys(BONE_CUN).length} 段、指寸法 ${FINGER_CUN.length} 種`);

// ---------- 內臟與結締組織 ----------
for (const [id, o] of Object.entries(ORGANS)) {
  if (!ORGAN_GROUPS[o.group]) fail(`內臟 ${id} 的分區不存在：${o.group}`);
  for (const f of ['name', 'latin', 'anatomy']) if (!o[f]) fail(`內臟 ${id} 缺少 ${f}`);
  if (o.meridian && !MERIDIANS[o.meridian]) fail(`內臟 ${id} 的經絡不存在：${o.meridian}`);
  for (const f of ['mu', 'shu']) if (o[f] && !ids.has(o[f])) fail(`內臟 ${id} 的${f === 'mu' ? '募穴' : '背俞穴'}不存在：${o[f]}`);
}
ok(`內臟 ${Object.keys(ORGANS).length} 件資料完整`);
for (const [id, c] of Object.entries(CONNECTIVES)) {
  for (const f of ['name', 'latin', 'anatomy', 'use']) if (!c[f]) fail(`結締組織 ${id} 缺少 ${f}`);
}
ok(`結締組織 ${Object.keys(CONNECTIVES).length} 件資料完整`);

// ---------- 三層連結 ----------
const orphan = Object.keys(MUSCLES).filter(id =>
  !POINTS.some(p => p.muscles.includes(id)) && !PNF_PATTERNS.some(p => p.muscles.includes(id)));
if (orphan.length) console.log('  · 沒有被任何穴位或 PNF 模式引用的肌肉：', orphan.join(', '));

// ---------- 解剖資產 ----------
const anatomyDir = path.join(ROOT, 'data/anatomy');
if (fs.existsSync(path.join(anatomyDir, 'manifest.json'))) {
  const man = JSON.parse(fs.readFileSync(path.join(anatomyDir, 'manifest.json'), 'utf8'));
  for (const [g, grp] of Object.entries(man.groups)) {
    const f = path.join(anatomyDir, grp.file);
    if (!fs.existsSync(f)) fail(`解剖資產缺少檔案：${grp.file}`);
    else if (fs.statSync(f).size !== grp.gzipBytes) fail(`${grp.file} 大小與 manifest 不符`);
  }
  const real = new Set(man.groups.muscles.parts.map(p => p.key));
  const unknown = [...real].filter(k => !MUSCLES[k]);
  if (unknown.length) fail(`解剖資產有 data/muscles.js 沒有的肌肉 id：${unknown.join(', ')}`);
  const approx = Object.keys(MUSCLES).filter(k => !real.has(k));
  ok(`解剖資產：真實網格 ${real.size} 條、示意幾何 ${approx.length} 條（${approx.join('、')}）`);
  // 血管的幾何全部來自資產，兩邊的 key 必須完全一致
  // 血管、內臟、結締組織的幾何全部來自資產，兩邊的 key 必須完全一致
  for (const [g, data, label] of [['vessels', VESSELS, 'data/vessels.js'],
    ['organs', ORGANS, 'data/organs.js 的 ORGANS'], ['connective', CONNECTIVES, 'data/organs.js 的 CONNECTIVES']]) {
    if (!man.groups[g]) { fail(`解剖資產缺少 ${g} 群組`); continue; }
    const asset = new Set(man.groups[g].parts.map(p => p.key));
    const extra = [...asset].filter(k => !data[k]);
    const lack = Object.keys(data).filter(k => !asset.has(k));
    if (extra.length) fail(`解剖資產有 ${label} 沒有的 id：${extra.join(', ')}`);
    if (lack.length) fail(`${label} 有解剖資產缺少的 id：${lack.join(', ')}`);
    if (!extra.length && !lack.length) ok(`${g} 網格 ${asset.size} 件與 ${label} 完全對應`);
  }
  for (const k of ['vertex', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'cunBack', 'spinous']) {
    if (man.landmarks[k] === undefined) fail(`manifest 缺少 landmark：${k}`);
  }
  const need = ['C7', 'T1', 'T3', 'T7', 'T12', 'L2', 'L5'];
  for (const v of need) if (!man.landmarks.spinous[v]) fail(`manifest 缺少椎體 landmark：${v}`);
  const levels = new Set(POINTS.filter(p => p.level).map(p => p.level));
  for (const lv of levels) {
    if (!man.landmarks.spinous[lv] && !/^S[1-4]$/.test(lv)) fail(`穴位用到的椎體 ${lv} 在 manifest 找不到`);
  }
  // 骨度尺用到的標誌一個都不能少，缺了整段四肢穴位就會定位失敗
  for (const [key, spec] of Object.entries(BONE_CUN)) {
    if (!spec.ruler) continue;
    for (const lm of spec.ruler) {
      try { landmarkOf(man.landmarks, lm); }
      catch { fail(`骨度 ${key} 需要的標誌 ${lm} 在 manifest 找不到`); }
    }
  }
  const scale = cunScale(man.landmarks);
  for (const [key, v] of Object.entries(scale)) {
    if (!(v.metres > 0.008 && v.metres < 0.05)) fail(`骨度 ${key} 換算出來的 1 寸是 ${(v.metres * 100).toFixed(1)} cm，明顯不合理`);
  }
  ok(`骨度尺 ${Object.keys(scale).length} 段可換算（前臂 1 寸 ≈ ${(scale.forearm.metres * 100).toFixed(1)} cm、小腿 ${(scale.shank.metres * 100).toFixed(1)} cm）`);
  ok('骨架 landmark 齊全');
} else {
  console.log('  · 找不到 data/anatomy/manifest.json，略過解剖資產檢查');
}

console.log('');
if (problems.length) {
  console.error(`✗ 發現 ${problems.length} 個問題：`);
  for (const p of problems) console.error('   -', p);
  process.exit(1);
}
console.log('✓ 全部檢查通過');
