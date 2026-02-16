/**
 * Default states and presets for all calculators.
 *
 * NOTE: For modules migrated to Supabase (currently: sublimation), these defaults
 * serve as OFFLINE FALLBACK values. The primary source of truth is the
 * `calculator_configs` table in Supabase. If the fetch fails, these values are used.
 */

import type {
  DirectCostItem,
  DepreciationItem,
  IndirectCosts,
  LaborCosts,
  FinancialSettings,
  VinylCalculatorState,
  LabelsCalculatorState,
  LabelsProductType,
  ShippingCalculatorState,
  CalculatorState,
  DtfCalculatorState,
  SpheresCalculatorState,
} from './types';

// ============================================================================
// SHARED DEFAULTS
// ============================================================================

export const DEFAULT_FINANCIALS: FinancialSettings = {
  profitPct: 40,
  taxPct: 16,
  applyProfit: true,
  applyTax: true,
};

export const DEFAULT_INDIRECT_COSTS: IndirectCosts = {
  enabled: false,
  monthly: {
    rent: 0,
    internet: 0,
    subscriptions: 0,
    transport: 0,
    electricity: 0,
    advertising: 0,
    other: 0,
  },
  unitsPerMonth: 100,
};

export const DEFAULT_LABOR_COSTS: LaborCosts = {
  enabled: false,
  salary: 400,
  hoursPerMonth: 176, // ~22 days x 8 hours
  setupMinutes: 5,
  runMinutesPerUnit: 3,
  unitsPerBatch: 1,
};

// ============================================================================
// STATIONERY DEFAULTS
// ============================================================================

export const STATIONERY_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'sustratoA', label: 'Sustrato A', enabled: false, price: 20, quantity: 50 },
  { id: 'sustratoB', label: 'Sustrato B', enabled: false, price: 0, quantity: 0 },
  { id: 'adhA', label: 'Adhesivo / montaje A', enabled: false, price: 3, quantity: 1 },
  { id: 'adhB', label: 'Adhesivo / montaje B', enabled: false, price: 0, quantity: 0 },
  { id: 'extra', label: 'Extra (shaker/acetato)', enabled: false, price: 0, quantity: 0 },
  { id: 'pack', label: 'Empaque', enabled: false, price: 5, quantity: 50 },
];

export const STATIONERY_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'plotter', label: 'Plotter de corte', enabled: false, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'impresora', label: 'Impresora', enabled: false, mode: 'month', price: 240, unitsPerMonth: 100 },
  { id: 'guillotina', label: 'Guillotina', enabled: false, mode: 'month', price: 120, unitsPerMonth: 100 },
  { id: 'laminadora', label: 'Laminadora', enabled: false, mode: 'month', price: 150, unitsPerMonth: 100 },
  { id: 'pc', label: 'Computadora', enabled: false, mode: 'month', price: 350, unitsPerMonth: 100 },
  { id: 'cuchilla', label: 'Cuchilla', enabled: false, mode: 'life', price: 30, lifeUnits: 500 },
  { id: 'tapete', label: 'Tapete', enabled: false, mode: 'life', price: 12, lifeUnits: 100 },
];

export const STATIONERY_DEFAULT_STATE: CalculatorState = {
  directCosts: STATIONERY_DEFAULT_DIRECT_COSTS,
  depreciation: STATIONERY_DEFAULT_DEPRECIATION,
  indirectCosts: DEFAULT_INDIRECT_COSTS,
  laborCosts: DEFAULT_LABOR_COSTS,
  financials: DEFAULT_FINANCIALS,
  quantity: 1,
};

// ============================================================================
// VINYL DEFAULTS
// ============================================================================

export const VINYL_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'base', label: 'Producto base', enabled: true, price: 90, quantity: 36 },
  { id: 'papel', label: 'Papel', enabled: true, price: 10, quantity: 100 },
  { id: 'tinta', label: 'Tinta', enabled: true, price: 40, quantity: 300 },
  { id: 'cinta', label: 'Cinta térmica', enabled: true, price: 3, quantity: 100 },
  { id: 'empaque', label: 'Empaque', enabled: true, price: 5, quantity: 50 },
];

export const VINYL_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'impresora', label: 'Impresora', enabled: true, mode: 'life', price: 240, lifeUnits: 2400 },
  { id: 'plancha', label: 'Plancha térmica', enabled: true, mode: 'life', price: 400, lifeUnits: 2400 },
  { id: 'pc', label: 'PC', enabled: true, mode: 'life', price: 350, lifeUnits: 2400 },
  { id: 'tapete', label: 'Tapete de corte', enabled: false, mode: 'life', price: 12, lifeUnits: 500 },
];

