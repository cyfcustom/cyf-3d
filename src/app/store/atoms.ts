import { atom } from 'jotai';

// Layer interface
export interface Layer {
  id: string;
  name: string;
  thumbnail: string;
  rotation?: number;
  scale?: number;
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
export const selectedColorNameAtom = atom<string>('Blanco');
export const productConfigAtom = atom<ProductConfig>({
  type: 'tshirt',
  size: 'M',
  baseColor: '#FFFFFF',
  baseColorName: 'Blanco',
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

export const authUserAtom = atom<AuthUser | null>(null);
export const isAuthenticatedAtom = atom<boolean>(false);
export const mfaRequiredAtom = atom<boolean>(false);