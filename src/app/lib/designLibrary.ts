import type { Layer } from '../store/atoms';
import type { Section } from '../types/sections';

// ─── SavedDesign ────────────────────────────────────────────────────────────
// A complete snapshot of a design made in the configurator: model + per-section
// colors/visibility + every image layer (thumbnail data URL + positions kept in
// normalized print-area units). This is what gets persisted so the design can be
// reloaded quickly — either in the configurator itself or in a separate
// "cargar diseño" component later.
//
// Storage note: images persist as data URLs inside a single atomWithStorage
// (localStorage JSON). To keep the payload reasonable, every image above
// STORAGE_IMAGE_MAX_DIM is downsampled on save. naturalWidth/naturalHeight are
// rewritten to the downsampled size so the Fabric↔Babylon print-area math
// (scale = fraction of print-area width) stays identical after reload.

export interface SavedDesign {
  id: string;
  name: string;
  modelSlug: string;
  modelName: string;
  createdAt: number;
  updatedAt: number;
  sections: Section[];
  layers: Layer[];
  /** Optional screenshot of the 3D view, used as a thumbnail in lists. */
  preview: string | null;
}

export const DESIGN_LIBRARY_KEY = 'cyf-saved-designs-v1';

/** Cap on how many designs are kept (oldest evicted first). */
export const MAX_STORED_DESIGNS = 12;

/** Longest edge kept for stored images (in px). Print area ≈ 400px, so 512
 * keeps full print resolution while bounding localStorage usage. */
export const STORAGE_IMAGE_MAX_DIM = 512;

/** Safety margin below the ~5MB localStorage quota (90%). */
export const STORAGE_HARD_LIMIT_BYTES = 4_500_000;

export function createDesignId(): string {
  return `design-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Imagen inválida'));
    img.src = dataUrl;
  });
}

/**
 * Returns the image downsampled to at most `maxDim` on its longest edge.
 * Images already within bounds are returned untouched (identity — avoids
 * re-encoding and losing alpha).
 */
export async function normalizeStoredImage(
  dataUrl: string | null,
  maxDim = STORAGE_IMAGE_MAX_DIM
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!dataUrl) return null;
  const img = await loadImage(dataUrl);
  const largest = Math.max(img.naturalWidth, img.naturalHeight);
  if (largest <= maxDim) {
    return { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
  }
  const scale = maxDim / largest;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const keepsAlpha = /^data:image\/(png|webp|gif)/i.test(dataUrl);
  const out = canvas.toDataURL(keepsAlpha ? 'image/png' : 'image/jpeg', 0.9);
  return { dataUrl: out, width: canvas.width, height: canvas.height };
}

/** Downsample a layer's thumbnail and align its natural dims with the result. */
export async function normalizeLayerForStorage(layer: Layer): Promise<Layer> {
  const normalized = await normalizeStoredImage(layer.thumbnail);
  if (!normalized) return layer;
  return {
    ...layer,
    thumbnail: normalized.dataUrl,
    naturalWidth: normalized.width,
    naturalHeight: normalized.height,
  };
}

/** Build a SavedDesign snapshot from the current configurator state. */
export async function createSavedDesign(input: {
  name: string;
  modelSlug: string;
  modelName: string;
  sections: Section[];
  layers: Layer[];
  preview: string | null;
}): Promise<SavedDesign> {
  const now = Date.now();
  const [layers, preview] = await Promise.all([
    Promise.all(input.layers.map(normalizeLayerForStorage)),
    normalizeStoredImage(input.preview),
  ]);
  return {
    id: createDesignId(),
    name: input.name.trim(),
    modelSlug: input.modelSlug,
    modelName: input.modelName,
    createdAt: now,
    updatedAt: now,
    sections: input.sections.map(s => ({
      ...s,
      print_area: s.print_area ? { ...s.print_area } : undefined,
    })),
    layers,
    preview: preview?.dataUrl ?? null,
  };
}

/** Upsert (by id) at the head, evicting the oldest beyond the cap. */
export function upsertDesign(list: SavedDesign[], next: SavedDesign): SavedDesign[] {
  const others = list.filter(d => d.id !== next.id);
  return [next, ...others].slice(0, MAX_STORED_DESIGNS);
}

export function removeDesignFromList(list: SavedDesign[], id: string): SavedDesign[] {
  return list.filter(d => d.id !== id);
}

/** Rough serialized size in bytes — used to guard the localStorage quota. */
export function designLibrarySize(list: SavedDesign[]): number {
  try {
    return JSON.stringify(list).length;
  } catch {
    return 0;
  }
}