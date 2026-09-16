import { supabase } from './supabase';
import type { Section } from '../types/sections';
import type { Layer, SceneBackground } from '../store/atoms';
import type { Database } from '../types/supabase';

// ───────────────────────────────────────────────────────────────────────────
// Design library (Supabase-backed).
//
// Persists saved designs in the existing `saved_designs` table (per-user
// RLS from migration 005_rls_base_tables.sql) and uploads layer/preview
// images to the `design-images` storage bucket. Cross-browser reload
// works because the layer thumbnails become public Supabase Storage URLs
// stored inside the JSONB `layers` column — any browser signed in as the
// same user can read them.
//
// Save flow:
//   1. Generate a client-side UUID for the new design (used both as the
//      row id and as the storage path prefix so paths are stable before
//      the INSERT).
//   2. Upload each layer thumbnail (data URL → blob → storage) and the
//      3D preview screenshot, replacing the data URL with the public URL.
//   3. INSERT the saved_designs row with the URL-bearing layers and the
//      sections snapshot. RLS ensures only the owning user can write it.
// ───────────────────────────────────────────────────────────────────────────

export const DESIGN_IMAGES_BUCKET = 'design-images';

export interface SavedDesign {
  id: string;
  name: string | null;
  modelSlug: string | null;
  userId: string | null;
  createdAt: string | null;
  sections: Section[];
  layers: Layer[];
  previewUrl: string | null;
  /**
   * Scene background at save time (color or image). Null = default
   * transparent. Stored inside the `configuration` JSONB column for
   * backward compatibility (no schema change required).
   */
  background: SceneBackground | null;
}

type SavedDesignRow = Database['public']['Tables']['saved_designs']['Row'];