export const VINYL_DEFAULT_STATE: VinylCalculatorState = {
  directCosts: VINYL_DEFAULT_DIRECT_COSTS,
  depreciation: VINYL_DEFAULT_DEPRECIATION,
  extrasPerUnit: 0,
  wastePct: 5,
  financials: DEFAULT_FINANCIALS,
  quantity: 1,
};

// ============================================================================
// SUBLIMATION DEFAULTS
// ============================================================================

export const SUBLIMATION_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'producto', label: 'Producto base', enabled: true, price: 90, quantity: 36 },
  { id: 'papel', label: 'Papel sublimación', enabled: true, price: 10, quantity: 100 },
  { id: 'tinta', label: 'Tinta', enabled: true, price: 40, quantity: 300 },
  { id: 'cinta', label: 'Cinta térmica', enabled: true, price: 3, quantity: 100 },
  { id: 'empaque', label: 'Empaque', enabled: true, price: 5, quantity: 50 },
];

export const SUBLIMATION_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'impresora', label: 'Impresora', enabled: true, mode: 'month', price: 240, unitsPerMonth: 100 },
  { id: 'plancha', label: 'Plancha térmica', enabled: true, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'pc', label: 'PC', enabled: true, mode: 'month', price: 350, unitsPerMonth: 100 },
  { id: 'prensa', label: 'Prensa/plancha extra', enabled: false, mode: 'month', price: 180, unitsPerMonth: 100 },
  { id: 'resistencia', label: 'Resistencia', enabled: false, mode: 'month', price: 50, unitsPerMonth: 100 },
];

export const SUBLIMATION_DEFAULT_STATE: CalculatorState = {
  directCosts: SUBLIMATION_DEFAULT_DIRECT_COSTS,
  depreciation: SUBLIMATION_DEFAULT_DEPRECIATION,
  laborCosts: {
    enabled: false,
    salary: 400,
    hoursPerMonth: 176,
    setupMinutes: 10,
    runMinutesPerUnit: 1.5,
    unitsPerBatch: 1,
  },
  financials: DEFAULT_FINANCIALS,
  quantity: 1,
};

// ============================================================================
// LABELS DEFAULTS
// ============================================================================

export const LABELS_PRODUCT_PRESETS: Record<
  LabelsProductType,
  { price: number; quantity: number }
> = {
  'printable_vinyl': { price: 13, quantity: 20 },
  'adhesive_photo_paper': { price: 13, quantity: 50 },
  'pvc_label': { price: 15, quantity: 20 },
  'bopp_label': { price: 16, quantity: 20 },
  'holographic': { price: 18, quantity: 20 },
  'transparent': { price: 14, quantity: 20 },
  'kraft': { price: 12, quantity: 20 },
  'other': { price: 2.5, quantity: 1 },
};

export const LABELS_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'producto', label: 'Producto base', enabled: true, price: 13, quantity: 20 },
  { id: 'tinta', label: 'Tinta', enabled: true, price: 30, quantity: 1000 },
  { id: 'laminado', label: 'Laminado en frío', enabled: false, price: 10, quantity: 20 },
];

export const LABELS_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'cuchilla', label: 'Cuchilla', enabled: true, mode: 'life', price: 25, lifeUnits: 100 },
  { id: 'plotter', label: 'Plotter de corte', enabled: true, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'impresora', label: 'Impresora', enabled: true, mode: 'month', price: 240, unitsPerMonth: 100 },
];

export const LABELS_DEFAULT_STATE: LabelsCalculatorState = {
  directCosts: LABELS_DEFAULT_DIRECT_COSTS,
  depreciation: LABELS_DEFAULT_DEPRECIATION,
  indirectCosts: DEFAULT_INDIRECT_COSTS,
  laborCosts: {
    ...DEFAULT_LABOR_COSTS,
    runMinutesPerUnit: 2,
  },
  productType: 'printable_vinyl',
  financials: DEFAULT_FINANCIALS,
  quantity: 1,
};

// ============================================================================
// DTF DEFAULTS
// ============================================================================

