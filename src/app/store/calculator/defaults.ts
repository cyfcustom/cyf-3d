/**
 * Default states and presets for all calculators
 */

import type {
  DirectCostItem,
  DepreciationItem,
  IndirectCosts,
  LaborCosts,
  FinancialSettings,
  VinilCalculatorState,
  EtiquetasCalculatorState,
  EtiquetasProductType,
  EnviosCalculatorState,
  CalculatorState,
  DtfCalculatorState,
  EsferasCalculatorState,
} from './types';

// ============================================================================
// SHARED DEFAULTS
// ============================================================================

export const DEFAULT_FINANCIALS: FinancialSettings = {
  gananciaPct: 40,
  impuestosPct: 16,
  applyGanancia: true,
  applyImpuestos: true,
};

export const DEFAULT_INDIRECT_COSTS: IndirectCosts = {
  enabled: false,
  monthly: {
    alquiler: 0,
    internet: 0,
    suscripciones: 0,
    transporte: 0,
    electricidad: 0,
    publicidad: 0,
    otros: 0,
  },
  unitsPerMonth: 100,
};

export const DEFAULT_LABOR_COSTS: LaborCosts = {
  enabled: false,
  salary: 400,
  hoursPerMonth: 176, // ~22 días × 8 horas
  setupMinutes: 5,
  runMinutesPerUnit: 3,
  unitsPerBatch: 1,
};

// ============================================================================
// PAPELERIA DEFAULTS
// ============================================================================

export const PAPELERIA_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'sustratoA', label: 'Sustrato A', enabled: false, price: 20, quantity: 50 },
  { id: 'sustratoB', label: 'Sustrato B', enabled: false, price: 0, quantity: 0 },
  { id: 'adhA', label: 'Adhesivo / montaje A', enabled: false, price: 3, quantity: 1 },
  { id: 'adhB', label: 'Adhesivo / montaje B', enabled: false, price: 0, quantity: 0 },
  { id: 'extra', label: 'Extra (shaker/acetato)', enabled: false, price: 0, quantity: 0 },
  { id: 'pack', label: 'Empaque', enabled: false, price: 5, quantity: 50 },
];

export const PAPELERIA_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'plotter', label: 'Plotter de corte', enabled: false, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'impresora', label: 'Impresora', enabled: false, mode: 'month', price: 240, unitsPerMonth: 100 },
  { id: 'guillotina', label: 'Guillotina', enabled: false, mode: 'month', price: 120, unitsPerMonth: 100 },
  { id: 'laminadora', label: 'Laminadora', enabled: false, mode: 'month', price: 150, unitsPerMonth: 100 },
  { id: 'pc', label: 'Computadora', enabled: false, mode: 'month', price: 350, unitsPerMonth: 100 },
  { id: 'cuchilla', label: 'Cuchilla', enabled: false, mode: 'life', price: 30, lifeUnits: 500 },
  { id: 'tapete', label: 'Tapete', enabled: false, mode: 'life', price: 12, lifeUnits: 100 },
];

export const PAPELERIA_DEFAULT_STATE: CalculatorState = {
  directCosts: PAPELERIA_DEFAULT_DIRECT_COSTS,
  depreciation: PAPELERIA_DEFAULT_DEPRECIATION,
  indirectCosts: DEFAULT_INDIRECT_COSTS,
  laborCosts: DEFAULT_LABOR_COSTS,
  financials: DEFAULT_FINANCIALS,
  quantity: 1,
};

// ============================================================================
// VINIL DEFAULTS
// ============================================================================

export const VINIL_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'base', label: 'Producto base', enabled: true, price: 90, quantity: 36 },
  { id: 'papel', label: 'Papel', enabled: true, price: 10, quantity: 100 },
  { id: 'tinta', label: 'Tinta', enabled: true, price: 40, quantity: 300 },
  { id: 'cinta', label: 'Cinta térmica', enabled: true, price: 3, quantity: 100 },
  { id: 'empaque', label: 'Empaque', enabled: true, price: 5, quantity: 50 },
];

