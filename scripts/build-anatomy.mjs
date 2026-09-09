#!/usr/bin/env node
// 從 BodyParts3D 抽出 ACU 需要的部分，打包成瀏覽器可直接載入的精簡資產。
//
// 來源：https://github.com/ashemag/human-atlas 內的 public/models
//       （BodyParts3D 4.0，© The Database Center for Life Science，CC BY 4.0）
//
// 用法：
//   git clone --depth 1 https://github.com/ashemag/human-atlas /tmp/human-atlas
//   node scripts/build-anatomy.mjs /tmp/human-atlas/public/models
//
// 產出（已經 commit 進 repo，一般不需要重跑）：
//   data/anatomy/manifest.json   部位索引、量化參數、骨架 landmark
//   data/anatomy/skin.bin.gz     體表
//   data/anatomy/muscles.bin.gz  肌肉
//   data/anatomy/bones.bin.gz    骨骼（延遲載入）
//
// 座標系與 ACU 相同：公尺、y 向上、+z 為前方、+x 為受檢者左側。
// 只取單側（左）與正中結構，右側在執行時鏡射，資料量因此少一半。

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { MeshoptSimplifier } from 'meshoptimizer';

const SRC = process.argv[2];
const OUT = path.resolve(process.argv[3] || 'data/anatomy');
if (!SRC) {
  console.error('用法: node scripts/build-anatomy.mjs <human-atlas>/public/models [輸出目錄]');
  process.exit(1);
}

// ---------------------------------------------------------------
// ACU 肌肉 id → BodyParts3D 結構名稱
// ---------------------------------------------------------------
const MUSCLE_MAP = {
  scm: ['sternocleidomastoid'],
  scalenes: ['scalenus anterior', 'scalenus medius', 'scalenus posterior'],
  splenius: ['splenius capitis', 'splenius cervicis'],
  semispinalis: ['semispinalis capitis', 'semispinalis cervicis'],
  suboccipitals: ['rectus capitis posterior major', 'rectus capitis posterior minor', 'obliquus capitis superior', 'obliquus capitis inferior'],
  platysma: ['platysma'],

  trapezius_upper: ['descending part of trapezius'],
  trapezius_middle: ['transverse part of trapezius'],
  trapezius_lower: ['ascending part of trapezius'],
  levator_scapulae: ['levator scapulae'],
  rhomboids: ['rhomboid major', 'rhomboid minor'],
  serratus_anterior: ['serratus anterior'],
  pec_major_clav: ['clavicular part of pectoralis major'],
  pec_major_sternal: ['sternocostal part of pectoralis major', 'abdominal part of pectoralis major'],
  pec_minor: ['pectoralis minor'],
  intercostals: ['external intercostal muscle', 'internal intercostal muscle'],
  erector_spinae: ['iliocostalis lumborum', 'iliocostalis thoracis', 'iliocostalis cervicis',
    'longissimus thoracis', 'longissimus cervicis', 'longissimus capitis', 'spinalis thoracis'],
  obliques: ['external oblique'],

  deltoid_anterior: ['clavicular part of deltoid'],
  deltoid_middle: ['acromial part of deltoid'],
  deltoid_posterior: ['spinal part of deltoid'],
  supraspinatus: ['supraspinatus'],
  infraspinatus: ['infraspinatus muscle'],
  teres_minor: ['teres minor'],
  teres_major: ['teres major'],
  subscapularis: ['subscapularis'],
  coracobrachialis: ['coracobrachialis'],

  biceps: ['long head of biceps brachii', 'short head of biceps brachii'],
  brachialis: ['brachialis'],
  triceps: ['long head of triceps brachii', 'lateral head of triceps brachii', 'medial head of triceps brachii'],
  anconeus: ['anconeus'],

  brachioradialis: ['brachioradialis'],
  pronator_teres: ['humeral head of pronator teres', 'ulnar head of pronator teres'],
  pronator_quadratus: ['pronator quadratus'],
  supinator: ['supinator'],
  fcr: ['flexor carpi radialis'],
  palmaris_longus: ['palmaris longus'],
  fcu: ['humeral head of flexor carpi ulnaris', 'ulnar head of flexor carpi ulnaris'],
  fds: ['flexor digitorum superficialis'],
  fdp: ['flexor digitorum profundus'],
  ecrl: ['extensor carpi radialis longus'],
  ecrb: ['extensor carpi radialis brevis'],
  edc: ['extensor digitorum', 'extensor digiti minimi'],
  ecu: ['extensor carpi ulnaris'],
  apl_epb: ['abductor pollicis longus', 'extensor pollicis brevis', 'extensor pollicis longus'],
  thenar: ['abductor pollicis brevis', 'opponens pollicis', 'superficial head of flexor pollicis brevis'],
  hypothenar: ['abductor digiti minimi of hand', 'flexor digiti minimi brevis of hand', 'opponens digiti minimi of hand'],
  fdi_hand: ['set of dorsal interossei of hand'],

  iliopsoas: ['psoas major', 'iliacus'],
  gluteus_maximus: ['gluteus maximus'],
  gluteus_medius: ['gluteus medius'],
  gluteus_minimus: ['gluteus minimus'],
  piriformis: ['piriformis'],
  tfl: ['tensor fasciae latae'],
  itb: ['iliotibial tract'],
  sartorius: ['sartorius'],
  pectineus: ['pectineus'],
  adductors: ['adductor longus', 'adductor brevis', 'adductor magnus', 'adductor minimus'],
  gracilis: ['gracilis'],
  quadriceps_rf: ['rectus femoris'],
  vastus_lateralis: ['vastus lateralis'],
  vastus_medialis: ['vastus medialis'],
  vastus_intermedius: ['vastus intermedius'],
  biceps_femoris: ['long head of biceps femoris', 'short head of biceps femoris'],
  semi_group: ['semitendinosus', 'semimembranosus'],
  popliteus: ['popliteus'],

  tibialis_anterior: ['tibialis anterior'],
  edl_leg: ['extensor digitorum longus'],
  ehl: ['extensor hallucis longus'],
  peroneus_longus: ['fibularis longus'],
  peroneus_brevis: ['fibularis brevis'],
  peroneus_tertius: ['fibularis tertius'],
  gastrocnemius: ['medial head of gastrocnemius', 'lateral head of gastrocnemius'],
  soleus: ['soleus'],
  achilles: ['calcaneal tendon'],
  tibialis_posterior: ['tibialis posterior'],
  fhl_fdl: ['flexor hallucis longus', 'flexor digitorum longus'],
  abductor_hallucis: ['abductor hallucis'],
  plantar_intrinsics: ['flexor digitorum brevis', 'flexor accessorius'],
};

