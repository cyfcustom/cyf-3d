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
  VinylCalculatorState,
  LabelsCalculatorState,
  ShippingCalculatorState,
  DtfCalculatorState,
  SpheresCalculatorState,
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
  calculateVinylPerUnit,
  calculateShippingCosts,
  calculateDtfTotals,
  calculateSpheresTotals,
} from './calculations';
import {
  STATIONERY_DEFAULT_STATE,
  VINYL_DEFAULT_STATE,
  SUBLIMATION_DEFAULT_STATE,
  LABELS_DEFAULT_STATE,
  DTF_DEFAULT_STATE,
  PACKAGING_DEFAULT_STATE,
  SPHERES_DEFAULT_STATE,
  SHIPPING_DEFAULT_STATE,
  LABELS_PRODUCT_PRESETS,
} from './defaults';
import { fetchActiveConfig } from '@/app/lib/api/calculatorConfigApi';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  stationery: 'stationery-calculator-v2',
  vinyl: 'vinyl-calculator-v2',
  sublimation: 'sublimation-calculator-v2',
  labels: 'labels-calculator-v2',
  dtf: 'dtf-calculator-v2',
  packaging: 'packaging-calculator-v2',
  spheres: 'spheres-calculator-v2',
  shipping: 'shipping-calculator-v2',
} as const;

// Old keys for migration
const LEGACY_STORAGE_KEYS = {
  stationery: 'papeleria-calculator-v2',
  vinyl: 'vinil-calculator-v2',
  sublimation: 'sublimacion-calculator-v2',
  labels: 'etiquetas-calculator-v2',
  packaging: 'empaques-calculator-v2',
  spheres: 'esferas-calculator-v2',
  shipping: 'envios-calculator-v2',
} as const;

// Migrate old localStorage keys to new ones
function migrateStorageKey(oldKey: string, newKey: string) {
  try {
    const oldData = localStorage.getItem(oldKey);
    if (oldData && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldData);
    }
    localStorage.removeItem(oldKey);
  } catch {}
}

// Run migration on module load
Object.entries(LEGACY_STORAGE_KEYS).forEach(([module, oldKey]) => {
  migrateStorageKey(oldKey, STORAGE_KEYS[module as keyof typeof STORAGE_KEYS]);
});

// ============================================================================
// BASE CALCULATOR ATOMS (with localStorage persistence)
// ============================================================================

// Stationery
export const stationeryStateAtom = atomWithStorage<CalculatorState>(
  STORAGE_KEYS.stationery,
  STATIONERY_DEFAULT_STATE
);

// Vinyl
export const vinylStateAtom = atomWithStorage<VinylCalculatorState>(
  STORAGE_KEYS.vinyl,
  VINYL_DEFAULT_STATE
);

// Sublimation — now hydrated from Supabase, with defaults.ts as offline fallback
export const sublimationStateAtom = atom<CalculatorState>(SUBLIMATION_DEFAULT_STATE);

// Meta information about the active Supabase config for sublimation
export interface ConfigMeta {
  configId: string | null;
  configVersion: number;
  isLoading: boolean;
  lastSynced: string | null;
}

export const sublimationConfigMetaAtom = atom<ConfigMeta>({
  configId: null,
  configVersion: 0,
  isLoading: false,
  lastSynced: null,
});

// Write-only atom: fetches config from Supabase and populates sublimationStateAtom
export const hydrateSublimationFromSupabaseAtom = atom(null, async (get, set) => {
  set(sublimationConfigMetaAtom, (prev) => ({ ...prev, isLoading: true }));

  try {
    const config = await fetchActiveConfig('sublimation');

    if (config) {
      const directCosts = config.direct_costs as DirectCostItem[];
      const depreciation = config.depreciation as DepreciationItem[];
      const laborCosts = config.labor_costs as LaborCosts | null;
      const financials = config.financials as FinancialSettings;

      set(sublimationStateAtom, {
        directCosts,
        depreciation,
        laborCosts: laborCosts ?? SUBLIMATION_DEFAULT_STATE.laborCosts,
        financials,
        quantity: get(sublimationStateAtom).quantity, // preserve user's current quantity
      });

      set(sublimationConfigMetaAtom, {
        configId: config.id,
        configVersion: config.config_version,
        isLoading: false,
        lastSynced: new Date().toISOString(),
      });
    } else {
      // Supabase unavailable — keep defaults
      set(sublimationConfigMetaAtom, (prev) => ({ ...prev, isLoading: false }));
    }
  } catch (error) {
    console.warn('[Hydrate] Failed to fetch sublimation config, using defaults:', error);
    set(sublimationConfigMetaAtom, (prev) => ({ ...prev, isLoading: false }));
  }

  // Clean up old localStorage key if it exists
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEYS.sublimation);
  } catch {}
});