export const VINIL_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'impresora', label: 'Impresora', enabled: true, mode: 'life', price: 240, lifeUnits: 2400 },
  { id: 'plancha', label: 'Plancha térmica', enabled: true, mode: 'life', price: 400, lifeUnits: 2400 },
  { id: 'pc', label: 'PC', enabled: true, mode: 'life', price: 350, lifeUnits: 2400 },
  { id: 'tapete', label: 'Tapete de corte', enabled: false, mode: 'life', price: 12, lifeUnits: 500 },
];

export const VINIL_DEFAULT_STATE: VinilCalculatorState = {
  directCosts: VINIL_DEFAULT_DIRECT_COSTS,
  depreciation: VINIL_DEFAULT_DEPRECIATION,
  extrasPerUnit: 0,
  mermaPct: 5,
  financials: DEFAULT_FINANCIALS,
  quantity: 1,
};

// ============================================================================
// SUBLIMACION DEFAULTS
// ============================================================================

export const SUBLIMACION_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'producto', label: 'Producto base', enabled: true, price: 90, quantity: 36 },
  { id: 'papel', label: 'Papel sublimación', enabled: true, price: 10, quantity: 100 },
  { id: 'tinta', label: 'Tinta', enabled: true, price: 40, quantity: 300 },
  { id: 'cinta', label: 'Cinta térmica', enabled: true, price: 3, quantity: 100 },
  { id: 'empaque', label: 'Empaque', enabled: true, price: 5, quantity: 50 },
];

export const SUBLIMACION_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'impresora', label: 'Impresora', enabled: true, mode: 'month', price: 240, unitsPerMonth: 100 },
  { id: 'plancha', label: 'Plancha térmica', enabled: true, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'pc', label: 'PC', enabled: true, mode: 'month', price: 350, unitsPerMonth: 100 },
  { id: 'prensa', label: 'Prensa/plancha extra', enabled: false, mode: 'month', price: 180, unitsPerMonth: 100 },
  { id: 'resistencia', label: 'Resistencia', enabled: false, mode: 'month', price: 50, unitsPerMonth: 100 },
];

export const SUBLIMACION_DEFAULT_STATE: CalculatorState = {
  directCosts: SUBLIMACION_DEFAULT_DIRECT_COSTS,
  depreciation: SUBLIMACION_DEFAULT_DEPRECIATION,
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
// ETIQUETAS DEFAULTS
// ============================================================================

export const ETIQUETAS_PRODUCT_PRESETS: Record<
  EtiquetasProductType,
  { price: number; quantity: number }
> = {
  'Vinil imprimible': { price: 13, quantity: 20 },
  'Papel fotográfico adhesivo': { price: 13, quantity: 50 },
  'Etiqueta PVC': { price: 15, quantity: 20 },
  'Etiqueta BOPP': { price: 16, quantity: 20 },
  Holográfico: { price: 18, quantity: 20 },
  Transparente: { price: 14, quantity: 20 },
  Kraft: { price: 12, quantity: 20 },
  Otros: { price: 2.5, quantity: 1 },
};

export const ETIQUETAS_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'producto', label: 'Producto base', enabled: true, price: 13, quantity: 20 },
  { id: 'tinta', label: 'Tinta', enabled: true, price: 30, quantity: 1000 },
  { id: 'laminado', label: 'Laminado en frío', enabled: false, price: 10, quantity: 20 },
];

export const ETIQUETAS_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'cuchilla', label: 'Cuchilla', enabled: true, mode: 'life', price: 25, lifeUnits: 100 },
  { id: 'plotter', label: 'Plotter de corte', enabled: true, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'impresora', label: 'Impresora', enabled: true, mode: 'month', price: 240, unitsPerMonth: 100 },
];

export const ETIQUETAS_DEFAULT_STATE: EtiquetasCalculatorState = {
  directCosts: ETIQUETAS_DEFAULT_DIRECT_COSTS,
  depreciation: ETIQUETAS_DEFAULT_DEPRECIATION,
  indirectCosts: DEFAULT_INDIRECT_COSTS,
  laborCosts: {
    ...DEFAULT_LABOR_COSTS,
    runMinutesPerUnit: 2,
  },
  productType: 'Vinil imprimible',
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
    envio: 0,
    diseno: 0,
    plancha: 0,
    otros: 0,
  },
  prenda: {
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
// EMPAQUES DEFAULTS
// ============================================================================

export const EMPAQUES_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'material', label: 'Material base', enabled: true, price: 50, quantity: 100 },
  { id: 'tinta', label: 'Tinta/impresión', enabled: true, price: 30, quantity: 500 },
  { id: 'adhesivo', label: 'Adhesivo/pegamento', enabled: false, price: 15, quantity: 200 },
];