/** Fresh UUID for a new design — used as the row id and storage prefix. */
export function createDesignId(): string {
  return (globalThis.crypto?.randomUUID?.() ?? `design-${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

/** Convert a data URL to a Blob (browser-only). */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/** Extract the MIME type from a data URL (e.g. 'image/png'). */
export function dataUrlMime(dataUrl: string): string {
  const m = /^data:([^;]+);/i.exec(dataUrl);
  return m?.[1] ?? 'image/png';
}

/** Map a MIME type to a storage-safe file extension. */
function mimeToExt(mime: string): string {
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('webp')) return 'webp';
  return 'png';
}

function designObjectPrefix(userId: string, designId: string): string {
  return `users/${userId}/designs/${designId}`;
}

/** Upload a blob to design-images and return its public URL. */
export async function uploadDesignBlob(
  userId: string,
  designId: string,
  fileName: string,
  blob: Blob
): Promise<string> {
  const path = `${designObjectPrefix(userId, designId)}/${fileName}`;
  const { error } = await supabase.storage
    .from(DESIGN_IMAGES_BUCKET)
    .upload(path, blob, { contentType: blob.type || 'image/png', upsert: false });
  if (error) throw new Error(`Upload failed (${fileName}): ${error.message}`);
  const { data } = supabase.storage.from(DESIGN_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Map a DB row to the frontend SavedDesign shape. */
export function toSavedDesign(row: SavedDesignRow): SavedDesign {
  const configuration = (row.configuration ?? {}) as {
    sections?: Section[];
    background?: SceneBackground | null;
  };
  const layers = (Array.isArray(row.layers) ? row.layers : []) as Layer[];
  return {
    id: row.id,
    name: row.name,
    modelSlug: row.model_slug ?? null,
    userId: row.user_id ?? null,
    createdAt: row.created_at ?? null,
    sections: Array.isArray(configuration.sections) ? configuration.sections : [],
    layers,
    previewUrl: row.preview_url ?? null,
    // Fallback to null for designs saved before the background field existed.
    background: configuration.background ?? null,
  };
}

/** Fetch the current user's saved designs, newest first. */
export async function listDesigns(modelSlug?: string, limit = 100): Promise<SavedDesign[]> {
  let q = supabase
    .from('saved_designs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (modelSlug) q = q.eq('model_slug', modelSlug);
  const { data, error } = await q;
  if (error) throw new Error(`listDesigns failed: ${error.message}`);
  return (data ?? []).map(toSavedDesign);
}

/** Fetch a specific set of designs by ID (for manual / "pinned" folders). */
export async function listDesignsByIds(ids: string[]): Promise<SavedDesign[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('saved_designs')
    .select('*')
    .in('id', ids)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`listDesignsByIds failed: ${error.message}`);
  // Preserve the caller-provided ordering for a predictable UX.
  const byId = new Map((data ?? []).map(d => [d.id, toSavedDesign(d)]));
  return ids.map(id => byId.get(id)).filter((d): d is SavedDesign => !!d);
}

// ─── Design folders ───────────────────────────────────────────────────────
// User-created folders are stored in the design_folders table. The
// folder's `designIds` is the single source of truth for membership —
// the activeFolderAtom just references the folder by id.

export interface UserFolder {
  id: string;
  name: string;
  slug: string | null;
  isPublic: boolean;
  designIds: string[];
  createdAt: string | null;
}

export async function listFolders(): Promise<UserFolder[]> {
  const { data, error } = await supabase
    .from('design_folders')
    .select('id, name, slug, is_public, design_ids, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`listFolders failed: ${error.message}`);
  return (data ?? []).map(d => ({
    id: d.id,
    name: d.name ?? '',
    slug: d.slug ?? null,
    isPublic: !!d.is_public,
    designIds: Array.isArray(d.design_ids) ? d.design_ids : [],
    createdAt: d.created_at ?? null,
  }));
}

export async function createFolder(name: string, slug?: string | null): Promise<UserFolder> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('El nombre de la carpeta no puede estar vacío');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('design_folders')
    .insert({
      name: trimmed,
      slug: slug?.trim() || null,
      user_id: user.id,
      design_ids: [],
      is_public: false,
    })
    .select('id, name, slug, is_public, design_ids, created_at')
    .single();
  if (error) throw new Error(`createFolder failed: ${error.message}`);
  return {
    id: data.id,
    name: data.name ?? '',
    slug: data.slug ?? null,
    isPublic: !!data.is_public,
    designIds: Array.isArray(data.design_ids) ? data.design_ids : [],
    createdAt: data.created_at ?? null,
  };
}

export async function deleteFolder(folderId: string): Promise<void> {
  const { error } = await supabase.from('design_folders').delete().eq('id', folderId);
  if (error) throw new Error(`deleteFolder failed: ${error.message}`);
}

export async function updateFolderDesigns(folderId: string, designIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('design_folders')
    .update({ design_ids: designIds })
    .eq('id', folderId);
  if (error) throw new Error(`updateFolderDesigns failed: ${error.message}`);
}

/** Owner-only: toggle whether a folder (and its designs) are publicly readable. */
export async function updateFolderPublic(folderId: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase
    .from('design_folders')
    .update({ is_public: isPublic })
    .eq('id', folderId);
  if (error) throw new Error(`updateFolderPublic failed: ${error.message}`);
}

// ─── Public reads (anon-safe, rely on RLS) ──────────────────────────────
// These are used by the campaign page (/juntos-a-seul) which is visited
// by anonymous users. They DON'T require auth — RLS gates the rows.

/** Fetch the most recent public folder matching `slug` (or name as fallback). */
export async function getPublicCampaignFolder(slug: string): Promise<UserFolder | null> {
  // Try slug first.
  const { data: bySlug } = await supabase
    .from('design_folders')
    .select('id, name, slug, is_public, design_ids, created_at')
    .eq('is_public', true)
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (bySlug) {
    return {
      id: bySlug.id,
      name: bySlug.name ?? '',
      slug: bySlug.slug ?? null,
      isPublic: !!bySlug.is_public,
      designIds: Array.isArray(bySlug.design_ids) ? bySlug.design_ids : [],
      createdAt: bySlug.created_at ?? null,
    };
  }
  // Fallback: match by name.
  const { data: byName } = await supabase
    .from('design_folders')
    .select('id, name, slug, is_public, design_ids, created_at')
    .eq('is_public', true)
    .eq('name', slug)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!byName) return null;
  return {
    id: byName.id,
    name: byName.name ?? '',
    slug: byName.slug ?? null,
    isPublic: !!byName.is_public,
    designIds: Array.isArray(byName.design_ids) ? byName.design_ids : [],
    createdAt: byName.created_at ?? null,
  };
}

/**
 * Fetch the saved_designs whose ids are listed in the given folder.
 * Works for both authenticated owners and anonymous visitors (the RLS
 * policy `public_select_designs_in_public_folders` lets anon read
 * designs that belong to a public folder).
 */
export async function getDesignsByIdsPublic(ids: string[]): Promise<SavedDesign[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('saved_designs')
    .select('*')
    .in('id', ids);
  if (error) throw new Error(`getDesignsByIdsPublic failed: ${error.message}`);
  const byId = new Map((data ?? []).map(d => [d.id, toSavedDesign(d)]));
  // Preserve the folder's ordering for a stable UX.
  return ids.map(id => byId.get(id)).filter((d): d is SavedDesign => !!d);
}

export async function getDesign(id: string): Promise<SavedDesign | null> {
  const { data, error } = await supabase
    .from('saved_designs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`getDesign failed: ${error.message}`);
  return data ? toSavedDesign(data) : null;
}

export interface SaveDesignInput {
  userId: string;
  name: string;
  modelSlug: string;
  sections: Section[];
  layers: Layer[];
  /** Optional data URL of the 3D preview screenshot. */
  previewDataUrl: string | null;
  /** Scene background (color or image) at save time. */
  background?: SceneBackground | null;
}

/**
 * Upload all layer/preview images, then INSERT the saved_designs row.
 * Throws on any upload or DB error — the caller surfaces a toast.
 */
export async function saveDesign(input: SaveDesignInput): Promise<SavedDesign> {
  const designId = createDesignId();

  // 1. Upload each layer thumbnail and swap the data URL for the public URL.
  const uploadedLayers: Layer[] = await Promise.all(
    input.layers.map(async (layer): Promise<Layer> => {
      // If it's already an http(s) URL (e.g. re-saving an edited loaded
      // design), keep it as-is and skip re-upload.
      if (/^https?:\/\//i.test(layer.thumbnail)) return layer;
      const blob = await dataUrlToBlob(layer.thumbnail);
      const ext = mimeToExt(blob.type || dataUrlMime(layer.thumbnail));
      const url = await uploadDesignBlob(
        input.userId, designId, `${layer.id}.${ext}`, blob
      );
      return { ...layer, thumbnail: url };
    })
  );

  // 2. Upload the preview screenshot if provided.
  let previewUrl: string | null = null;
  if (input.previewDataUrl) {
    const blob = await dataUrlToBlob(input.previewDataUrl);
    previewUrl = await uploadDesignBlob(
      input.userId, designId, `preview.${mimeToExt(blob.type || dataUrlMime(input.previewDataUrl))}`,
      blob
    );
  }

  // 3. INSERT the design row (RLS scopes to user_id = auth.uid()).
  const { data, error } = await supabase
    .from('saved_designs')
    .insert({
      id: designId,
      user_id: input.userId,
      name: input.name.trim(),
      model_slug: input.modelSlug,
      product_id: null,
      configuration: {
        sections: input.sections,
        background: input.background ?? null,
      },
      layers: uploadedLayers,
      preview_url: previewUrl,
    })
    .select('*')
    .single();
  if (error) throw new Error(`saveDesign insert failed: ${error.message}`);

  return toSavedDesign(data);
}

/** Delete the design row + best-effort cleanup of its storage objects. */
export async function deleteDesign(design: SavedDesign): Promise<void> {
  // 1. Remove the row first (RLS ensures own rows only).
  const { error } = await supabase
    .from('saved_designs')
    .delete()
    .eq('id', design.id);
  if (error) throw new Error(`deleteDesign failed: ${error.message}`);

  // 2. Best-effort storage cleanup. Orphan objects are cheap; ignore errors.
  if (design.userId) {
    const prefix = designObjectPrefix(design.userId, design.id);
    try {
      const { data: listed } = await supabase.storage
        .from(DESIGN_IMAGES_BUCKET)
        .list(prefix, { limit: 1000 });
      if (listed && listed.length > 0) {
        const paths = listed.map(o => `${prefix}/${o.name}`);
        await supabase.storage.from(DESIGN_IMAGES_BUCKET).remove(paths);
      }
    } catch {
      // Storage cleanup is best-effort.
    }
  }
}