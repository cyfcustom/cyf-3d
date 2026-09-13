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
  scale?: number;
  x?: number;       // 0-1 horizontal position, default 0.5
  y?: number;       // 0-1 vertical position, default 0.4
  side?: SectionId; // which section this image belongs to, default 'front'
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
export type ConfiguratorTool = 'estampado' | 'colores';
export const activeToolAtom = atom<ConfiguratorTool>('estampado');