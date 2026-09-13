import type { DynamicTexture } from '@babylonjs/core';
import type { Layer } from '../../../store/atoms';
import type { SectionId } from '../../../types/sections';

/**
 * Texture size for each section's DynamicTexture in Babylon.
 * 1024×1024 — large enough to map cleanly onto a garment mesh without
 * aliasing when the camera zooms in.
 */
export const TEX_SIZE = 1024;

/** Reference dimension: a layer at scale=1 fills this many texture pixels. */
export const IMG_BASE_SIZE = 400;

/**
 * Repaint a section's DynamicTexture with its base color + all layers
 * assigned to that section.
 *
 * Coordinate system: layer.x / layer.y are normalized (0-1) on the
 * texture; the drawImage call draws centered at (cx, cy) with width/height
 * derived from layer.scale (fraction of print area width) and aspect.
 */
export function redrawSectionTexture(
  texture: DynamicTexture,
  color: string,
  layers: Layer[],
  sectionId: SectionId,
  imagesCache: Map<string, HTMLImageElement>
): void {
  const ctx = texture.getContext();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  const sectionLayers = layers.filter(
    l => (l.side || 'front') === sectionId
  );
  for (const layer of sectionLayers) {
    const img = imagesCache.get(layer.id);
    if (!img) continue;

    const scale = Math.max(0, layer.scale ?? 1);
    const imgAspect = img.width / img.height;
    let w: number, h: number;
    if (imgAspect >= 1) {
      w = IMG_BASE_SIZE * scale;
      h = w / imgAspect;
    } else {
      h = IMG_BASE_SIZE * scale;
      w = h * imgAspect;
    }
    // Hard floor: never render below ~5% of print area so a zero/negative
    // scale doesn't make the image disappear entirely.
    const MIN_DIM = IMG_BASE_SIZE * 0.05;
    if (w < MIN_DIM) w = MIN_DIM;
    if (h < MIN_DIM) h = MIN_DIM;

    const cx = (layer.x ?? 0.5) * TEX_SIZE;
    const cy = (layer.y ?? 0.4) * TEX_SIZE;
    const rotationDeg = layer.rotation ?? 0;
    const rotationRad = (rotationDeg * Math.PI) / 180;
    // UV flips (uScale=-1, vScale=-1 + invertY=true default) on the texture
    // compensate for this model's UV authoring.
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotationRad);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  texture.update();
}
