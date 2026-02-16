/**
 * Base types for all calculators
 * Shared across all calculation modules
 */

export type CalculatorType =
  | 'vinil'
  | 'sublimacion'
  | 'dtf'
  | 'etiquetas'
  | 'papeleria'
  | 'empaques'
  | 'esferas'
  | 'envios';

// ============================================================================
// COST ITEMS
// ============================================================================

/**
 * Direct cost item (materials, consumables)
 */
export interface DirectCostItem {
  id: string;
  label: string;
  enabled: boolean;
  price: number; // Total pack price
  quantity: number; // Units in pack
}

/**
 * Depreciation item - equipment/assets
 * Two modes:
 * - 'month': Depreciate over months (monthly production volume)
 * - 'life': Depreciate over total lifetime uses
 */
export type DepreciationItem =
  | {
      id: string;
      label: string;
      enabled: boolean;
      mode: 'month';
      price: number; // Asset cost
      unitsPerMonth: number; // Units produced per month
    }
  | {
      id: string;
      label: string;
      enabled: boolean;
      mode: 'life';
      price: number; // Asset cost
      lifeUnits: number; // Total lifetime uses
    };

/**
 * Indirect costs (overhead, utilities, rent)
 * Distributed across monthly production volume
 */
export interface IndirectCosts {
  enabled: boolean;
  monthly: {
    alquiler: number;
    internet: number;
    suscripciones: number;
    transporte: number;
    electricidad: number;
    publicidad: number;
    otros: number;
  };
  unitsPerMonth: number; // Monthly production volume for distribution
}

/**
 * Manual labor / Mano de obra
 * Calculated based on time and hourly rate
 */
export interface LaborCosts {
  enabled: boolean;
  salary: number; // Monthly salary
  hoursPerMonth: number; // Working hours per month (e.g., 176)
  setupMinutes: number; // One-time setup per batch
  runMinutesPerUnit: number; // Time per unit
  unitsPerBatch: number; // Units per batch (for setup distribution)
}

/**
 * Financial settings (profit margin, taxes)
 */
export interface FinancialSettings {
  gananciaPct: number; // Profit margin %
  impuestosPct: number; // Tax %
  applyGanancia: boolean;
  applyImpuestos: boolean;
}

// ============================================================================
// CALCULATOR STATE
// ============================================================================

/**
 * Base calculator state
 * Extended by specific calculator types
 */
export interface BaseCalculatorState {
  // Cost components
  directCosts: DirectCostItem[];
  depreciation: DepreciationItem[];
  indirectCosts: IndirectCosts;
  laborCosts: LaborCosts;

  // Financial
  financials: FinancialSettings;

  // Quantity
  quantity: number;
}

/**
 * Calculator state with optional components
 * Some calculators don't use all cost types
 */
export interface CalculatorState extends Partial<BaseCalculatorState> {
  // At minimum, all calculators have:
  financials: FinancialSettings;
  quantity: number;
}

// ============================================================================
// CALCULATION RESULTS
// ============================================================================

/**
 * Per-unit cost breakdown
 */
export interface PerUnitCosts {
  direct: number;
  depreciation: number;
  indirect: number;
  labor: number;
  subtotalBeforeProfitAndTax: number; // Direct + Dep + Indirect (sin MO)
  subtotal: number; // Including labor
  profit: number;
  tax: number;
  total: number;
}

/**
 * Total calculation results
 */
export interface CalculationTotals {
  perUnit: PerUnitCosts;
  quantity: number;
  subtotalBeforeProfitAndTax: number;
  subtotal: number;
  totalProfit: number;
  totalTax: number;
  total: number;
}

// ============================================================================
// CALCULATOR-SPECIFIC EXTENSIONS
// ============================================================================

/**
 * Vinil-specific state
 */
export interface VinilCalculatorState extends CalculatorState {
  directCosts: DirectCostItem[];
  depreciation: DepreciationItem[];
  extrasPerUnit: number; // Additional per-unit costs
  mermaPct: number; // Waste/scrap percentage
}

/**
 * Envios (shipping) has unique structure
 */
export interface EnviosCalculatorState {
  mensajeria: {
    enabled: boolean;
    tipo: 'Motorizado local' | 'Mensajería urbana' | 'Encomienda nacional' | 'Internacional' | 'Otro';
    km: number;
    baseRate: number;
    kmRate: number;
    kg: number;
    kgRate: number;
  };
  extras: {
    embalaje: { enabled: boolean; cost: number };
    fragil: { enabled: boolean; cost: number };
    seguro: { enabled: boolean; percentaje: number };
    otros: number;
  };
}

/**
 * Etiquetas has product presets
 */
export type EtiquetasProductType =
  | 'Vinil imprimible'
  | 'Papel fotográfico adhesivo'
  | 'Etiqueta PVC'
  | 'Etiqueta BOPP'
  | 'Holográfico'
  | 'Transparente'
  | 'Kraft'
  | 'Otros';

export interface EtiquetasCalculatorState extends CalculatorState {
  directCosts: DirectCostItem[];
  depreciation: DepreciationItem[];
  indirectCosts: IndirectCosts;
  laborCosts: LaborCosts;
  productType: EtiquetasProductType;
}

/**
 * DTF Calculator State (Direct-to-Film)
 * Has unique modality system and design-based calculations
 */
export type DtfModality = 'metro' | 'tramo30' | 'a3';

export interface DtfCalculatorState {
  modality: DtfModality;
  respectMinimum: boolean;
  pricePerUnit: number;
  lengthCm: number;
  calcByDesign: boolean;
  designCount: number;
  designWidthCm: number;
  designHeightCm: number;
  extras: {
    envio: number;
    diseno: number;
    plancha: number;
    otros: number;
  };
  prenda: {
    enabled: boolean;
    count: number;
    packPrice: number;
  };
  depreciation: {
    enabled: boolean;
    price: number;
    lifeUnits: number;
  };
  indirectCosts: IndirectCosts;
  laborCosts: LaborCosts;
  financials: FinancialSettings;
}

/**
 * Esferas Calculator State (Christmas ornaments)
 * Has unique gananciaMode (markup vs margin) and optional quantity multiplier
 */
export type EsferasGananciaMode = 'markup' | 'margen';

export interface EsferasCalculatorState {
  productSelection: string;
  directCosts: DirectCostItem[];
  depreciation: DepreciationItem[];
  indirectCosts: IndirectCosts;
  laborCosts: LaborCosts;
  financials: FinancialSettings;
  gananciaMode: EsferasGananciaMode;
  quantity: number;
  quantityEnabled: boolean;
}

// ============================================================================
// CALCULATOR METADATA
// ============================================================================

/**
 * Metadata about a calculator
 * Used for UI, routing, and organization
 */
export interface CalculatorMetadata {
  id: CalculatorType;
  name: string;
  description: string;
  category: 'impresion' | 'productos' | 'complementarios' | 'herramientas';
  hasDirectCosts: boolean;
  hasDepreciation: boolean;
  hasIndirectCosts: boolean;
  hasLaborCosts: boolean;
}
