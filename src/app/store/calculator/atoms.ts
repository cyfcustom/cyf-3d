/**
 * Jotai atoms for calculator state management
 * Uses atomWithStorage for automatic localStorage persistence
 * Uses derived atoms for reactive calculations
 */

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type {
  CalculatorType,
  CalculatorState,
  VinilCalculatorState,
  EtiquetasCalculatorState,
  EnviosCalculatorState,
  DtfCalculatorState,
  EsferasCalculatorState,
  CalculationTotals,
  PerUnitCosts,
  DirectCostItem,
  DepreciationItem,
  IndirectCosts,
  LaborCosts,
  FinancialSettings,
} from './types';
import {
  calculatePerUnitCosts,
  calculateTotals,
  calculateVinilPerUnit,
  calculateEnviosCosts,
  calculateDtfTotals,
  calculateEsferasTotals,
} from './calculations';
import {
  PAPELERIA_DEFAULT_STATE,
  VINIL_DEFAULT_STATE,
  SUBLIMACION_DEFAULT_STATE,
  ETIQUETAS_DEFAULT_STATE,
  DTF_DEFAULT_STATE,
  EMPAQUES_DEFAULT_STATE,
  ESFERAS_DEFAULT_STATE,
  ENVIOS_DEFAULT_STATE,
  ETIQUETAS_PRODUCT_PRESETS,
} from './defaults';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  papeleria: 'papeleria-calculator-v2',
  vinil: 'vinil-calculator-v2',
  sublimacion: 'sublimacion-calculator-v2',
  etiquetas: 'etiquetas-calculator-v2',
  dtf: 'dtf-calculator-v2',
  empaques: 'empaques-calculator-v2',
  esferas: 'esferas-calculator-v2',
  envios: 'envios-calculator-v2',
} as const;

// ============================================================================
// BASE CALCULATOR ATOMS (with localStorage persistence)
// ============================================================================

// Papelería
export const papeleriaStateAtom = atomWithStorage<CalculatorState>(
  STORAGE_KEYS.papeleria,
  PAPELERIA_DEFAULT_STATE
);

// Vinil
export const vinilStateAtom = atomWithStorage<VinilCalculatorState>(
  STORAGE_KEYS.vinil,
  VINIL_DEFAULT_STATE
);

// Sublimación
export const sublimacionStateAtom = atomWithStorage<CalculatorState>(
  STORAGE_KEYS.sublimacion,
  SUBLIMACION_DEFAULT_STATE
);

// Etiquetas
export const etiquetasStateAtom = atomWithStorage<EtiquetasCalculatorState>(
  STORAGE_KEYS.etiquetas,
  ETIQUETAS_DEFAULT_STATE
);

// DTF
export const dtfStateAtom = atomWithStorage<DtfCalculatorState>(
  STORAGE_KEYS.dtf,
  DTF_DEFAULT_STATE
);

// Empaques
export const empaquesStateAtom = atomWithStorage<CalculatorState>(
  STORAGE_KEYS.empaques,
  EMPAQUES_DEFAULT_STATE
);

// Esferas
export const esferasStateAtom = atomWithStorage<EsferasCalculatorState>(
  STORAGE_KEYS.esferas,
  ESFERAS_DEFAULT_STATE
);

// Envíos
export const enviosStateAtom = atomWithStorage<EnviosCalculatorState>(
  STORAGE_KEYS.envios,
  ENVIOS_DEFAULT_STATE
);

// ============================================================================
// DERIVED ATOMS - CALCULATIONS (automatically recalculate when state changes)
// ============================================================================

/**
 * Papelería totals - derived atom
 */
export const papeleriaTotalsAtom = atom((get): CalculationTotals => {
  const state = get(papeleriaStateAtom);
  const perUnit = calculatePerUnitCosts(
    state.directCosts,
    state.depreciation,
    state.indirectCosts,
    state.laborCosts,
    state.financials
  );
  return calculateTotals(perUnit, state.quantity);
});

/**
 * Vinil totals - derived atom (includes merma calculation)
 */
export const vinilTotalsAtom = atom((get): CalculationTotals => {
  const state = get(vinilStateAtom);
  const perUnit = calculateVinilPerUnit(
    state.directCosts,
    state.depreciation,
    state.extrasPerUnit,
    state.mermaPct,
    state.financials
  );
  return calculateTotals(perUnit, state.quantity);
});

