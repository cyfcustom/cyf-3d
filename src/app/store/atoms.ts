import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

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
  side?: 'front' | 'back'; // which side of the product, default 'front'
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

// Persist auth state in localStorage
export const authUserAtom = atomWithStorage<AuthUser | null>(
  'cyf-Custom-auth-user',
  null
);

export const isAuthenticatedAtom = atomWithStorage<boolean>(
  'cyf-Custom-is-authenticated',
  false
);

// MFA required is session-only (not persisted)
export const mfaRequiredAtom = atom<boolean>(false);

// 3D Configurator — print areas & design textures
export const activePrintAreaAtom = atom<string | null>(null);
export const designTexturesAtom = atom<Record<string, string>>({});
export const activeSideAtom = atom<'front' | 'back'>('front');