export const EMPAQUES_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'cortadora', label: 'Cortadora', enabled: true, mode: 'month', price: 300, unitsPerMonth: 100 },
  { id: 'selladora', label: 'Selladora', enabled: false, mode: 'month', price: 200, unitsPerMonth: 100 },
];

export const EMPAQUES_DEFAULT_STATE: CalculatorState = {
  directCosts: EMPAQUES_DEFAULT_DIRECT_COSTS,
  depreciation: EMPAQUES_DEFAULT_DEPRECIATION,
  indirectCosts: DEFAULT_INDIRECT_COSTS,
  laborCosts: DEFAULT_LABOR_COSTS,
  financials: DEFAULT_FINANCIALS,
  quantity: 1,
};

// ============================================================================
// ESFERAS DEFAULTS
// ============================================================================

export const ESFERAS_DEFAULT_DIRECT_COSTS: DirectCostItem[] = [
  { id: 'producto', label: 'Producto', enabled: true, price: 24, quantity: 12 },
  { id: 'vinil', label: 'Vinil adhesivo', enabled: false, price: 8, quantity: 100 },
  { id: 'papel', label: 'Papel fotográfico', enabled: false, price: 10, quantity: 100 },
  { id: 'nieve', label: 'Nieve artificial', enabled: false, price: 6, quantity: 50 },
  { id: 'extra', label: 'Rellenos extra', enabled: false, price: 8, quantity: 100 },
  { id: 'cinta', label: 'Cinta/Lazo', enabled: false, price: 3.5, quantity: 45 },
  { id: 'silicon', label: 'Silicón en barra', enabled: false, price: 5, quantity: 50 },
];

export const ESFERAS_DEFAULT_DEPRECIATION: DepreciationItem[] = [
  { id: 'impresora', label: 'Impresora', enabled: false, mode: 'month', price: 240, unitsPerMonth: 100 },
  { id: 'plancha', label: 'Plancha térmica', enabled: false, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'pc', label: 'Computadora', enabled: false, mode: 'month', price: 350, unitsPerMonth: 100 },
  { id: 'plotter', label: 'Plotter de corte', enabled: false, mode: 'month', price: 400, unitsPerMonth: 100 },
  { id: 'cuchilla', label: 'Cuchilla de corte', enabled: false, mode: 'life', price: 30, lifeUnits: 500 },
  { id: 'tapete', label: 'Tapete de corte', enabled: false, mode: 'life', price: 12, lifeUnits: 500 },
  { id: 'pistola', label: 'Pistola de silicón', enabled: false, mode: 'month', price: 18, unitsPerMonth: 100 },
];

export const ESFERAS_DEFAULT_STATE: EsferasCalculatorState = {
  productSelection: 'colores6',
  directCosts: ESFERAS_DEFAULT_DIRECT_COSTS,
  depreciation: ESFERAS_DEFAULT_DEPRECIATION,
  indirectCosts: DEFAULT_INDIRECT_COSTS,
  laborCosts: {
    ...DEFAULT_LABOR_COSTS,
    runMinutesPerUnit: 2,
  },
  financials: DEFAULT_FINANCIALS,
  gananciaMode: 'margen',
  quantity: 1,
  quantityEnabled: false,
};

// ============================================================================
// ENVIOS DEFAULTS
// ============================================================================

export const ENVIOS_DEFAULT_STATE: EnviosCalculatorState = {
  mensajeria: {
    enabled: false,
    tipo: 'Motorizado local',
    km: 0,
    baseRate: 0,
    kmRate: 0,
    kg: 0,
    kgRate: 0,
  },
  extras: {
    embalaje: { enabled: false, cost: 0 },
    fragil: { enabled: false, cost: 0 },
    seguro: { enabled: false, percentaje: 0 },
    otros: 0,
  },
};
