/**
 * Convenience hooks for using calculator atoms in components
 * Wraps Jotai atoms with ergonomic APIs
 */

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { CalculatorType } from './types';
import { getCalculatorAtoms } from './atoms';
import {
  stationeryStateAtom,
  stationeryTotalsAtom,
  updateStationeryDirectCostAtom,
  updateStationeryDepreciationAtom,
  updateStationeryIndirectCostsAtom,
  updateStationeryLaborCostsAtom,
  updateStationeryFinancialsAtom,
  updateStationeryQuantityAtom,
  resetStationeryAtom,
  vinylStateAtom,
  vinylTotalsAtom,
  sublimationStateAtom,
  sublimationTotalsAtom,
  labelsStateAtom,
  labelsTotalsAtom,
  updateLabelsProductTypeAtom,
  dtfStateAtom,
  dtfTotalsAtom,
  packagingStateAtom,
  packagingTotalsAtom,
  spheresStateAtom,
  spheresTotalsAtom,
  shippingStateAtom,
  shippingTotalsAtom,
} from './atoms';

// ============================================================================
// STATIONERY HOOK
// ============================================================================

export function useStationeryCalculator() {
  const [internalState, setState] = useAtom(stationeryStateAtom);
  const totals = useAtomValue(stationeryTotalsAtom);
  const updateDirectCost = useSetAtom(updateStationeryDirectCostAtom);
  const updateDepreciation = useSetAtom(updateStationeryDepreciationAtom);
  const updateIndirectCosts = useSetAtom(updateStationeryIndirectCostsAtom);
  const updateLaborCosts = useSetAtom(updateStationeryLaborCostsAtom);
  const updateFinancials = useSetAtom(updateStationeryFinancialsAtom);
  const updateQuantity = useSetAtom(updateStationeryQuantityAtom);
  const reset = useSetAtom(resetStationeryAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    indirect: internalState.indirectCosts || {
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
    },
    labor: internalState.laborCosts || {
      enabled: false,
      salary: 400,
      hoursPerMonth: 176,
      setupMinutes: 5,
      runMinutesPerUnit: 3,
      unitsPerBatch: 1,
    },
    profitPct: internalState.financials.profitPct,
    taxPct: internalState.financials.taxPct,
    applyProfit: internalState.financials.applyProfit,
    applyTax: internalState.financials.applyTax,
    quantity: internalState.quantity,
  };

  return {
    state,
    totals,
    updateDirect: updateDirectCost,
    updateDepreciation,
    setIndirect: updateIndirectCosts,
    setIndirectMonthly: (key: keyof typeof state.indirect.monthly, value: number) => {
      updateIndirectCosts({
        monthly: { ...state.indirect.monthly, [key]: value },
      });
    },
    setLabor: updateLaborCosts,
    setProfitPct: (value: number) => updateFinancials({ profitPct: value }),
    setTaxPct: (value: number) => updateFinancials({ taxPct: value }),
    setApplyProfit: (value: boolean) => updateFinancials({ applyProfit: value }),
    setApplyTax: (value: boolean) => updateFinancials({ applyTax: value }),
    setQuantity: updateQuantity,
    reset,
  };
}

// ============================================================================
// VINYL HOOK
// ============================================================================

export function useVinylCalculator() {
  const [internalState, setState] = useAtom(vinylStateAtom);
  const totals = useAtomValue(vinylTotalsAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    extrasPerUnit: internalState.extrasPerUnit,
    wastePct: internalState.wastePct,
    profitPct: internalState.financials.profitPct,
    taxPct: internalState.financials.taxPct,
    applyProfit: internalState.financials.applyProfit,
    applyTax: internalState.financials.applyTax,
    quantity: internalState.quantity,
  };

  return {
    state,
    totals,
    updateDirect: (id: string, patch: any) => {
      setState({
        ...internalState,
        directCosts: internalState.directCosts.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      });
    },
    updateDep: (id: string, patch: any) => {
      setState({
        ...internalState,
        depreciation: internalState.depreciation.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      });
    },
    setExtrasPerUnit: (value: number) => setState({ ...internalState, extrasPerUnit: value }),
    setWastePct: (value: number) => setState({ ...internalState, wastePct: value }),
    setProfitPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, profitPct: value } }),
    setTaxPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, taxPct: value } }),
    setApplyProfit: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyProfit: value } }),
    setApplyTax: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyTax: value } }),
    setQuantity: (value: number) => setState({ ...internalState, quantity: value }),
    reset: () => setState(getCalculatorAtoms('vinyl').default),
  };
}

