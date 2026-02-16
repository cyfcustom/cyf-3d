/**
 * Calculator Store - Centralized state management with Jotai
 *
 * Export all calculator-related types, atoms, and hooks
 */

// Types
export type {
  CalculatorType,
  DirectCostItem,
  DepreciationItem,
  IndirectCosts,
  LaborCosts,
  FinancialSettings,
  BaseCalculatorState,
  CalculatorState,
  VinylCalculatorState,
  ShippingCalculatorState,
  LabelsCalculatorState,
  LabelsProductType,
  DtfCalculatorState,
  DtfModality,
  SpheresCalculatorState,
  SpheresProfitMode,
  PerUnitCosts,
  CalculationTotals,
  CalculatorMetadata,
} from './types';

// Calculation utilities
export {
  calculateDirectCosts,
  calculateDepreciation,
  calculateIndirectCosts,
  calculateLaborCosts,
  calculateProfit,
  calculateTax,
  calculatePerUnitCosts,
  calculateTotals,
  calculateVinylPerUnit,
  applyWastePercentage,
  calculateShippingCosts,
  calculateDtfTotals,
  calculateSpheresTotals,
} from './calculations';

// Defaults and presets
export {
  DEFAULT_FINANCIALS,
  DEFAULT_INDIRECT_COSTS,
  DEFAULT_LABOR_COSTS,
  STATIONERY_DEFAULT_STATE,
  VINYL_DEFAULT_STATE,
  SUBLIMATION_DEFAULT_STATE,
  LABELS_DEFAULT_STATE,
  LABELS_PRODUCT_PRESETS,
  DTF_DEFAULT_STATE,
  PACKAGING_DEFAULT_STATE,
  SPHERES_DEFAULT_STATE,
  SHIPPING_DEFAULT_STATE,
} from './defaults';

// Atoms
export {
  stationeryStateAtom,
  stationeryTotalsAtom,
  vinylStateAtom,
  vinylTotalsAtom,
  sublimationStateAtom,
  sublimationTotalsAtom,
  sublimationConfigMetaAtom,
  hydrateSublimationFromSupabaseAtom,
  labelsStateAtom,
  labelsTotalsAtom,
  dtfStateAtom,
  dtfTotalsAtom,
  packagingStateAtom,
  packagingTotalsAtom,
  spheresStateAtom,
  spheresTotalsAtom,
  shippingStateAtom,
  shippingTotalsAtom,
  updateStationeryDirectCostAtom,
  updateStationeryDepreciationAtom,
  updateStationeryIndirectCostsAtom,
  updateStationeryLaborCostsAtom,
  updateStationeryFinancialsAtom,
  updateStationeryQuantityAtom,
  resetStationeryAtom,
  updateLabelsProductTypeAtom,
  getCalculatorAtoms,
  CALCULATOR_ATOMS_MAP,
} from './atoms';

export type { ConfigMeta } from './atoms';

// Hooks
export {
  useStationeryCalculator,
  useVinylCalculator,
  useSublimationCalculator,
  useLabelsCalculator,
  useDtfCalculator,
  usePackagingCalculator,
  useSpheresCalculator,
  useShippingCalculator,
  useCalculator,
} from './hooks';