// 骨骼圖層：略過牙齒、牙齦、聽小骨等對體表定位沒有幫助的細碎結構
const BONE_SKIP = /gingiva|tooth|teeth|incisor|canine|premolar|molar|malleus|incus|stapes|hyoid bone of|nail/i;

// ---------------------------------------------------------------
// 讀取來源
// ---------------------------------------------------------------
const atlas = JSON.parse(fs.readFileSync(path.join(SRC, 'atlas.json'), 'utf8'));
const chunkBuffers = atlas.chunks.map(c => {
  const file = path.join(SRC, path.basename(c.url));
  const b = fs.readFileSync(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);  // 對齊過的副本
});

const readPart = p => ({
  pos: new Float32Array(chunkBuffers[p.chunk], p.positions, p.vertexCount * 3),
  idx: new Uint32Array(chunkBuffers[p.chunk], p.indices, p.indexCount),
});

const strip = s => s.toLowerCase()
  .replace(/^(left|right)\s+/, '')
  .replace(/\s+of\s+(left|right)\s+/g, ' of ')
  .replace(/\s+(left|right)\s+/g, ' ')
  .trim();
const isRight = p => /^right\b/i.test(p.name) || /\bright\b/i.test(p.name);

const byStripped = new Map();
for (const p of atlas.parts) {
  const k = strip(p.name);
  if (!byStripped.has(k)) byStripped.set(k, []);
  byStripped.get(k).push(p);
}
const partsNamed = want => (byStripped.get(want) || []).filter(p => !isRight(p));

