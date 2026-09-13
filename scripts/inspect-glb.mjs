// Pure-Node GLB inspector — no WebGL needed.
// Parses the GLB binary header + JSON chunk to list mesh & material names.

import { readFile } from 'node:fs/promises';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node scripts/inspect-glb.mjs <path-to-glb>');
  process.exit(1);
}

const buf = await readFile(path);

// GLB header: 12 bytes
//   0-3:   magic "glTF"
//   4-7:   version (uint32 = 2)
//   8-11:  total length (uint32)
//   12-15: chunk 0 length (JSON)
//   16-17: chunk 0 type (JSON = 0x4E4F534A "JSON")
const magic = buf.toString('utf8', 0, 4);
if (magic !== 'glTF') {
  console.error(`Not a GLB file (magic=${magic})`);
  process.exit(1);
}

const version = buf.readUInt32LE(4);
const totalLength = buf.readUInt32LE(8);
const jsonChunkLength = buf.readUInt32LE(12);
const jsonChunkType = buf.readUInt32LE(16);

if (jsonChunkType !== 0x4E4F534A) {
  console.error(`Expected JSON chunk, got 0x${jsonChunkType.toString(16)}`);
  process.exit(1);
}

const jsonStart = 20; // header(12) + chunkHeader(8)
const jsonText = buf.toString('utf8', jsonStart, jsonStart + jsonChunkLength);
const gltf = JSON.parse(jsonText);

console.log(`\n=== GLB: ${path} ===`);
console.log(`version=${version}, totalLength=${totalLength}, jsonChunkLength=${jsonChunkLength}\n`);

console.log(`Asset: ${gltf.asset?.generator ?? '?'} (${gltf.asset?.version ?? '?'})\n`);

const nodeNames = new Map((gltf.nodes ?? []).map((n, i) => [i, n.name ?? `node_${i}`]));
const meshParents = new Map(); // mesh index -> node index

(gltf.nodes ?? []).forEach((n, i) => {
  if (typeof n.mesh === 'number') meshParents.set(n.mesh, i);
});

console.log('=== Meshes ===');
(gltf.meshes ?? []).forEach((mesh, i) => {
  const nodeIdx = meshParents.get(i);
  const nodeName = nodeIdx !== undefined ? nodeNames.get(nodeIdx) : '(orphan)';
  const primCount = mesh.primitives?.length ?? 0;
  const primTypes = (mesh.primitives ?? []).map(p => {
    const matIdx = p.material ?? '(none)';
    const matName = (gltf.materials ?? [])[matIdx]?.name ?? `material_${matIdx}`;
    return `${p.mode === 4 ? 'TRI' : '?'}/${matName}`;
  });
  console.log(`  [${i}] name="${mesh.name ?? '(unnamed)'}" via_node="${nodeName}" primitives=${primCount} ${primTypes.join(', ')}`);
});

console.log('\n=== Materials ===');
(gltf.materials ?? []).forEach((mat, i) => {
  console.log(`  [${i}] name="${mat.name ?? '(unnamed)'}"`);
  const baseColor = mat.pbrMetallicRoughness?.baseColorTexture;
  if (baseColor !== undefined) {
    const texIdx = baseColor.index;
    const texName = (gltf.textures ?? [])[texIdx]?.name ?? `tex_${texIdx}`;
    console.log(`       baseColorTexture → ${texName}`);
  }
});

console.log('\n=== Nodes ===');
(gltf.nodes ?? []).forEach((node, i) => {
  const childCount = (node.children ?? []).length;
  console.log(`  [${i}] name="${node.name ?? '(unnamed)'}" mesh=${node.mesh !== undefined ? meshParents.has(node.mesh) ? node.mesh : node.mesh : '(none)'} children=${childCount}`);
});

console.log(`\nTotal: ${(gltf.meshes ?? []).length} meshes, ${(gltf.materials ?? []).length} materials, ${(gltf.nodes ?? []).length} nodes`);
