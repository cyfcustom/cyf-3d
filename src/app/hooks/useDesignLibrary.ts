import { useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { layersAtom, modelSectionsMapAtom, activeSectionAtom } from '../store/atoms';
import { savedDesignsAtom } from '../store/savedDesignsAtom';
import {
  SavedDesign,
  createSavedDesign,
  upsertDesign,
  removeDesignFromList,
  designLibrarySize,
  STORAGE_HARD_LIMIT_BYTES,
} from '../lib/designLibrary';
import type { Layer } from '../store/atoms';
import type { Section } from '../types/sections';

/**
 * Persistence hook for saved designs.
 *
 *  - saveDesign()  normalizes (downsamples images), persists, returns the
 *                  SavedDesign or null on quota/parse errors.
 *  - applyDesign() loads a design into the live configurator state:
 *                  sections (colors/visibility) → modelSectionsMapAtom,
 *                  layers → layersAtom, active section reset to 'front'.
 *  - removeDesign() deletes a design from the library.
 *
 * The same hook powers the inline configurator UI today and any future
 * standalone "cargar diseño" component — they share localStorage state.
 */
export function useDesignLibrary() {
  const { t } = useTranslation('configurator');
  const [designs, setDesigns] = useAtom(savedDesignsAtom);
  const setLayers = useSetAtom(layersAtom);
  const setSectionsMap = useSetAtom(modelSectionsMapAtom);
  const setActiveSection = useSetAtom(activeSectionAtom);

  const saveDesign = useCallback(
    async (input: {
      name: string;
      modelSlug: string;
      modelName: string;
      sections: Section[];
      layers: Layer[];
      preview: string | null;
    }): Promise<SavedDesign | null> => {
      try {
        const design = await createSavedDesign(input);
        const next = upsertDesign(designs, design);
        if (designLibrarySize(next) > STORAGE_HARD_LIMIT_BYTES) {
          toast.error(t('designLibrary.storageFull'));
          return null;
        }
        setDesigns(next);
        return design;
      } catch (err) {
        console.error('saveDesign failed:', err);
        toast.error(t('designLibrary.saveError'));
        return null;
      }
    },
    [designs, setDesigns, t]
  );

  const applyDesign = useCallback(
    (design: SavedDesign) => {
      setSectionsMap(prev => ({ ...prev, [design.modelSlug]: design.sections }));
      setLayers(design.layers);
      setActiveSection('front');
      toast.success(t('designLibrary.loaded', { name: design.name }), {
        duration: 2500,
      });
    },
    [setSectionsMap, setLayers, setActiveSection, t]
  );

  const removeDesign = useCallback(
    (id: string) => {
      setDesigns(prev => removeDesignFromList(prev, id));
      toast.success(t('designLibrary.deleted'), { duration: 1500 });
    },
    [setDesigns, t]
  );

  return { designs, saveDesign, applyDesign, removeDesign };
}