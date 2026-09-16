/**
 * Base URL de los assets de campaña Juntos a Seúl (modelo 3D, logo, diseños).
 *
 * Por defecto se sirven desde el bundle (public/campaign/...). Para servir desde
 * el CDN de Cloudflare (R2 + dominio propio) define VITE_CAMPAIGN_ASSET_BASE,
 * por ejemplo: VITE_CAMPAIGN_ASSET_BASE=https://cdn.cyfcustom.site
 */
export const CAMPAIGN_ASSET_BASE = (import.meta.env.VITE_CAMPAIGN_ASSET_BASE ?? '').replace(/\/$/, '');

/** Devuelve la URL completa de un asset de campaña bajo /campaign/. */
export function campaignAsset(path: string): string {
  return `${CAMPAIGN_ASSET_BASE}/campaign/${path}`;
}

/**
 * Slug of the public design_folders row that drives the campaign page
 * picker. The folder's `is_public` flag must be true and its `slug` (or
 * `name`) must match this constant — the campaign page looks it up
 * anonymously via the public_select_public_folders RLS policy.
 */
export const CAMPAIGN_FOLDER_SLUG = 'seul';