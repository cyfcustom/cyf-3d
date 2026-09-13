// ── Sections ──────────────────────────────────────────────────────────────
// A section is a mappable surface on a product model (e.g. "Frente",
// "Manga Izquierda"). Each section binds:
//   - id:         canonical identifier (immutable, used in code)
//   - mesh_name:  mesh name in the .glb file (set by admin via inspector)
//   - display_name: shown in UI
//   - color:      per-section tint when no images are placed
//   - visible:    whether the section renders at all

export const SECTION_IDS = [
  'front',
  'back',
  'inside',
  'neck',
  'left_sleeve',
  'right_sleeve',
] as const;

export type SectionId = typeof SECTION_IDS[number];

export interface Section {
  id: SectionId;
  mesh_name: string;        // empty string = section has no mesh in this GLB
  display_name: string;
  color: string;             // hex color, e.g. "#FFFFFF"
  visible: boolean;
  sort_order: number;
}

export type SectionMap = Record<SectionId, Section | undefined>;

// Layer interface
export interface Layer {
  id: string;
  name: string;
  thumbnail: string;
  rotation?: number;
  scale?: number;
  x?: number;       // 0-1 horizontal position, default 0.5
  y?: number;       // 0-1 vertical position, default 0.4
  side?: SectionId; // which section this image belongs to
}
