import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils'; // still used by cartAtom
import type { SectionId, Section } from '../types/sections';

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  unitPriceUsd: number;
  quantity: number;
  /** 'sublimacion' | 'dtf' | 'vinil' | etc. */
  printTechnique: string | null;
  size: string | null;
  color: string | null;
  minOrderQty: number;
}

export const cartAtom = atomWithStorage<CartItem[]>('cyf-cart-v1', []);

export const cartOpenAtom = atom<boolean>(false);

export const cartCountAtom = atom((get) =>
  get(cartAtom).reduce((sum, item) => sum + item.quantity, 0)
);

export const cartTotalAtom = atom((get) =>
  get(cartAtom).reduce((sum, item) => sum + item.unitPriceUsd * item.quantity, 0)
);

// Layer interface
export interface Layer {
  id: string;
  name: string;
  thumbnail: string;
  rotation?: number;
  /**
   * Image size as a fraction of the print area width (0-1).
   *  - 1.0 = image fills the print area width (PRINT_W = 400px on Fabric canvas,
   *         IMG_BASE_SIZE = 400px on Babylon texture)
   *  - 0.5 = image at half the print area width
   * Same unit used by FabricEditor and BabylonCanvas so a drag in 2D keeps
   * the 3D projection in lockstep with what the user sees.
   */
  scale?: number;
  x?: number;       // 0-1 horizontal position, default 0.5
  y?: number;       // 0-1 vertical position, default 0.4
  side?: SectionId; // which section this image belongs to, default 'front'
  /** Native pixel dimensions of the source image, captured on upload. */
  naturalWidth?: number;
  naturalHeight?: number;
  /** Horizontal flip (mirror) — persists across re-renders. */
  flipX?: boolean;
  /** Vertical flip — persists across re-renders. */
  flipY?: boolean;
}

// Product configuration
export interface ProductConfig {
  type: 'tshirt' | 'mug' | 'baby-body' | 'thermo';
  size: 'S' | 'M' | 'L' | 'XL';
  baseColor: string;
  baseColorName: string;
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  message: string;
}

// Atoms
export const layersAtom = atom<Layer[]>([]);
export const selectedColorAtom = atom<string>('#FFFFFF');
export const selectedColorNameAtom = atom<string>('White');
export const productConfigAtom = atom<ProductConfig>({
  type: 'tshirt',
  size: 'M',
  baseColor: '#FFFFFF',
  baseColorName: 'White',
});
export const loadingStateAtom = atom<LoadingState>({
  isLoading: false,
  message: '',
});
export const showSuccessModalAtom = atom<boolean>(false);
export const designPreviewAtom = atom<string | null>(null);

// Auth state
export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

// SEC-7: session-only auth state — not persisted in localStorage
// ProtectedRoute has isChecking=true state that prevents flash redirect on reload
export const authUserAtom = atom<AuthUser | null>(null);

export const isAuthenticatedAtom = atom<boolean>(false);

// MFA required is session-only (not persisted)
export const mfaRequiredAtom = atom<boolean>(false);

// 3D Configurator — print areas & design textures
export const activePrintAreaAtom = atom<string | null>(null);
export const designTexturesAtom = atom<Record<string, string>>({});

// Per-model sections map, keyed by model slug.
// Persisted to localStorage so color/visibility edits survive reloads and
// direct deep-link navigation to /configurator/:slug restores the state.
export const modelSectionsMapAtom = atomWithStorage<Record<string, Section[]>>(
  'cyf-model-sections-map',
  {}
);

// Active section the user is editing (in-memory only).
export const activeSectionAtom = atom<SectionId>('front');

// Active tool in the right-side icon bar.
export type ConfiguratorTool = 'estampado' | 'colores' | 'fondo';
export const activeToolAtom = atom<ConfiguratorTool>('estampado');

// Scene background — applied via CSS on the BabylonCanvas container.
// null = default (transparent canvas over the page's muted background).
export type SceneBackground =
  | { type: 'color'; value: string }
  | { type: 'image'; value: string }; // data URL or remote URL
export const sceneBackgroundAtom = atom<SceneBackground | null>(null);

// ─── Design folders (UI groupings of saved designs) ────────────────────────
// A folder is a plain object describing which saved_designs rows belong
// together. The right-side "Mis diseños" panel reads the active folder
// from this atom and reactively re-fetches when it changes, so any UI
// that sets `activeFolderAtom` automatically drives the panel — no
// changes to the panel component are needed.
//
// Folder types:
//   - 'all'             every design the signed-in user owns
//   - 'model'           designs for a specific product model (by slug)
//   - 'recent'          the N most recent designs
//   - 'ids'             a hand-picked list of design IDs (manual folder)
export type DesignFolder =
  | { type: 'all' }
  | { type: 'model'; modelSlug: string }
  | { type: 'recent'; limit?: number }
  | { type: 'ids'; ids: string[] };

export const activeFolderAtom = atom<DesignFolder>({ type: 'all' });