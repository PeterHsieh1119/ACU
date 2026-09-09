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

async function fetchBuffer(file) {
  const res = await fetch(new URL(file, BASE));
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  const payload = await res.arrayBuffer();
  // 伺服器若已經自動解壓（Content-Encoding: gzip），這裡就不會看到 gzip 魔術位元組
  const head = new Uint8Array(payload, 0, Math.min(2, payload.byteLength));
  if (head[0] !== 0x1f || head[1] !== 0x8b) return payload;
  if (typeof DecompressionStream !== 'function') throw new Error('瀏覽器不支援 DecompressionStream');
  const stream = new Blob([payload]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).arrayBuffer();
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

async function loadGroup(manifest, name) {
  const group = manifest.groups[name];
  if (!group) throw new Error(`manifest 缺少群組 ${name}`);
  const buffer = await fetchBuffer(group.file);
  return group.parts.map(rec => ({
    key: rec.key,
    name: rec.name,
    mirror: rec.mirror,
    bounds: rec.bounds,
    geometry: geometryFromRecord(buffer, rec, manifest.quant),
  }));
}

/**
 * 載入體表與肌肉（骨骼另外用 loadBones() 延遲載入）。
 * 任何一步失敗都會 reject，呼叫端要能退回內建的示意模型。
 */
export async function loadAnatomy() {
  const manifest = await (await fetch(new URL('manifest.json', BASE))).json();
  const [skin, muscles] = await Promise.all([loadGroup(manifest, 'skin'), loadGroup(manifest, 'muscles')]);
  return {
    manifest,
    landmarks: manifest.landmarks,
    skin: skin[0],
    muscles: new Map(muscles.map(m => [m.key, m])),
    loadBones: () => loadGroup(manifest, 'bones'),
  };
}