// ---------------------------------------------------------------
// 幾何處理
// ---------------------------------------------------------------
await MeshoptSimplifier.ready;

/** 把多個來源網格併成一個，選擇性精簡，回傳 {pos, idx} */
function mergeAndSimplify(parts, ratio, error) {
  let vc = 0, ic = 0;
  for (const p of parts) { vc += p.vertexCount; ic += p.indexCount; }
  const pos = new Float32Array(vc * 3), idx = new Uint32Array(ic);
  let vo = 0, io = 0;
  for (const p of parts) {
    const { pos: sp, idx: si } = readPart(p);
    pos.set(sp, vo * 3);
    for (let i = 0; i < si.length; i++) idx[io + i] = si[i] + vo;
    vo += p.vertexCount; io += si.length;
  }
  const triCount = idx.length / 3;
  if (ratio >= 1 || triCount < 1200) return compact(pos, idx);   // 小網格再砍就會塌掉
  const target = Math.max(24, Math.floor(triCount * ratio) * 3);
  const [simplified] = MeshoptSimplifier.simplify(idx, pos, 3, target, error, ['LockBorder']);
  return compact(pos, simplified);
}

/** 丟掉未被索引到的頂點 */
function compact(pos, idx) {
  const map = new Int32Array(pos.length / 3).fill(-1);
  let n = 0;
  for (const i of idx) if (map[i] < 0) map[i] = n++;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < map.length; i++) {
    if (map[i] < 0) continue;
    out[map[i] * 3] = pos[i * 3]; out[map[i] * 3 + 1] = pos[i * 3 + 1]; out[map[i] * 3 + 2] = pos[i * 3 + 2];
  }
  const ni = new Uint32Array(idx.length);
  for (let i = 0; i < idx.length; i++) ni[i] = map[idx[i]];
  return { pos: out, idx: ni };
}

// ---------------------------------------------------------------
// 收集要輸出的部位
// ---------------------------------------------------------------
const groups = { skin: [], muscles: [], bones: [] };
const missing = [];

const skinParts = partsNamed('skin');
if (!skinParts.length) throw new Error('來源缺少 Skin');
groups.skin.push({ key: 'skin', name: 'Skin', parts: skinParts, ratio: 1 });

const usedByMuscles = new Set();
for (const [key, names] of Object.entries(MUSCLE_MAP)) {
  const parts = names.flatMap(partsNamed);
  if (!parts.length) { missing.push(key); continue; }
  for (const p of parts) usedByMuscles.add(p.id);
  groups.muscles.push({ key, name: names[0], parts, ratio: 0.55, error: 0.02 });
}

// 來源把脛前肌、提肩胛肌等歸在 skeletal，得把已經當肌肉用掉的部位排除，
// 骨骼層才不會混進肌肉。
for (const p of atlas.parts) {
  if (p.system !== 'skeletal' || isRight(p) || BONE_SKIP.test(p.name) || usedByMuscles.has(p.id)) continue;
  if (!/bone|vertebra|rib|sacrum|coccyx|sternum|scapula|clavicle|humerus|radius|ulna|carpal|metacarp|phalanx|femur|patella|tibia|fibula|tarsal|metatars|talus|calcaneus|navicular|cuboid|cuneiform|mandible|maxilla|skull|cranium|hyoid|pelvis|ilium|ischium|pubis|atlas|axis/i.test(p.name)) continue;
  groups.bones.push({ key: 'bone:' + p.id, name: p.name.replace(/^Left\s+/i, ''), parts: [p], ratio: 0.45, error: 0.03 });
}

console.log('肌肉對應 %d 條，缺 %d 條：%s', groups.muscles.length, missing.length, missing.join(', ') || '無');
console.log('骨骼 %d 件', groups.bones.length);

