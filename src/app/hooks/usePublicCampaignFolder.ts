import { useEffect, useState } from 'react';
import { getPublicCampaignFolder, getDesignsByIdsPublic } from '../lib/designs';
import type { SavedDesign, UserFolder } from '../lib/designs';

interface UsePublicCampaignFolderResult {
  folder: UserFolder | null;
  designs: SavedDesign[];
  loading: boolean;
  error: string | null;
}

/**
 * Reads a public design_folders row (matched by `slug`) and the
 * saved_designs it references — entirely anon-safe. RLS gates the rows:
 * the folder must have is_public = true, and each design must be
 * referenced by a public folder.
 *
 * Used by the JuntosASeulPage to render the campaign's curated designs
 * for any visitor (no login required).
 */
export function usePublicCampaignFolder(slug: string): UsePublicCampaignFolderResult {
  const [folder, setFolder] = useState<UserFolder | null>(null);
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const f = await getPublicCampaignFolder(slug);
        if (cancelled) return;
        setFolder(f);
        if (!f || f.designIds.length === 0) {
          setDesigns([]);
          setLoading(false);
          return;
        }
        const rows = await getDesignsByIdsPublic(f.designIds);
        if (cancelled) return;
        // Preserve folder order.
        const byId = new Map(rows.map(d => [d.id, d]));
        const ordered = f.designIds
          .map(id => byId.get(id))
          .filter((d): d is SavedDesign => !!d);
        setDesigns(ordered);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  return { folder, designs, loading, error };
}