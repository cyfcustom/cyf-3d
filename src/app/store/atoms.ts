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

// Theme type
export type Theme = 'light' | 'dark';

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

// Theme atom with localStorage persistence
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const themeAtom = atom<Theme>(getInitialTheme());