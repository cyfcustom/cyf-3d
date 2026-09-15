import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { layersAtom } from '../../store/atoms';
import type { Layer, Section } from '../../types/sections';
import { BabylonCanvas } from '../configurator/BabylonCanvas';
import { campaignAsset } from '../../lib/campaignAssets';

// ─── Campaign model + design constants ───────────────────────────────────
// The campaign page (`/juntos-a-seul`) reuses the configurator's Babylon
// viewer. Two layers are injected into layersAtom on mount and updated
// when the visitor picks a different design from the carousel:
//   - Front design: the campaign's chosen image, painted on the `front`
//     mesh at the chest.
//   - Back logo: a fixed Juntos a Seúl wordmark under the collar, painted
//     on the `back` mesh.
//
// UV anchors calibrated to the campaign GLB's authoring (v=0 cuello,
// v=1 ruedo, u=0.5 centro):
//   - Diseño frontal: centro (0.50, 0.30), ancho ~0.42 del frente.
//   - Logo trasero:   centro (0.515, 0.13), ancho ~0.32 de la espalda.

const CAMPAIGN_MODEL_URL = campaignAsset('model.glb');
const CAMPAIGN_LOGO_URL = campaignAsset('logo.png');

const CAMPAIGN_SECTIONS: Section[] = [
  { id: 'front', mesh_name: 'front', display_name: 'Frente',  color: '#FFFFFF', visible: true, sort_order: 1 },
  { id: 'back',  mesh_name: 'back',  display_name: 'Espalda', color: '#FFFFFF', visible: true, sort_order: 2 },
];

// Position + scale in normalized print-area units (layer.scale = fraction
// of the section's print area width). 1.08 ≈ 42% of the 1024 texture width,
// matching the campaign's documented UV (widthUV = 0.42).
const FRONT_LAYER: Pick<Layer, 'x' | 'y' | 'scale' | 'rotation'> = {
  x: 0.5, y: 0.3, scale: 1.08, rotation: 0,
};
const BACK_LAYER: Pick<Layer, 'x' | 'y' | 'scale' | 'rotation'> = {
  x: 0.515, y: 0.13, scale: 0.82, rotation: 0,
};

const CAMPAIGN_LAYER_DEFAULTS: Pick<Layer, 'flipX' | 'flipY'> = {
  flipX: false, flipY: false,
};

interface CampaignViewerProps {
  /** URL of the design image to display on the front mesh. */
  designUrl: string;
  /** Display name of the design (used as the layer's name). */
  designName: string;
  /** Wrapper sizing passed through to the BabylonCanvas container. */
  className?: string;
}

/**
 * 3D franela preview for the Juntos a Seúl campaign. Reuses the
 * configurator's BabylonCanvas with the campaign GLB, the campaign's
 * two-section layout (front + back), and injects two layers via
 * layersAtom: the chosen design on the front and the fixed logo on
 * the back.
 *
 * No right-side controls, no section tabs, no tools — just the
 * interactive 3D view with drag-to-rotate, scroll-to-zoom, and
 * fullscreen.
 */
export function CampaignViewer({ designUrl, designName, className }: CampaignViewerProps) {
  const setLayers = useSetAtom(layersAtom);

  // Update layers whenever the selected design changes.
  useEffect(() => {
    const front: Layer = {
      id: 'campaign-front',
      name: designName,
      thumbnail: designUrl,
      side: 'front',
      ...CAMPAIGN_LAYER_DEFAULTS,
      ...FRONT_LAYER,
    };
    const back: Layer = {
      id: 'campaign-back',
      name: 'Juntos a Seúl',
      thumbnail: CAMPAIGN_LOGO_URL,
      side: 'back',
      ...CAMPAIGN_LAYER_DEFAULTS,
      ...BACK_LAYER,
    };
    setLayers([front, back]);
    // setLayers is intentionally NOT in deps — the setter is stable
    // and including it would re-run on every render of the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designUrl, designName]);

  // Clear layers only on unmount so navigating away (e.g. into the
  // configurator) doesn't leave stale campaign layers behind.
  useEffect(() => {
    return () => setLayers([]);
  }, [setLayers]);

  // The campaign appearance (gradient + border + radius) lives directly
  // on the BabylonCanvas container so fullscreen mode preserves it.
  // Size is controlled by the className prop (defaults to a square
  // max-w-[780px] centred on the page).
  const containerClass = [
    'overflow-hidden rounded-3xl border border-gray-200',
    'bg-gradient-to-b from-[#E8EEF7] via-[#DCE5F1] to-[#C9D6EA]',
    className ?? 'mx-auto aspect-square w-full max-w-[780px]',
  ].join(' ');

  return (
    <BabylonCanvas
      modelUrl={CAMPAIGN_MODEL_URL}
      sections={CAMPAIGN_SECTIONS}
      cameraRadiusMultiplier={1.8}
      containerClassName={containerClass}
    />
  );
}