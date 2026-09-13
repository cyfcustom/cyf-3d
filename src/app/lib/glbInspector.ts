// Pure-JS GLB mesh inspector — no WebGL, no Babylon, runs in the browser.
// Used by AdminModelsPage to list meshes of an uploaded .glb so the admin
// can map them to canonical sections without guessing.
//
// Returns: Array<{ index, name }> — one entry per mesh in the GLB.
//
// GLB format spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#binary-gltf-layout
//   Header (12 bytes):
//     [0..4)   magic "glTF"
//     [4..8)   uint32 version (= 2)
//     [8..12)  uint32 total length
//   Chunk 0 (JSON):
//     [12..16) uint32 length
//     [16..20) uint32 type (= 0x4E4F534A "JSON")
//     [20..20+length) JSON payload (gltf)
//
// Mesh & node relationship:
//   gltf.nodes[i].mesh  →  index into gltf.meshes
//   gltf.meshes[i].name  →  human-readable name (often "front", "back", etc.)

export interface GlbMeshInfo {
  index: number;
  name: string;
  /** Resolved name: mesh.name if set, else parent node's name. */
  display_name: string;
  primitive_count: number;
}

export async function inspectGlb(file: File | Blob | ArrayBuffer): Promise<GlbMeshInfo[]> {
  const buf = file instanceof ArrayBuffer
    ? file
    : await (file as Blob).arrayBuffer();
  const view = new DataView(buf);

  // ── Magic + version ────────────────────────────────────────────────
  const magic = new TextDecoder().decode(new Uint8Array(buf, 0, 4));
  if (magic !== 'glTF') {
    throw new Error(`No es un archivo GLB (magic="${magic}")`);
  }
  const version = view.getUint32(4, true);
  if (version !== 2) {
    throw new Error(`Versión GLB no soportada: ${version}`);
  }

  // ── Chunk 0 (JSON) ──────────────────────────────────────────────────
  const jsonChunkLength = view.getUint32(12, true);
  const jsonChunkType   = view.getUint32(16, true);
  if (jsonChunkType !== 0x4E4F534A) { // "JSON"
    throw new Error(`Primer chunk no es JSON (type=0x${jsonChunkType.toString(16)})`);
  }
  const jsonText = new TextDecoder().decode(
    new Uint8Array(buf, 20, jsonChunkLength)
  );
  const gltf = JSON.parse(jsonText);

  // ── Build node-name index ──────────────────────────────────────────
  const nodeNames = new Map<number, string>();
  (gltf.nodes ?? []).forEach((n: any, i: number) => {
    nodeNames.set(i, n.name ?? `node_${i}`);
  });

  // Map: mesh index → node index (so we can show the node's name when mesh has no name)
  const meshToNode = new Map<number, number>();
  (gltf.nodes ?? []).forEach((n: any) => {
    if (typeof n.mesh === 'number') meshToNode.set(n.mesh, n.index ?? -1);
  });

  // ── List meshes ────────────────────────────────────────────────────
  const meshes = (gltf.meshes ?? []) as any[];
  return meshes.map((m: any, index: number): GlbMeshInfo => {
    const nodeIndex = Array.from(meshToNode.entries()).find(([, nIdx]) => {
      // Re-derive since we lost the index in the map step
      return (gltf.nodes ?? []).findIndex(
        (n: any, i: number) => n.mesh === index && meshToNode.get(index) === i
      ) === nIdx;
    });
    // Simpler: walk nodes to find which one references this mesh
    let parentNodeIdx = -1;
    for (let i = 0; i < (gltf.nodes ?? []).length; i++) {
      if ((gltf.nodes ?? [])[i]?.mesh === index) {
        parentNodeIdx = i;
        break;
      }
    }

    const name = m.name ?? '';
    const nodeName = parentNodeIdx >= 0 ? nodeNames.get(parentNodeIdx) ?? '' : '';
    const display_name = name || nodeName || `mesh_${index}`;

    return {
      index,
      name,
      display_name,
      primitive_count: m.primitives?.length ?? 0,
    };
  });
}

/**
 * Suggest which mesh corresponds to each canonical section, based on
 * naming heuristics. The admin can override any suggestion.
 */
export function suggestSectionMapping(
  meshes: GlbMeshInfo[]
): Record<string, string> {
  // Returns: { sectionId: meshName }
  const out: Record<string, string> = {};
  const lower = meshes.map(m => ({ ...m, _lname: m.display_name.toLowerCase() }));

  const match = (re: RegExp) => lower.find(m => re.test(m._lname))?.display_name;

  out.front         = match(/^front|pecho|chest|torso.*front/) ?? '';
  out.back          = match(/^back|espalda|rear/) ?? '';
  out.inside        = match(/inside|interior|back_inside|lining/) ?? '';
  out.neck          = match(/^neck|collar|cuello/) ?? '';
  out.left_sleeve   = match(/left.*sleeve|sleeve.*left|manga.*izq|left.*manga/) ?? '';
  out.right_sleeve  = match(/right.*sleeve|sleeve.*right|manga.*der|right.*manga/) ?? '';

  return out;
}
