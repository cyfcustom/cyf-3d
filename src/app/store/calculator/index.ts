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
  VinilCalculatorState,
  EnviosCalculatorState,
  EtiquetasCalculatorState,
  EtiquetasProductType,
  DtfCalculatorState,
  DtfModality,
  EsferasCalculatorState,
  EsferasGananciaMode,
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
  calculateVinilPerUnit,
  applyWastePercentage,
  calculateEnviosCosts,
  calculateDtfTotals,
  calculateEsferasTotals,
} from './calculations';

// Defaults and presets
export {
  DEFAULT_FINANCIALS,
  DEFAULT_INDIRECT_COSTS,
  DEFAULT_LABOR_COSTS,
  PAPELERIA_DEFAULT_STATE,
  VINIL_DEFAULT_STATE,
  SUBLIMACION_DEFAULT_STATE,
  ETIQUETAS_DEFAULT_STATE,
  ETIQUETAS_PRODUCT_PRESETS,
  DTF_DEFAULT_STATE,
  EMPAQUES_DEFAULT_STATE,
  ESFERAS_DEFAULT_STATE,
  ENVIOS_DEFAULT_STATE,
} from './defaults';

// Atoms
export {
  papeleriaStateAtom,
  papeleriaTotalsAtom,
  vinilStateAtom,
  vinilTotalsAtom,
  sublimacionStateAtom,
  sublimacionTotalsAtom,
  etiquetasStateAtom,
  etiquetasTotalsAtom,
  dtfStateAtom,
  dtfTotalsAtom,
  empaquesStateAtom,
  empaquesTotalsAtom,
  esferasStateAtom,
  esferasTotalsAtom,
  enviosStateAtom,
  enviosTotalsAtom,
  updatePapeleriaDirectCostAtom,
  updatePapeleriaDepreciationAtom,
  updatePapeleriaIndirectCostsAtom,
  updatePapeleriaLaborCostsAtom,
  updatePapeleriaFinancialsAtom,
  updatePapeleriaQuantityAtom,
  resetPapeleriaAtom,
  updateEtiquetasProductTypeAtom,
  getCalculatorAtoms,
  CALCULATOR_ATOMS_MAP,
} from './atoms';

// Hooks
export {
  usePapeleriaCalculator,
  useVinilCalculator,
  useSublimacionCalculator,
  useEtiquetasCalculator,
  useDtfCalculator,
  useEmpaquesCalculator,
  useEsferasCalculator,
  useEnviosCalculator,
  useCalculator,
} from './hooks';
