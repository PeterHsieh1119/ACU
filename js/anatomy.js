// 真實解剖幾何的載入器
//
// 資料由 scripts/build-anatomy.mjs 從 BodyParts3D 4.0 產生
// （© The Database Center for Life Science，CC BY 4.0，經 github.com/ashemag/human-atlas 整理）。
//
// 檔案格式：每個群組一個 gzip 過的二進位檔，內容是各部位依序排列的
//   位置（uint16 × 3，用 manifest.quant 反量化）與索引（uint16 或 uint32）。
// 法線不存檔，載入後即時計算，省下三分之一的體積。

import * as THREE from 'three';

const BASE = new URL('../data/anatomy/', import.meta.url);

/** index.html 在 head 就先發出的請求，這裡接手續用，避免重複下載 */
function takePrefetched(file) {
  const store = typeof window !== 'undefined' && window.__acuPrefetch;
  if (!store || !store[file]) return null;
  const p = store[file];
  delete store[file];
  return p;
}

async function fetchBuffer(file, onProgress) {
  const res = await (takePrefetched(file) || fetch(new URL(file, BASE)));
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  const payload = onProgress ? await readWithProgress(res, onProgress) : await res.arrayBuffer();
  // 伺服器若已經自動解壓（Content-Encoding: gzip），這裡就不會看到 gzip 魔術位元組
  const head = new Uint8Array(payload, 0, Math.min(2, payload.byteLength));
  if (head[0] !== 0x1f || head[1] !== 0x8b) return payload;
  if (typeof DecompressionStream !== 'function') throw new Error('瀏覽器不支援 DecompressionStream');
  const stream = new Blob([payload]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).arrayBuffer();
}

/** 邊下載邊回報進度，載入畫面才不會像卡住 */
async function readWithProgress(res, onProgress) {
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body) return await res.arrayBuffer();
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(received, total);
  }
  const out = new Uint8Array(received);
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.length; }
  return out.buffer;
}

function geometryFromRecord(buffer, rec, quant) {
  const q = new Uint16Array(buffer, rec.p, rec.vc * 3);
  const pos = new Float32Array(rec.vc * 3);
  const { min, scale } = quant;
  for (let i = 0; i < rec.vc; i++) {
    pos[i * 3] = min[0] + q[i * 3] * scale[0];
    pos[i * 3 + 1] = min[1] + q[i * 3 + 1] * scale[1];
    pos[i * 3 + 2] = min[2] + q[i * 3 + 2] * scale[2];
  }
  const idx = rec.idx32
    ? new Uint32Array(buffer.slice(rec.i, rec.i + rec.ic * 4))
    : new Uint16Array(buffer.slice(rec.i, rec.i + rec.ic * 2));

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeVertexNormals();
  return geo;
}

/** 沿 x 鏡射一份幾何（同時反轉三角形繞向，法線才會朝外） */
export function mirrorGeometry(geo) {
  const out = geo.clone();
  const p = out.attributes.position.array;
  for (let i = 0; i < p.length; i += 3) p[i] = -p[i];
  const idx = out.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = t; }
  out.computeVertexNormals();
  return out;
}

async function loadGroup(manifest, name, onProgress) {
  const group = manifest.groups[name];
  if (!group) throw new Error(`manifest 缺少群組 ${name}`);
  const buffer = await fetchBuffer(group.file, onProgress);
  return group.parts.map(rec => ({
    key: rec.key,
    name: rec.name,
    kind: rec.kind,
    mirror: rec.mirror,
    bounds: rec.bounds,
    geometry: geometryFromRecord(buffer, rec, manifest.quant),
  }));
}

/**
 * 只等體表就回傳——體表一到就能畫出人體與穴位。
 * 肌肉（約 0.8 MB）、骨骼（約 0.6 MB）與血管（約 0.3 MB）改由呼叫端在背景載入，
 * 不然首次開啟要等 2 MB 下載完才看得到東西。
 * 任何一步失敗都會 reject，呼叫端要能退回內建的示意模型。
 */
export async function loadAnatomy(onProgress) {
  const manifestRes = await (takePrefetched('manifest.json') || fetch(new URL('manifest.json', BASE)));
  const manifest = await manifestRes.json();
  const skin = await loadGroup(manifest, 'skin', onProgress);
  return {
    manifest,
    landmarks: manifest.landmarks,
    skin: skin[0],
    sizes: Object.fromEntries(Object.entries(manifest.groups).map(([k, g]) => [k, g.gzipBytes])),
    loadMuscles: p => loadGroup(manifest, 'muscles', p).then(list => new Map(list.map(m => [m.key, m]))),
    loadBones: p => loadGroup(manifest, 'bones', p),
    loadVessels: p => loadGroup(manifest, 'vessels', p),
  };
}
