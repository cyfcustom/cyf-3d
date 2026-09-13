import { atomWithStorage } from 'jotai/utils';
import { DESIGN_LIBRARY_KEY } from '../lib/designLibrary';
import type { SavedDesign } from '../lib/designLibrary';

/**
 * All saved designs, persisted to localStorage as one JSON blob.
 * Use `lib/designLibrary.ts` helpers (upsertDesign, removeDesignFromList,
 * designLibrarySize) to mutate it safely.
 */
export const savedDesignsAtom = atomWithStorage<SavedDesign[]>(
  DESIGN_LIBRARY_KEY,
  []
);