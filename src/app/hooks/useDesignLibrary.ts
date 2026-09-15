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
import type { DesignFolder } from '../store/atoms';
import { useAuth } from './useAuth';
import {
  SavedDesign,
  UserFolder,
  saveDesign as saveDesignRemote,
  deleteDesign as deleteDesignRemote,
  listDesigns,
  listDesignsByIds,
  listFolders,
  createFolder as createFolderRemote,
  deleteFolder as deleteFolderRemote,
  updateFolderDesigns,
} from '../lib/designs';
import type { Layer, SceneBackground } from '../store/atoms';
import type { Section } from '../types/sections';

/**
 * Resolves a DesignFolder to the Supabase listDesigns args expected by
 * lib/designs.ts. For 'custom' folders, the designIds are pulled from
 * the user's folder list (single source of truth: design_folders table).
 */
function folderToListArgs(
  folder: DesignFolder,
  folders: UserFolder[]
): { modelSlug?: string; ids?: string[]; limit?: number } {
  switch (folder.type) {
    case 'all':    return { limit: 100 };
    case 'model':  return { modelSlug: folder.modelSlug, limit: 100 };
    case 'recent': return { limit: folder.limit ?? 20 };
    case 'custom': {
      const f = folders.find(x => x.id === folder.folderId);
      return { ids: f?.designIds ?? [], limit: 100 };
    }
  }
}

/**
 * Supabase-backed hook for the configurator's design library.
 *
 *  - Fetch: loads designs matching the active `DesignFolder` plus the
 *    user's custom folders (from `design_folders`). RLS scopes to own
 *    rows. Switching the folder anywhere reactively re-fetches.
 *  - saveDesign / applyDesign / removeDesign: same as before.
 *  - createFolder / deleteFolder / toggleDesignInFolder: manage the
 *    user's custom folders and their membership.
 *
 * The "Mis diseños" panel (or any future "Cargar diseño" component)
 * just reads `designs` and `folders` — adding new folder types or
 * adding/removing designs never requires changes to the panel.
 */
export function useDesignLibrary(opts: { folder?: DesignFolder } = {}) {
  const { folder } = opts;
  const { t } = useTranslation('configurator');
  const { authUser } = useAuth();

  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLayers = useSetAtom(layersAtom);
  const setSectionsMap = useSetAtom(modelSectionsMapAtom);
  const setActiveSection = useSetAtom(activeSectionAtom);
  const setBackground = useSetAtom(sceneBackgroundAtom);
  const background = useAtomValue(sceneBackgroundAtom);

  const refreshFolders = useCallback(async () => {
    if (!authUser) { setFolders([]); return; }
    try {
      const rows = await listFolders();
      setFolders(rows);
    } catch (e: any) {
      console.warn('refreshFolders failed:', e);
    }
  }, [authUser]);

  const refresh = useCallback(async () => {
    if (!authUser) {
      setDesigns([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const args = folder ? folderToListArgs(folder, folders) : { limit: 100 };
      const rows = args.ids
        ? await listDesignsByIds(args.ids)
        : await listDesigns(args.modelSlug, args.limit);
      setDesigns(rows);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setDesigns([]);
    } finally {
      setIsLoading(false);
    }
  }, [authUser, folder, folders]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch folders + designs when the user, the folder, or the folder
  // list (membership) changes.
  useEffect(() => {
    refreshFolders();
    refresh();
  }, [refreshFolders, refresh]);

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
      const targetSlug = design.modelSlug;
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
    [setSectionsMap, setLayers, setActiveSection, setBackground, t]
  );

  const removeDesign = useCallback(
    async (design: SavedDesign): Promise<boolean> => {
      try {
        await deleteDesignRemote(design);
        // Also remove the design id from any custom folder so it
        // doesn't linger in the user's playlists.
        const affectedFolderIds = folders
          .filter(f => f.designIds.includes(design.id))
          .map(f => f.id);
        if (affectedFolderIds.length > 0) {
          await Promise.all(affectedFolderIds.map(async fid => {
            const f = folders.find(x => x.id === fid);
            if (!f) return;
            await updateFolderDesigns(
              fid,
              f.designIds.filter(id => id !== design.id)
            );
          }));
        }
        toast.success(t('designLibrary.deleted'), { duration: 1500 });
        await refresh();
        await refreshFolders();
        return true;
      } catch (e: any) {
        console.error('removeDesign failed', e);
        toast.error(t('designLibrary.deleteError', { detail: e?.message ?? '' }));
        return false;
      }
    },
    [folders, refresh, refreshFolders, t]
  );

  // ─── Folder CRUD ────────────────────────────────────────────────────

  const createFolder = useCallback(
    async (name: string): Promise<UserFolder | null> => {
      try {
        const folder = await createFolderRemote(name);
        await refreshFolders();
        toast.success(t('designLibrary.folderCreated', { name: folder.name }));
        return folder;
      } catch (e: any) {
        toast.error(t('designLibrary.folderCreateError', { detail: e?.message ?? '' }));
        return null;
      }
    },
    [refreshFolders, t]
  );

  const deleteFolder = useCallback(
    async (folderId: string): Promise<boolean> => {
      try {
        await deleteFolderRemote(folderId);
        await refreshFolders();
        toast.success(t('designLibrary.folderDeleted'));
        return true;
      } catch (e: any) {
        toast.error(t('designLibrary.folderDeleteError', { detail: e?.message ?? '' }));
        return false;
      }
    },
    [refreshFolders, t]
  );

  /**
   * Toggle a design's membership in a custom folder. Updates the local
   * folders state optimistically and persists to Supabase. The hook's
   * re-fetch (via the `folders` dep in `refresh`) picks up the change so
   * any active 'custom' folder's design list refreshes automatically.
   */
  const toggleDesignInFolder = useCallback(
    async (folderId: string, designId: string): Promise<void> => {
      const target = folders.find(f => f.id === folderId);
      if (!target) return;
      const has = target.designIds.includes(designId);
      const nextIds = has
        ? target.designIds.filter(id => id !== designId)
        : [...target.designIds, designId];

      // Optimistic update so the UI reflects the toggle immediately.
      setFolders(prev =>
        prev.map(f => (f.id === folderId ? { ...f, designIds: nextIds } : f))
      );

      try {
        await updateFolderDesigns(folderId, nextIds);
      } catch (e: any) {
        // Revert on failure.
        setFolders(prev =>
          prev.map(f => (f.id === folderId ? { ...f, designIds: target.designIds } : f))
        );
        toast.error(t('designLibrary.folderUpdateError', { detail: e?.message ?? '' }));
      }
    },
    [folders, t]
  );

  return {
    designs,
    folders,
    isLoading,
    error,
    isAuthenticated: !!authUser,
    refresh,
    saveDesign,
    applyDesign,
    removeDesign,
    createFolder,
    deleteFolder,
    toggleDesignInFolder,
  };
}