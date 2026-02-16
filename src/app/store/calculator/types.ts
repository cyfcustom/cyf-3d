/**
 * Base types for all calculators
 * Shared across all calculation modules
 */

export type CalculatorType =
  | 'vinyl'
  | 'sublimation'
  | 'dtf'
  | 'labels'
  | 'stationery'
  | 'packaging'
  | 'spheres'
  | 'shipping';

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
    rent: number;
    internet: number;
    subscriptions: number;
    transport: number;
    electricity: number;
    advertising: number;
    other: number;
  };
  unitsPerMonth: number; // Monthly production volume for distribution
}

/**
 * Labor costs
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
  profitPct: number; // Profit margin %
  taxPct: number; // Tax %
  applyProfit: boolean;
  applyTax: boolean;
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
  subtotalBeforeProfitAndTax: number;
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
 * Vinyl-specific state
 */
export interface VinylCalculatorState extends CalculatorState {
  directCosts: DirectCostItem[];
  depreciation: DepreciationItem[];
  extrasPerUnit: number; // Additional per-unit costs
  wastePct: number; // Waste/scrap percentage
}

/**
 * Shipping calculator state
 */
export interface ShippingCalculatorState {
  courier: {
    enabled: boolean;
    type: 'local_motorcycle' | 'urban_courier' | 'national_shipping' | 'international' | 'other';
    km: number;
    baseRate: number;
    kmRate: number;
    kg: number;
    kgRate: number;
  };
  extras: {
    packaging: { enabled: boolean; cost: number };
    fragile: { enabled: boolean; cost: number };
    insurance: { enabled: boolean; percentage: number };
    other: number;
  };
}

/**
 * Labels product type presets
 */
export type LabelsProductType =
  | 'printable_vinyl'
  | 'adhesive_photo_paper'
  | 'pvc_label'
  | 'bopp_label'
  | 'holographic'
  | 'transparent'
  | 'kraft'
  | 'other';

export interface LabelsCalculatorState extends CalculatorState {
  directCosts: DirectCostItem[];
  depreciation: DepreciationItem[];
  indirectCosts: IndirectCosts;
  laborCosts: LaborCosts;
  productType: LabelsProductType;
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
    shipping: number;
    design: number;
    press: number;
    other: number;
  };
  garment: {
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
 * Spheres Calculator State (Christmas ornaments)
 * Has unique profitMode (markup vs margin) and optional quantity multiplier
 */
export type SpheresProfitMode = 'markup' | 'margin';

export interface SpheresCalculatorState {
  productSelection: string;
  directCosts: DirectCostItem[];
  depreciation: DepreciationItem[];
  indirectCosts: IndirectCosts;
  laborCosts: LaborCosts;
  financials: FinancialSettings;
  profitMode: SpheresProfitMode;
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
  category: 'printing' | 'products' | 'complementary' | 'tools';
  hasDirectCosts: boolean;
  hasDepreciation: boolean;
  hasIndirectCosts: boolean;
  hasLaborCosts: boolean;
}