// ============================================================================
// SUBLIMATION HOOK
// ============================================================================

export function useSublimationCalculator() {
  const [internalState, setState] = useAtom(sublimationStateAtom);
  const totals = useAtomValue(sublimationTotalsAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    labor: internalState.laborCosts || {
      enabled: false,
      setupMinutes: 10,
      runMinutesPerUnit: 1.5,
      hourlyRate: 8,
    },
    profitPct: internalState.financials.profitPct,
    taxPct: internalState.financials.taxPct,
    applyProfit: internalState.financials.applyProfit,
    applyTax: internalState.financials.applyTax,
    quantity: internalState.quantity,
  };

  return {
    state,
    totals,
    updateDirect: (id: string, patch: any) => {
      setState({
        ...internalState,
        directCosts: internalState.directCosts!.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      });
    },
    updateDep: (id: string, patch: any) => {
      setState({
        ...internalState,
        depreciation: internalState.depreciation!.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      });
    },
    updateLabor: (patch: any) => {
      setState({
        ...internalState,
        laborCosts: { ...internalState.laborCosts!, ...patch },
      });
    },
    setProfitPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, profitPct: value } }),
    setTaxPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, taxPct: value } }),
    setApplyProfit: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyProfit: value } }),
    setApplyTax: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyTax: value } }),
    setQuantity: (value: number) => setState({ ...internalState, quantity: value }),
    reset: () => setState(getCalculatorAtoms('sublimation').default),
  };
}

// ============================================================================
// LABELS HOOK
// ============================================================================

export function useLabelsCalculator() {
  const [internalState, setState] = useAtom(labelsStateAtom);
  const totals = useAtomValue(labelsTotalsAtom);
  const updateProductType = useSetAtom(updateLabelsProductTypeAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    indirect: internalState.indirectCosts || {
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
    },
    labor: internalState.laborCosts || {
      enabled: false,
      salary: 400,
      hoursPerMonth: 176,
      setupMinutes: 5,
      runMinutesPerUnit: 2,
      unitsPerBatch: 1,
    },
    productType: internalState.productType,
    profitPct: internalState.financials.profitPct,
    taxPct: internalState.financials.taxPct,
    applyProfit: internalState.financials.applyProfit,
    applyTax: internalState.financials.applyTax,
    quantity: internalState.quantity,
  };

  return {
    state,
    totals,
    updateDirect: (id: string, patch: any) => {
      setState({
        ...internalState,
        directCosts: internalState.directCosts.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      });
    },
    updateDepreciation: (id: string, patch: any) => {
      setState({
        ...internalState,
        depreciation: internalState.depreciation.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      });
    },
    setProductType: updateProductType,
    setIndirect: (patch: any) => {
      setState({
        ...internalState,
        indirectCosts: { ...internalState.indirectCosts, ...patch },
      });
    },
    setIndirectMonthly: (key: string, value: number) => {
      setState({
        ...internalState,
        indirectCosts: {
          ...internalState.indirectCosts,
          monthly: { ...internalState.indirectCosts.monthly, [key]: value },
        },
      });
    },
    setLabor: (patch: any) => {
      setState({
        ...internalState,
        laborCosts: { ...internalState.laborCosts, ...patch },
      });
    },
    setProfitPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, profitPct: value } }),
    setTaxPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, taxPct: value } }),
    setApplyProfit: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyProfit: value } }),
    setApplyTax: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyTax: value } }),
    setQuantity: (value: number) => setState({ ...internalState, quantity: value }),
    reset: () => setState(getCalculatorAtoms('labels').default),
  };
}

// ============================================================================
// DTF HOOK
// ============================================================================