// Labels
export const labelsStateAtom = atomWithStorage<LabelsCalculatorState>(
  STORAGE_KEYS.labels,
  LABELS_DEFAULT_STATE
);

// DTF
export const dtfStateAtom = atomWithStorage<DtfCalculatorState>(
  STORAGE_KEYS.dtf,
  DTF_DEFAULT_STATE
);

// Packaging
export const packagingStateAtom = atomWithStorage<CalculatorState>(
  STORAGE_KEYS.packaging,
  PACKAGING_DEFAULT_STATE
);

// Spheres
export const spheresStateAtom = atomWithStorage<SpheresCalculatorState>(
  STORAGE_KEYS.spheres,
  SPHERES_DEFAULT_STATE
);

// Shipping
export const shippingStateAtom = atomWithStorage<ShippingCalculatorState>(
  STORAGE_KEYS.shipping,
  SHIPPING_DEFAULT_STATE
);

// ============================================================================
// DERIVED ATOMS - CALCULATIONS (automatically recalculate when state changes)
// ============================================================================

/**
 * Stationery totals - derived atom
 */
export const stationeryTotalsAtom = atom((get): CalculationTotals => {
  const state = get(stationeryStateAtom);
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
 * Vinyl totals - derived atom (includes waste calculation)
 */
export const vinylTotalsAtom = atom((get): CalculationTotals => {
  const state = get(vinylStateAtom);
  const perUnit = calculateVinylPerUnit(
    state.directCosts,
    state.depreciation,
    state.extrasPerUnit,
    state.wastePct,
    state.financials
  );
  return calculateTotals(perUnit, state.quantity);
});

/**
 * Sublimation totals - derived atom
 */
export const sublimationTotalsAtom = atom((get): CalculationTotals => {
  const state = get(sublimationStateAtom);
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
 * Labels totals - derived atom
 */
export const labelsTotalsAtom = atom((get): CalculationTotals => {
  const state = get(labelsStateAtom);
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
 * Packaging totals - derived atom
 */
export const packagingTotalsAtom = atom((get): CalculationTotals => {
  const state = get(packagingStateAtom);
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
 * Spheres totals - derived atom
 */
export const spheresTotalsAtom = atom((get) => {
  const state = get(spheresStateAtom);
  return calculateSpheresTotals(state);
});

/**
 * Shipping totals - derived atom
 */
export const shippingTotalsAtom = atom((get) => {
  const state = get(shippingStateAtom);
  return calculateShippingCosts(
    state.courier.enabled,
    state.courier.baseRate,
    state.courier.km,
    state.courier.kmRate,
    state.courier.kg,
    state.courier.kgRate,
    state.extras.packaging.enabled,
    state.extras.packaging.cost,
    state.extras.fragile.enabled,
    state.extras.fragile.cost,
    state.extras.insurance.enabled,
    state.extras.insurance.percentage,
    state.extras.other
  );
});

// ============================================================================
// HELPER ATOMS - UPDATERS (write-only atoms for common operations)
// ============================================================================

/**
 * Update direct cost item in Stationery
 */
export const updateStationeryDirectCostAtom = atom(
  null,
  (get, set, update: { id: string; patch: Partial<DirectCostItem> }) => {
    const state = get(stationeryStateAtom);
    set(stationeryStateAtom, {
      ...state,
      directCosts: state.directCosts!.map((item) =>
        item.id === update.id ? { ...item, ...update.patch } : item
      ),
    });
  }
);

/**
 * Update depreciation item in Stationery
 */
export const updateStationeryDepreciationAtom = atom(
  null,
  (get, set, update: { id: string; patch: Partial<DepreciationItem> }) => {
    const state = get(stationeryStateAtom);
    set(stationeryStateAtom, {
      ...state,
      depreciation: state.depreciation!.map((item) =>
        item.id === update.id ? { ...item, ...update.patch } : item
      ),
    });
  }
);

/**
 * Update indirect costs in Stationery
 */
export const updateStationeryIndirectCostsAtom = atom(
  null,
  (get, set, patch: Partial<IndirectCosts>) => {
    const state = get(stationeryStateAtom);
    set(stationeryStateAtom, {
      ...state,
      indirectCosts: { ...state.indirectCosts!, ...patch },
    });
  }
);

/**
 * Update labor costs in Stationery
 */
export const updateStationeryLaborCostsAtom = atom(
  null,
  (get, set, patch: Partial<LaborCosts>) => {
    const state = get(stationeryStateAtom);
    set(stationeryStateAtom, {
      ...state,
      laborCosts: { ...state.laborCosts!, ...patch },
    });
  }
);

/**
 * Update financials in Stationery
 */
export const updateStationeryFinancialsAtom = atom(
  null,
  (get, set, patch: Partial<FinancialSettings>) => {
    const state = get(stationeryStateAtom);
    set(stationeryStateAtom, {
      ...state,
      financials: { ...state.financials, ...patch },
    });
  }
);

/**
 * Update quantity in Stationery
 */
export const updateStationeryQuantityAtom = atom(
  null,
  (get, set, quantity: number) => {
    const state = get(stationeryStateAtom);
    set(stationeryStateAtom, { ...state, quantity });
  }
);

/**
 * Reset Stationery to defaults
 */
export const resetStationeryAtom = atom(null, (get, set) => {
  set(stationeryStateAtom, STATIONERY_DEFAULT_STATE);
});

// ============================================================================
// LABELS SPECIAL ACTIONS
// ============================================================================

/**
 * Update product type in Labels (updates preset values)
 */
export const updateLabelsProductTypeAtom = atom(
  null,
  (get, set, productType: LabelsCalculatorState['productType']) => {
    const state = get(labelsStateAtom);
    const preset = LABELS_PRODUCT_PRESETS[productType];

    if (!preset) return;

    const updatedDirectCosts = state.directCosts.map((item) =>
      item.id === 'producto'
        ? { ...item, price: preset.price, quantity: preset.quantity }
        : item
    );

    set(labelsStateAtom, {
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
  stateAtom: typeof stationeryStateAtom,
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
  stationery: {
    state: stationeryStateAtom,
    totals: stationeryTotalsAtom,
    default: STATIONERY_DEFAULT_STATE,
  },
  vinyl: {
    state: vinylStateAtom,
    totals: vinylTotalsAtom,
    default: VINYL_DEFAULT_STATE,
  },
  sublimation: {
    state: sublimationStateAtom,
    totals: sublimationTotalsAtom,
    default: SUBLIMATION_DEFAULT_STATE,
  },
  labels: {
    state: labelsStateAtom,
    totals: labelsTotalsAtom,
    default: LABELS_DEFAULT_STATE,
  },
  dtf: {
    state: dtfStateAtom,
    totals: dtfTotalsAtom,
    default: DTF_DEFAULT_STATE,
  },
  packaging: {
    state: packagingStateAtom,
    totals: packagingTotalsAtom,
    default: PACKAGING_DEFAULT_STATE,
  },
  spheres: {
    state: spheresStateAtom,
    totals: spheresTotalsAtom,
    default: SPHERES_DEFAULT_STATE,
  },
  shipping: {
    state: shippingStateAtom,
    totals: shippingTotalsAtom,
    default: SHIPPING_DEFAULT_STATE,
  },
} as const;

/**
 * Get calculator atoms by type
 */
export function getCalculatorAtoms(type: CalculatorType) {
  return CALCULATOR_ATOMS_MAP[type];
}
