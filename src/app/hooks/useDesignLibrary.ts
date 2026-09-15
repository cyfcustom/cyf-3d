import { useCallback, useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  layersAtom,
  modelSectionsMapAtom,
  activeSectionAtom,
  sceneBackgroundAtom,
} from '../store/atoms';
import { useAuth } from './useAuth';
import {
  SavedDesign,
  saveDesign as saveDesignRemote,
  deleteDesign as deleteDesignRemote,
  listDesigns,
} from '../lib/designs';
import type { Layer, SceneBackground } from '../store/atoms';
import type { Section } from '../types/sections';

/**
 * Supabase-backed hook for the configurator's design library.
 *
 *  - Fetch: loads the signed-in user's designs (optionally filtered by
 *    model_slug) from saved_designs. RLS scopes to own rows, so this is
 *    safe for any authenticated user. Unauthenticated callers get an
 *    empty list (RLS returns nothing) and save is blocked.
 *  - saveDesign: uploads each layer thumbnail + the 3D preview to the
 *    design-images bucket, then INSERTs the saved_designs row.
 *  - applyDesign: loads a design's sections + layers into the live
 *    configurator state (same atoms the configurator writes when the
 *    user edits).
 *  - removeDesign: deletes the row + best-effort cleans its storage.
 *
 * The same hook powers the inline "Mis diseños" UI in the configurator
 * today and any future standalone "Cargar diseño" component.
 */
export function useDesignLibrary(opts: { modelSlug?: string } = {}) {
  const { modelSlug } = opts;
  const { t } = useTranslation('configurator');
  const { authUser } = useAuth();

  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLayers = useSetAtom(layersAtom);
  const setSectionsMap = useSetAtom(modelSectionsMapAtom);
  const setActiveSection = useSetAtom(activeSectionAtom);
  const setBackground = useSetAtom(sceneBackgroundAtom);
  const background = useAtomValue(sceneBackgroundAtom);

  const refresh = useCallback(async () => {
    if (!authUser) {
      setDesigns([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const rows = await listDesigns(modelSlug);
      setDesigns(rows);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setDesigns([]);
    } finally {
      setIsLoading(false);
    }
  }, [authUser, modelSlug]);

  // Refetch when the user or the model filter changes.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveDesign = useCallback(
    async (input: {
      name: string;
      modelSlug: string;
      sections: Section[];
      layers: Layer[];
      previewDataUrl: string | null;
    }): Promise<SavedDesign | null> => {
      if (!authUser) {
        toast.error(t('designLibrary.loginRequired'));
        return null;
      }
      try {
        const saved = await saveDesignRemote({
          userId: authUser.id,
          name: input.name,
          modelSlug: input.modelSlug,
          sections: input.sections,
          layers: input.layers,
          previewDataUrl: input.previewDataUrl,
          background,
        });
        toast.success(t('designLibrary.saved', { name: saved.name }), { duration: 2000 });
        await refresh();
        return saved;
      } catch (e: any) {
        console.error('saveDesign failed', e);
        toast.error(t('designLibrary.saveError', { detail: e?.message ?? '' }));
        return null;
      }
    },
    [authUser, refresh, t, background]
  );

  const applyDesign = useCallback(
    (design: SavedDesign) => {
      const targetSlug = design.modelSlug ?? modelSlug;
      if (!targetSlug) return;
      setSectionsMap(prev => ({ ...prev, [targetSlug]: design.sections }));
      setLayers(design.layers);
      setActiveSection('front');
      // Restore the background that was active at save time. Older
      // designs (saved before the background field existed) carry
      // background === null and reset to the default transparent canvas.
      setBackground(design.background ?? null);
      toast.success(t('designLibrary.loaded', { name: design.name ?? '' }), { duration: 2000 });
    },
    [modelSlug, setSectionsMap, setLayers, setActiveSection, setBackground, t]
  );

  const removeDesign = useCallback(
    async (design: SavedDesign): Promise<boolean> => {
      try {
        await deleteDesignRemote(design);
        toast.success(t('designLibrary.deleted'), { duration: 1500 });
        await refresh();
        return true;
      } catch (e: any) {
        console.error('removeDesign failed', e);
        toast.error(t('designLibrary.deleteError', { detail: e?.message ?? '' }));
        return false;
      }
    },
    [refresh, t]
  );

  return {
    designs,
    isLoading,
    error,
    isAuthenticated: !!authUser,
    refresh,
    saveDesign,
    applyDesign,
    removeDesign,
  };
}