/**
 * Sublimación totals - derived atom
 */
export const sublimacionTotalsAtom = atom((get): CalculationTotals => {
  const state = get(sublimacionStateAtom);
  const perUnit = calculatePerUnitCosts(
    state.directCosts,
    state.depreciation,
    undefined,
    state.laborCosts,
    state.financials
  );
  return calculateTotals(perUnit, state.quantity);
});

/**
 * Etiquetas totals - derived atom
 */
export const etiquetasTotalsAtom = atom((get): CalculationTotals => {
  const state = get(etiquetasStateAtom);
  const perUnit = calculatePerUnitCosts(
    state.directCosts,
    state.depreciation,
    state.indirectCosts,
    state.laborCosts,
    state.financials
  );
  return calculateTotals(perUnit, state.quantity);
});

/**
 * DTF totals - derived atom
 */
export const dtfTotalsAtom = atom((get) => {
  const state = get(dtfStateAtom);
  return calculateDtfTotals(state);
});

/**
 * Empaques totals - derived atom
 */
export const empaquesTotalsAtom = atom((get): CalculationTotals => {
  const state = get(empaquesStateAtom);
  const perUnit = calculatePerUnitCosts(
    state.directCosts,
    state.depreciation,
    state.indirectCosts,
    state.laborCosts,
    state.financials
  );
  return calculateTotals(perUnit, state.quantity);
});

/**
 * Esferas totals - derived atom
 */
export const esferasTotalsAtom = atom((get) => {
  const state = get(esferasStateAtom);
  return calculateEsferasTotals(state);
});

/**
 * Envíos totals - derived atom
 */
export const enviosTotalsAtom = atom((get) => {
  const state = get(enviosStateAtom);
  return calculateEnviosCosts(
    state.mensajeria.enabled,
    state.mensajeria.baseRate,
    state.mensajeria.km,
    state.mensajeria.kmRate,
    state.mensajeria.kg,
    state.mensajeria.kgRate,
    state.extras.embalaje.enabled,
    state.extras.embalaje.cost,
    state.extras.fragil.enabled,
    state.extras.fragil.cost,
    state.extras.seguro.enabled,
    state.extras.seguro.percentaje,
    state.extras.otros
  );
});

// ============================================================================
// HELPER ATOMS - UPDATERS (write-only atoms for common operations)
// ============================================================================

/**
 * Update direct cost item in Papelería
 */
export const updatePapeleriaDirectCostAtom = atom(
  null,
  (get, set, update: { id: string; patch: Partial<DirectCostItem> }) => {
    const state = get(papeleriaStateAtom);
    set(papeleriaStateAtom, {
      ...state,
      directCosts: state.directCosts!.map((item) =>
        item.id === update.id ? { ...item, ...update.patch } : item
      ),
    });
  }
);

/**
 * Update depreciation item in Papelería
 */
export const updatePapeleriaDepreciationAtom = atom(
  null,
  (get, set, update: { id: string; patch: Partial<DepreciationItem> }) => {
    const state = get(papeleriaStateAtom);
    set(papeleriaStateAtom, {
      ...state,
      depreciation: state.depreciation!.map((item) =>
        item.id === update.id ? { ...item, ...update.patch } : item
      ),
    });
  }
);

/**
 * Update indirect costs in Papelería
 */
export const updatePapeleriaIndirectCostsAtom = atom(
  null,
  (get, set, patch: Partial<IndirectCosts>) => {
    const state = get(papeleriaStateAtom);
    set(papeleriaStateAtom, {
      ...state,
      indirectCosts: { ...state.indirectCosts!, ...patch },
    });
  }
);

/**
 * Update labor costs in Papelería
 */
export const updatePapeleriaLaborCostsAtom = atom(
  null,
  (get, set, patch: Partial<LaborCosts>) => {
    const state = get(papeleriaStateAtom);
    set(papeleriaStateAtom, {
      ...state,
      laborCosts: { ...state.laborCosts!, ...patch },
    });
  }
);

/**
 * Update financials in Papelería
 */
export const updatePapeleriaFinancialsAtom = atom(
  null,
  (get, set, patch: Partial<FinancialSettings>) => {
    const state = get(papeleriaStateAtom);
    set(papeleriaStateAtom, {
      ...state,
      financials: { ...state.financials, ...patch },
    });
  }
);

/**
 * Update quantity in Papelería
 */