export const DTF_DEFAULT_STATE: DtfCalculatorState = {
  modality: 'metro',
  respectMinimum: true,
  pricePerUnit: 15,
  lengthCm: 0,
  calcByDesign: false,
  designCount: 1,
  designWidthCm: 10,
  designHeightCm: 10,
  extras: {
    shipping: 0,
    design: 0,
    press: 0,
    other: 0,
  },
  garment: {
    enabled: false,
    count: 0,
    packPrice: 0,
  },
  depreciation: {
    enabled: false,
    price: 400,
    lifeUnits: 2400,
  },
  indirectCosts: DEFAULT_INDIRECT_COSTS,
  laborCosts: {
    ...DEFAULT_LABOR_COSTS,
    runMinutesPerUnit: 2,
  },
  financials: DEFAULT_FINANCIALS,
};

// ============================================================================
// PACKAGING DEFAULTS
// ============================================================================

export const PACKAGING_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'material', label: 'Material base', enabled: true, price: 50, quantity: 100 },
  { id: 'tinta', label: 'Tinta/impresión', enabled: true, price: 30, quantity: 500 },
  { id: 'adhesivo', label: 'Adhesivo/pegamento', enabled: false, price: 15, quantity: 200 },
];

export const PACKAGING_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'cortadora', label: 'Cortadora', enabled: true, mode: 'month', price: 300, unitsPerMonth: 100 },
  { id: 'selladora', label: 'Selladora', enabled: false, mode: 'month', price: 200, unitsPerMonth: 100 },
];

export const PACKAGING_DEFAULT_STATE: CalculatorState = {
  directCosts: PACKAGING_DEFAULT_DIRECT_COSTS,
  depreciation: PACKAGING_DEFAULT_DEPRECIATION,
  indirectCosts: DEFAULT_INDIRECT_COSTS,
  laborCosts: DEFAULT_LABOR_COSTS,
  financials: DEFAULT_FINANCIALS,
  quantity: 1,
};

// ============================================================================
// SPHERES DEFAULTS
// ============================================================================

export const SPHERES_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'producto', label: 'Producto', enabled: true, price: 24, quantity: 12 },
  { id: 'vinil', label: 'Vinil adhesivo', enabled: false, price: 8, quantity: 100 },
  { id: 'papel', label: 'Papel fotográfico', enabled: false, price: 10, quantity: 100 },
  { id: 'nieve', label: 'Nieve artificial', enabled: false, price: 6, quantity: 50 },
  { id: 'extra', label: 'Rellenos extra', enabled: false, price: 8, quantity: 100 },
  { id: 'cinta', label: 'Cinta/Lazo', enabled: false, price: 3.5, quantity: 45 },
  { id: 'silicon', label: 'Silicón en barra', enabled: false, price: 5, quantity: 50 },
];

export const SPHERES_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'impresora', label: 'Impresora', enabled: false, mode: 'month', price: 240, unitsPerMonth: 100 },
  { id: 'plancha', label: 'Plancha térmica', enabled: false, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'pc', label: 'Computadora', enabled: false, mode: 'month', price: 350, unitsPerMonth: 100 },
  { id: 'plotter', label: 'Plotter de corte', enabled: false, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'cuchilla', label: 'Cuchilla de corte', enabled: false, mode: 'life', price: 30, lifeUnits: 500 },
  { id: 'tapete', label: 'Tapete de corte', enabled: false, mode: 'life', price: 12, lifeUnits: 500 },
  { id: 'pistola', label: 'Pistola de silicón', enabled: false, mode: 'month', price: 18, unitsPerMonth: 100 },
];

export const SPHERES_DEFAULT_STATE: SpheresCalculatorState = {
  productSelection: 'colores6',
  directCosts: SPHERES_DEFAULT_DIRECT_COSTS,
  depreciation: SPHERES_DEFAULT_DEPRECIATION,
  indirectCosts: DEFAULT_INDIRECT_COSTS,
  laborCosts: {
    ...DEFAULT_LABOR_COSTS,
    runMinutesPerUnit: 2,
  },
  financials: DEFAULT_FINANCIALS,
  profitMode: 'margin',
  quantity: 1,
  quantityEnabled: false,
};

// ============================================================================
// SHIPPING DEFAULTS
// ============================================================================

export const SHIPPING_DEFAULT_STATE: ShippingCalculatorState = {
  courier: {
    enabled: false,
    type: 'local_motorcycle',
    km: 0,
    baseRate: 0,
    kmRate: 0,
    kg: 0,
    kgRate: 0,
  },
  extras: {
    packaging: { enabled: false, cost: 0 },
    fragile: { enabled: false, cost: 0 },
    insurance: { enabled: false, percentage: 0 },
    other: 0,
  },
};
