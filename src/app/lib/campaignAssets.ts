/**
 * Base URL de los assets de la campaña Juntos a Seúl (modelo 3D, logo, diseños).
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