export function useDtfCalculator() {
  const [internalState, setState] = useAtom(dtfStateAtom);
  const totals = useAtomValue(dtfTotalsAtom);

  const state = {
    ...internalState,
    indirect: internalState.indirectCosts,
    labor: internalState.laborCosts,
    applyProfit: internalState.financials.applyProfit,
    applyTax: internalState.financials.applyTax,
    profitPct: internalState.financials.profitPct,
    taxPct: internalState.financials.taxPct,
  };

  const setStatePatch = (patch: Partial<typeof internalState>) => setState((prev) => ({ ...prev, ...patch }));

  return {
    state,
    totals,
    setModality: (mod: any) => setStatePatch({ modality: mod }),
    setRespectMinimum: (v: boolean) => setStatePatch({ respectMinimum: v }),
    setPricePerUnit: (v: number) => setStatePatch({ pricePerUnit: v }),
    setLengthCm: (v: number) => setStatePatch({ lengthCm: v }),
    setCalcByDesign: (v: boolean) => setStatePatch({ calcByDesign: v }),
    setDesignCount: (v: number) => setStatePatch({ designCount: v }),
    setDesignWidthCm: (v: number) => setStatePatch({ designWidthCm: v }),
    setDesignHeightCm: (v: number) => setStatePatch({ designHeightCm: v }),
    setExtras: (patch: Partial<typeof internalState.extras>) =>
      setState((prev) => ({ ...prev, extras: { ...prev.extras, ...patch } })),
    setGarment: (patch: Partial<typeof internalState.garment>) =>
      setState((prev) => ({ ...prev, garment: { ...prev.garment, ...patch } })),
    setDepreciation: (patch: Partial<typeof internalState.depreciation>) =>
      setState((prev) => ({ ...prev, depreciation: { ...prev.depreciation, ...patch } })),
    setIndirect: (patch: any) =>
      setState((prev) => ({ ...prev, indirectCosts: { ...prev.indirectCosts, ...patch } })),
    setIndirectMonthly: (key: string, value: number) =>
      setState((prev) => ({
        ...prev,
        indirectCosts: {
          ...prev.indirectCosts,
          monthly: { ...prev.indirectCosts.monthly, [key]: value },
        },
      })),
    setLabor: (patch: any) =>
      setState((prev) => ({ ...prev, laborCosts: { ...prev.laborCosts, ...patch } })),
    setProfitPct: (v: number) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, profitPct: v } })),
    setTaxPct: (v: number) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, taxPct: v } })),
    setApplyProfit: (v: boolean) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, applyProfit: v } })),
    setApplyTax: (v: boolean) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, applyTax: v } })),
    reset: () => setState(getCalculatorAtoms('dtf').default),
  };
}

// ============================================================================
// PACKAGING HOOK
// ============================================================================

export function usePackagingCalculator() {
  const [internalState, setState] = useAtom(packagingStateAtom);
  const totals = useAtomValue(packagingTotalsAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    indirect: internalState.indirectCosts || {
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
    },
    labor: internalState.laborCosts || {
      enabled: false,
      salary: 400,
      hoursPerMonth: 176,
      setupMinutes: 5,
      runMinutesPerUnit: 3,
      unitsPerBatch: 1,
    },
    profitPct: internalState.financials.profitPct,
    taxPct: internalState.financials.taxPct,
    applyProfit: internalState.financials.applyProfit,
    applyTax: internalState.financials.applyTax,
    quantity: internalState.quantity,
  };

  return {
    state,
    totals,
    updateDirect: (id: string, patch: any) => {
      setState({
        ...internalState,
        directCosts: internalState.directCosts!.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      });
    },
    updateDepreciation: (id: string, patch: any) => {
      setState({
        ...internalState,
        depreciation: internalState.depreciation!.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      });
    },
    setIndirect: (patch: any) => {
      setState({
        ...internalState,
        indirectCosts: { ...internalState.indirectCosts!, ...patch },
      });
    },
    setIndirectMonthly: (key: string, value: number) => {
      setState({
        ...internalState,
        indirectCosts: {
          ...internalState.indirectCosts!,
          monthly: { ...internalState.indirectCosts!.monthly, [key]: value },
        },
      });
    },
    setLabor: (patch: any) => {
      setState({
        ...internalState,
        laborCosts: { ...internalState.laborCosts!, ...patch },
      });
    },
    setProfitPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, profitPct: value } }),
    setTaxPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, taxPct: value } }),
    setApplyProfit: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyProfit: value } }),
    setApplyTax: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyTax: value } }),
    setQuantity: (value: number) => setState({ ...internalState, quantity: value }),
    reset: () => setState(getCalculatorAtoms('packaging').default),
  };
}