// 先跑一遍幾何，同時算全域包圍盒
const built = {};
for (const [g, list] of Object.entries(groups)) {
  built[g] = list.map(item => ({ ...item, geo: mergeAndSimplify(item.parts, item.ratio, item.error ?? 0.02) }));
}
const bb = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
for (const list of Object.values(built)) for (const it of list) {
  const p = it.geo.pos;
  for (let i = 0; i < p.length; i += 3) for (let a = 0; a < 3; a++) {
    if (p[i + a] < bb.min[a]) bb.min[a] = p[i + a];
    if (p[i + a] > bb.max[a]) bb.max[a] = p[i + a];
  }
}
// 量化留一點邊界餘裕，避免浮點誤差把值推出 0..65535
const qMin = bb.min.map(v => v - 0.001);
const qScale = bb.max.map((v, i) => (v + 0.001 - qMin[i]) / 65535);

// ---------------------------------------------------------------
// 打包
// ---------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
const manifest = {
  source: 'BodyParts3D 4.0 · The Database Center for Life Science · CC BY 4.0',
  via: 'https://github.com/ashemag/human-atlas',
  note: '只保留 ACU 需要的體表、肌肉與骨骼，單側資料，執行時鏡射；位置量化為 uint16。',
  quant: { min: qMin, scale: qScale },
  groups: {},
};

for (const [g, list] of Object.entries(built)) {
  const chunks = [];
  const records = [];
  let offset = 0;
  let tris = 0;
  for (const it of list) {
    const { pos, idx } = it.geo;
    const vc = pos.length / 3, ic = idx.length;
    const idx32 = vc > 65535;
    const qp = new Uint16Array(vc * 3);
    for (let i = 0; i < vc; i++) for (let a = 0; a < 3; a++) {
      qp[i * 3 + a] = Math.max(0, Math.min(65535, Math.round((pos[i * 3 + a] - qMin[a]) / qScale[a])));
    }
    const qi = idx32 ? new Uint32Array(idx) : new Uint16Array(idx);
    const pb = Buffer.from(qp.buffer, qp.byteOffset, qp.byteLength);
    const ib = Buffer.from(qi.buffer, qi.byteOffset, qi.byteLength);
    // indices 需要 4-byte 對齊時補齊
    const pad = idx32 ? (4 - ((offset + pb.length) % 4)) % 4 : 0;
    // 跨過正中線的結構（脊椎、胸骨、顱骨、皮膚）不鏡射，單側結構才鏡射
    let minX = Infinity, maxX = -Infinity;
    for (let i = 0; i < pos.length; i += 3) { if (pos[i] < minX) minX = pos[i]; if (pos[i] > maxX) maxX = pos[i]; }
    const bounds = [[minX, Infinity, Infinity], [maxX, -Infinity, -Infinity]];
    for (let i = 0; i < pos.length; i += 3) for (let a = 1; a < 3; a++) {
      if (pos[i + a] < bounds[0][a]) bounds[0][a] = pos[i + a];
      if (pos[i + a] > bounds[1][a]) bounds[1][a] = pos[i + a];
    }
    const mirror = !(minX < -0.02 && maxX > 0.02);
    records.push({
      key: it.key, name: it.name, p: offset, i: offset + pb.length + pad, vc, ic, idx32, mirror,
      bounds: bounds.map(b => b.map(v => +v.toFixed(4))),
    });
    chunks.push(pb);
    if (pad) chunks.push(Buffer.alloc(pad));
    chunks.push(ib);
    offset += pb.length + pad + ib.length;
    tris += ic / 3;
  }
  const raw = Buffer.concat(chunks);
  const gz = zlib.gzipSync(raw, { level: 9 });
  fs.writeFileSync(path.join(OUT, `${g}.bin.gz`), gz);
  manifest.groups[g] = { file: `${g}.bin.gz`, bytes: raw.length, gzipBytes: gz.length, parts: records };
  console.log('%s: %d 件 / %s 三角形 / %s KB → gzip %s KB',
    g, records.length, tris.toLocaleString(), (raw.length / 1024).toFixed(0), (gz.length / 1024).toFixed(0));
}

