import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// ─── Admin /admin/models — borradores resistentes a recarga ─────────────────
// Si la pagina se recarga (p.ej. al volver a una pestana inactiva con el dev
// server), los formularios pierden su estado con useState. Estos atomos se
// persisten en sessionStorage para que los borradores sobrevivan a la recarga
// dentro de la misma sesion de navegador.

export interface ModelDraft {
  name: string;
  category_id: string;
  description: string;
}

export interface CategoryDraft {
  name: string;
  icon: string;
}

export const EMPTY_MODEL_DRAFT: ModelDraft = { name: '', category_id: '', description: '' };
export const EMPTY_CATEGORY_DRAFT: CategoryDraft = { name: '', icon: '' };

/** Borrador del formulario "Nuevo modelo" (persistido). */
export const modelDraftAtom = atomWithStorage<ModelDraft>(
  'cyf-admin-model-draft',
  EMPTY_MODEL_DRAFT
);

/** Borrador del formulario de nueva categoria (persistido). */
export const categoryDraftAtom = atomWithStorage<CategoryDraft>(
  'cyf-admin-category-draft',
  EMPTY_CATEGORY_DRAFT
);

/** Indica si el formulario de nuevo modelo esta abierto (persistido). */
export const modelFormOpenAtom = atomWithStorage<boolean>('cyf-admin-model-form-open', false);

/** Pestana activa (persistido). */
export const activeTabAtom = atomWithStorage<'models' | 'categories'>(
  'cyf-admin-models-tab',
  'models'
);

// Un objeto File no se puede serializar en sessionStorage, asi que persisitimos
// solo el nombre para poder mostrarlo tras una recarga; el archivo en si se
// retiene en memoria (sobrevive remount, no a recarga completa).
export const modelFileNameAtom = atomWithStorage<string | null>('cyf-admin-model-file-name', null);
export const thumbnailFileNameAtom = atomWithStorage<string | null>(
  'cyf-admin-thumb-file-name',
  null
);

export const modelFileAtom = atom<File | null>(null);
export const thumbnailFileAtom = atom<File | null>(null);