// ============================================================================
// SPHERES HOOK
// ============================================================================

export function useSpheresCalculator() {
  const [internalState, setState] = useAtom(spheresStateAtom);
  const totals = useAtomValue(spheresTotalsAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    indirect: internalState.indirectCosts || {
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
    },
    labor: internalState.laborCosts || {
      enabled: false,
      salary: 400,
      hoursPerMonth: 176,
      setupMinutes: 5,
      runMinutesPerUnit: 2,
      unitsPerBatch: 1,
    },
    productSelection: internalState.productSelection,
    profitPct: internalState.financials.profitPct,
    taxPct: internalState.financials.taxPct,
    applyProfit: internalState.financials.applyProfit,
    applyTax: internalState.financials.applyTax,
    profitMode: internalState.profitMode,
    quantity: internalState.quantity,
    quantityEnabled: internalState.quantityEnabled,
  };

  return {
    state,
    totals,
    updateDirect: (id: string, patch: any) => {
      setState((prev) => ({
        ...prev,
        directCosts: prev.directCosts.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      }));
    },
    updateDep: (id: string, patch: any) => {
      setState((prev) => ({
        ...prev,
        depreciation: prev.depreciation.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      }));
    },
    updateIndirectMonthly: (key: string, value: number) => {
      setState((prev) => ({
        ...prev,
        indirectCosts: {
          ...prev.indirectCosts,
          monthly: { ...prev.indirectCosts.monthly, [key]: value },
        },
      }));
    },
    setIndirectUnits: (value: number) =>
      setState((prev) => ({ ...prev, indirectCosts: { ...prev.indirectCosts, unitsPerMonth: value } })),
    setIndirectEnabled: (value: boolean) =>
      setState((prev) => ({ ...prev, indirectCosts: { ...prev.indirectCosts, enabled: value } })),
    updateLabor: (patch: any) => setState((prev) => ({ ...prev, laborCosts: { ...prev.laborCosts, ...patch } })),
    setProfitPct: (value: number) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, profitPct: value } })),
    setTaxPct: (value: number) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, taxPct: value } })),
    setProfitMode: (mode: 'markup' | 'margin') => setState((prev) => ({ ...prev, profitMode: mode })),
    setApplyProfit: (value: boolean) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, applyProfit: value } })),
    setApplyTax: (value: boolean) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, applyTax: value } })),
    setQuantity: (value: number) => setState((prev) => ({ ...prev, quantity: value })),
    setQuantityEnabled: (value: boolean) => setState((prev) => ({ ...prev, quantityEnabled: value })),
    setProductSelection: (value: string) => setState((prev) => ({ ...prev, productSelection: value })),
    reset: () => setState(getCalculatorAtoms('spheres').default),
  };
}

// ============================================================================
// SHIPPING HOOK
// ============================================================================

export function useShippingCalculator() {
  const [state, setState] = useAtom(shippingStateAtom);
  const totals = useAtomValue(shippingTotalsAtom);

  return {
    state,
    totals,
    setField: (key: any, value: any) => {
      setState({ ...state, [key]: value });
    },
    reset: () => setState(getCalculatorAtoms('shipping').default),
  };
}

// ============================================================================
// GENERIC CALCULATOR HOOK (for dynamic usage)
// ============================================================================

export function useCalculator(type: CalculatorType) {
  const atoms = getCalculatorAtoms(type);
  const state = useAtomValue(atoms.state as any);
  const totals = useAtomValue(atoms.totals);

  return { state, totals };
}