// ---------------------------------------------------------------
// 骨架 landmark（穴位 retarget 用）
// ---------------------------------------------------------------
function verticesOf(names) {
  const parts = names.flatMap(partsNamed);
  if (!parts.length) throw new Error('找不到部位: ' + names.join(', '));
  const out = [];
  for (const p of parts) {
    const { pos } = readPart(p);
    for (let i = 0; i < pos.length; i += 3) out.push([pos[i], pos[i + 1], pos[i + 2]]);
  }
  return out;
}
/** 沿某軸取極端 frac 比例的頂點質心；sign=+1 取最大側、-1 取最小側 */
function extremeCentroid(names, axis, sign, frac = 0.06) {
  const v = verticesOf(names);
  v.sort((a, b) => (b[axis] - a[axis]) * sign);
  const n = Math.max(1, Math.round(v.length * frac));
  const c = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) c[a] += v[i][a];
  return c.map(x => +(x / n).toFixed(4));
}
function centroid(names) {
  const v = verticesOf(names);
  const c = [0, 0, 0];
  for (const p of v) for (let a = 0; a < 3; a++) c[a] += p[a];
  return c.map(x => +(x / v.length).toFixed(4));
}

const VERTEBRAE = {
  C1: 'first cervical vertebra', C2: 'second cervical vertebra', C3: 'third cervical vertebra',
  C4: 'fourth cervical vertebra', C5: 'fifth cervical vertebra', C6: 'sixth cervical vertebra',
  C7: 'seventh cervical vertebra',
  T1: 'first thoracic vertebra', T2: 'second thoracic vertebra', T3: 'third thoracic vertebra',
  T4: 'fourth thoracic vertebra', T5: 'fifth thoracic vertebra', T6: 'sixth thoracic vertebra',
  T7: 'seventh thoracic vertebra', T8: 'eighth thoracic vertebra', T9: 'ninth thoracic vertebra',
  T10: 'tenth thoracic vertebra', T11: 'eleventh thoracic vertebra', T12: 'twelfth thoracic vertebra',
  L1: 'first lumbar vertebra', L2: 'second lumbar vertebra', L3: 'third lumbar vertebra',
  L4: 'fourth lumbar vertebra', L5: 'fifth lumbar vertebra',
  S: 'sacrum',
};
const spinous = {};
for (const [k, name] of Object.entries(VERTEBRAE)) {
  if (!partsNamed(name).length) continue;
  // 棘突尖＝最後方的一小撮頂點
  spinous[k] = extremeCentroid([name], 2, -1, 0.04);
}

const landmarks = {
  vertex: extremeCentroid(['skin'], 1, +1, 0.0005),
  headCenter: centroid(['frontal bone', 'occipital bone', 'parietal bone']),
  jaw: extremeCentroid(['mandible'], 1, -1, 0.08),
  shoulder: extremeCentroid(['humerus'], 1, +1, 0.06),
  elbow: extremeCentroid(['humerus'], 1, -1, 0.06),
  wrist: extremeCentroid(['radius', 'ulna'], 1, -1, 0.06),
  palm: extremeCentroid(['third metacarpal bone'], 1, -1, 0.15),
  fingertip: extremeCentroid(['distal phalanx of middle finger'], 1, -1, 0.2),
  hip: extremeCentroid(['femur'], 1, +1, 0.05),
  knee: extremeCentroid(['femur'], 1, -1, 0.06),
  ankle: centroid(['talus']),
  heel: extremeCentroid(['calcaneus'], 2, -1, 0.12),
  toe: extremeCentroid(['distal phalanx of second toe', 'distal phalanx of big toe'], 2, +1, 0.2),
  coccyx: extremeCentroid(['sacrum'], 1, -1, 0.05),
  // 肩胛骨內緣到後正中線＝3寸，用來換算背部的骨度分寸
  scapulaMedial: extremeCentroid(['scapula'], 0, -1, 0.05),
  sternumTop: extremeCentroid(['body of sternum'], 1, +1, 0.08),
  sternumBottom: extremeCentroid(['body of sternum'], 1, -1, 0.08),
  spinous,
};
landmarks.cunBack = +(Math.abs(landmarks.scapulaMedial[0]) / 3).toFixed(4);
manifest.landmarks = landmarks;

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
const total = Object.values(manifest.groups).reduce((s, g) => s + g.gzipBytes, 0);
console.log('landmark:', JSON.stringify({ ...landmarks, spinous: Object.keys(spinous).length + ' 節' }, null, 1));
console.log('總計 gzip %s MB → %s', (total / 1048576).toFixed(2), OUT);
