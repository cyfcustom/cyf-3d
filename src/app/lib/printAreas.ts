export interface PrintArea {
  id: string;
  name: string;
  meshName: string;
  side: 'front' | 'back' | 'left' | 'right';
  uvOffset: { u: number; v: number };
  uvScale: { u: number; v: number };
  invertX: boolean;
  materialType: 'pbr' | 'standard';
  metallic?: number;
  roughness?: number;
}

export interface ProductPrintConfig {
  productType: string;
  printAreas: PrintArea[];
  defaultCameraAngle?: {
    alpha: number;
    beta: number;
    radius: number;
  };
}

export const PRODUCT_PRINT_CONFIGS: Record<string, ProductPrintConfig> = {
  tshirt: {
    productType: 'tshirt',
    printAreas: [
      {
        id: 'tshirt-front',
        name: 'Frente',
        meshName: 'body',
        side: 'front',
        uvOffset: { u: 0.25, v: 0.15 },
        uvScale: { u: 0.5, v: 0.7 },
        invertX: false,
        materialType: 'pbr',
        metallic: 0,
        roughness: 0.85,
      },
      {
        id: 'tshirt-back',
        name: 'Espalda',
        meshName: 'body',
        side: 'back',
        uvOffset: { u: 0.75, v: 0.15 },
        uvScale: { u: 0.5, v: 0.7 },
        invertX: true,
        materialType: 'pbr',
        metallic: 0,
        roughness: 0.85,
      },
    ],
    defaultCameraAngle: {
      alpha: -Math.PI / 2,
      beta: Math.PI / 2.5,
      radius: 5,
    },
  },
  mug: {
    productType: 'mug',
    printAreas: [
      {
        id: 'mug-wrap',
        name: 'Superficie',
        meshName: 'body',
        side: 'front',
        uvOffset: { u: 0, v: 0.1 },
        uvScale: { u: 1, v: 0.8 },
        invertX: false,
        materialType: 'pbr',
        metallic: 0.1,
        roughness: 0.4,
      },
    ],
    defaultCameraAngle: {
      alpha: -Math.PI / 4,
      beta: Math.PI / 2.5,
      radius: 4,
    },
  },
  thermo: {
    productType: 'thermo',
    printAreas: [
      {
        id: 'thermo-body',
        name: 'Cuerpo',
        meshName: 'body',
        side: 'front',
        uvOffset: { u: 0, v: 0.15 },
        uvScale: { u: 1, v: 0.7 },
        invertX: false,
        materialType: 'pbr',
        metallic: 0.6,
        roughness: 0.3,
      },
    ],
    defaultCameraAngle: {
      alpha: -Math.PI / 3,
      beta: Math.PI / 2.5,
      radius: 5,
    },
  },
  'baby-body': {
    productType: 'baby-body',
    printAreas: [
      {
        id: 'baby-front',
        name: 'Frente',
        meshName: 'body',
        side: 'front',
        uvOffset: { u: 0.2, v: 0.1 },
        uvScale: { u: 0.6, v: 0.6 },
        invertX: false,
        materialType: 'pbr',
        metallic: 0,
        roughness: 0.9,
      },
    ],
    defaultCameraAngle: {
      alpha: -Math.PI / 2,
      beta: Math.PI / 2.5,
      radius: 4,
    },
  },
};

export function getPrintConfig(productType: string): ProductPrintConfig | null {
  return PRODUCT_PRINT_CONFIGS[productType] || null;
}

export function getPrintAreasForSide(
  productType: string,
  side: 'front' | 'back' | 'left' | 'right'
): PrintArea[] {
  const config = PRODUCT_PRINT_CONFIGS[productType];
  if (!config) return [];
  return config.printAreas.filter((area) => area.side === side);
}
