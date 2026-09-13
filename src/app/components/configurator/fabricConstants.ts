// Shared constants and helpers for the FabricEditor + FabricToolbar.
//
// Print-area dimensions represent the conceptual canvas region for each
// section of a garment. They're independent of the underlying .glb mesh
// size — the 3D model's UV layout is what actually controls how a texture
// maps to the surface, but a matching aspect ratio in the 2D editor
// prevents squishing.

import type * as fabric from 'fabric';
import type { SectionId } from '../../types/sections';

export const CANVAS_SIZE = 600;

/** Print-area dimensions per section, in Fabric canvas pixels. */
export const SECTION_PRINT_AREAS: Record<SectionId, { width: number; height: number }> = {
  front:        { width: 400, height: 500 },
  back:         { width: 400, height: 500 },
  inside:       { width: 400, height: 500 },
  neck:         { width: 200, height: 80  },
  left_sleeve:  { width: 400, height: 250 },
  right_sleeve: { width: 400, height: 250 },
};

/** Default print area when the section isn't in the lookup (defensive). */
export const DEFAULT_PRINT_AREA = { width: 400, height: 500 };

/** Convenience accessor with fallback. */
export function getPrintArea(section: SectionId) {
  return SECTION_PRINT_AREAS[section] ?? DEFAULT_PRINT_AREA;
}

/** Centered print-area rect (the dashed outline + clip path). */
export function getPrintRect(section: SectionId) {
  const { width: w, height: h } = getPrintArea(section);
  return {
    x: (CANVAS_SIZE - w) / 2,
    y: (CANVAS_SIZE - h) / 2,
    width: w,
    height: h,
  };
}

/**
 * Floor on Fabric scaleX — keeps the image visible if the user collapses
 * a corner handle to 0 (which would otherwise render a 0×0 image and
 * make the 3D projection read as "microscopic").
 */
export const MIN_SCALE = 0.02;

export function clampScale(obj: fabric.Object | undefined) {
  if (!obj) return;
  const sx = obj.scaleX ?? 1;
  const sy = obj.scaleY ?? 1;
  if (sx < MIN_SCALE) obj.set({ scaleX: MIN_SCALE, scaleY: MIN_SCALE });
  else if (sy < MIN_SCALE) obj.set({ scaleX: MIN_SCALE, scaleY: MIN_SCALE });
}

export const SECTION_DISPLAY: Record<SectionId, string> = {
  front: 'Frente',
  back: 'Espalda',
  inside: 'Interior',
  neck: 'Cuello',
  left_sleeve: 'Manga I',
  right_sleeve: 'Manga D',
};