export const updatePapeleriaQuantityAtom = atom(
  null,
  (get, set, quantity: number) => {
    const state = get(papeleriaStateAtom);
    set(papeleriaStateAtom, { ...state, quantity });
  }
);

/**
 * Reset Papelería to defaults
 */
export const resetPapeleriaAtom = atom(null, (get, set) => {
  set(papeleriaStateAtom, PAPELERIA_DEFAULT_STATE);
});

// ============================================================================
// ETIQUETAS SPECIAL ACTIONS
// ============================================================================

/**
 * Update product type in Etiquetas (updates preset values)
 */
export const updateEtiquetasProductTypeAtom = atom(
  null,
  (get, set, productType: EtiquetasCalculatorState['productType']) => {
    const state = get(etiquetasStateAtom);
    const preset = ETIQUETAS_PRODUCT_PRESETS[productType];

    if (!preset) return;

    const updatedDirectCosts = state.directCosts.map((item) =>
      item.id === 'producto'
        ? { ...item, price: preset.price, quantity: preset.quantity }
        : item
    );

    set(etiquetasStateAtom, {
      ...state,
      productType,
      directCosts: updatedDirectCosts,
    });
  }
);

// ============================================================================
// GENERIC UPDATER FACTORY
// ============================================================================

/**
 * Create updater atoms for any calculator
 * Returns a set of common updater atoms
 */
export function createCalculatorUpdaters<T extends CalculatorState>(
  stateAtom: typeof papeleriaStateAtom,
  defaultState: T
) {
  return {
    updateDirectCost: atom(
      null,
      (get, set, update: { id: string; patch: Partial<DirectCostItem> }) => {
        const state = get(stateAtom);
        set(stateAtom, {
          ...state,
          directCosts: state.directCosts?.map((item) =>
            item.id === update.id ? { ...item, ...update.patch } : item
          ),
        });
      }
    ),

    updateDepreciation: atom(
      null,
      (get, set, update: { id: string; patch: Partial<DepreciationItem> }) => {
        const state = get(stateAtom);
        set(stateAtom, {
          ...state,
          depreciation: state.depreciation?.map((item) =>
            item.id === update.id ? { ...item, ...update.patch } : item
          ),
        });
      }
    ),

    updateFinancials: atom(
      null,
      (get, set, patch: Partial<FinancialSettings>) => {
        const state = get(stateAtom);
        set(stateAtom, {
          ...state,
          financials: { ...state.financials, ...patch },
        });
      }
    ),

    updateQuantity: atom(null, (get, set, quantity: number) => {
      const state = get(stateAtom);
      set(stateAtom, { ...state, quantity });
    }),

    reset: atom(null, (get, set) => {
      set(stateAtom, defaultState);
    }),
  };
}

// ============================================================================
// CALCULATOR MAP (for dynamic access)
// ============================================================================

export const CALCULATOR_ATOMS_MAP = {
  papeleria: {
    state: papeleriaStateAtom,
    totals: papeleriaTotalsAtom,
    default: PAPELERIA_DEFAULT_STATE,
  },
  vinil: {
    state: vinilStateAtom,
    totals: vinilTotalsAtom,
    default: VINIL_DEFAULT_STATE,
  },
  sublimacion: {
    state: sublimacionStateAtom,
    totals: sublimacionTotalsAtom,
    default: SUBLIMACION_DEFAULT_STATE,
  },
  etiquetas: {
    state: etiquetasStateAtom,
    totals: etiquetasTotalsAtom,
    default: ETIQUETAS_DEFAULT_STATE,
  },
  dtf: {
    state: dtfStateAtom,
    totals: dtfTotalsAtom,
    default: DTF_DEFAULT_STATE,
  },
  empaques: {
    state: empaquesStateAtom,
    totals: empaquesTotalsAtom,
    default: EMPAQUES_DEFAULT_STATE,
  },
  esferas: {
    state: esferasStateAtom,
    totals: esferasTotalsAtom,
    default: ESFERAS_DEFAULT_STATE,
  },
  envios: {
    state: enviosStateAtom,
    totals: enviosTotalsAtom,
    default: ENVIOS_DEFAULT_STATE,
  },
} as const;

/**
 * Get calculator atoms by type
 */
export function getCalculatorAtoms(type: CalculatorType) {
  return CALCULATOR_ATOMS_MAP[type];
}
