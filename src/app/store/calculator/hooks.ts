/**
 * Convenience hooks for using calculator atoms in components
 * Wraps Jotai atoms with ergonomic APIs
 *
 * IMPORTANT: These hooks maintain backward compatibility with the old useState-based hooks
 * by mapping the new internal structure to the old API surface
 */

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { CalculatorType } from './types';
import { getCalculatorAtoms } from './atoms';
import {
  papeleriaStateAtom,
  papeleriaTotalsAtom,
  updatePapeleriaDirectCostAtom,
  updatePapeleriaDepreciationAtom,
  updatePapeleriaIndirectCostsAtom,
  updatePapeleriaLaborCostsAtom,
  updatePapeleriaFinancialsAtom,
  updatePapeleriaQuantityAtom,
  resetPapeleriaAtom,
  vinilStateAtom,
  vinilTotalsAtom,
  sublimacionStateAtom,
  sublimacionTotalsAtom,
  etiquetasStateAtom,
  etiquetasTotalsAtom,
  updateEtiquetasProductTypeAtom,
  dtfStateAtom,
  dtfTotalsAtom,
  empaquesStateAtom,
  empaquesTotalsAtom,
  esferasStateAtom,
  esferasTotalsAtom,
  enviosStateAtom,
  enviosTotalsAtom,
} from './atoms';

// ============================================================================
// PAPELERIA HOOK
// ============================================================================

export function usePapeleriaCalculator() {
  const [internalState, setState] = useAtom(papeleriaStateAtom);
  const totals = useAtomValue(papeleriaTotalsAtom);
  const updateDirectCost = useSetAtom(updatePapeleriaDirectCostAtom);
  const updateDepreciation = useSetAtom(updatePapeleriaDepreciationAtom);
  const updateIndirectCosts = useSetAtom(updatePapeleriaIndirectCostsAtom);
  const updateLaborCosts = useSetAtom(updatePapeleriaLaborCostsAtom);
  const updateFinancials = useSetAtom(updatePapeleriaFinancialsAtom);
  const updateQuantity = useSetAtom(updatePapeleriaQuantityAtom);
  const reset = useSetAtom(resetPapeleriaAtom);

  // Backward compatibility: map new structure to old API
  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    indirect: internalState.indirectCosts || {
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
    },
    mo: internalState.laborCosts || {
      enabled: false,
      salary: 400,
      hoursPerMonth: 176,
      setupMinutes: 5,
      runMinutesPerUnit: 3,
      unitsPerBatch: 1,
    },
    gananciaPct: internalState.financials.gananciaPct,
    impuestosPct: internalState.financials.impuestosPct,
    applyGanancia: internalState.financials.applyGanancia,
    applyImpuestos: internalState.financials.applyImpuestos,
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
    setMo: updateLaborCosts,
    setGananciaPct: (value: number) => updateFinancials({ gananciaPct: value }),
    setImpuestosPct: (value: number) => updateFinancials({ impuestosPct: value }),
    setApplyGanancia: (value: boolean) => updateFinancials({ applyGanancia: value }),
    setApplyImpuestos: (value: boolean) => updateFinancials({ applyImpuestos: value }),
    setQuantity: updateQuantity,
    reset,
  };
}

// ============================================================================
// VINIL HOOK
// ============================================================================

export function useVinilCalculator() {
  const [internalState, setState] = useAtom(vinilStateAtom);
  const totals = useAtomValue(vinilTotalsAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    extrasPerUnit: internalState.extrasPerUnit,
    mermaPct: internalState.mermaPct,
    gananciaPct: internalState.financials.gananciaPct,
    impuestosPct: internalState.financials.impuestosPct,
    applyGanancia: internalState.financials.applyGanancia,
    applyImpuestos: internalState.financials.applyImpuestos,
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
    setMermaPct: (value: number) => setState({ ...internalState, mermaPct: value }),
    setGananciaPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, gananciaPct: value } }),
    setImpuestosPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, impuestosPct: value } }),
    setApplyGanancia: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyGanancia: value } }),
    setApplyImpuestos: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyImpuestos: value } }),
    setQuantity: (value: number) => setState({ ...internalState, quantity: value }),
    reset: () => setState(getCalculatorAtoms('vinil').default),
  };
}

// ============================================================================
// SUBLIMACION HOOK
// ============================================================================

export function useSublimacionCalculator() {
  const [internalState, setState] = useAtom(sublimacionStateAtom);
  const totals = useAtomValue(sublimacionTotalsAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    mo: internalState.laborCosts || {
      enabled: false,
      setupMinutes: 10,
      runMinutesPerUnit: 1.5,
      hourlyRate: 8,
    },
    gananciaPct: internalState.financials.gananciaPct,
    impuestosPct: internalState.financials.impuestosPct,
    applyGanancia: internalState.financials.applyGanancia,
    applyImpuestos: internalState.financials.applyImpuestos,
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
    updateMo: (patch: any) => {
      setState({
        ...internalState,
        laborCosts: { ...internalState.laborCosts!, ...patch },
      });
    },
    setGananciaPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, gananciaPct: value } }),
    setImpuestosPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, impuestosPct: value } }),
    setApplyGanancia: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyGanancia: value } }),
    setApplyImpuestos: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyImpuestos: value } }),
    setQuantity: (value: number) => setState({ ...internalState, quantity: value }),
    reset: () => setState(getCalculatorAtoms('sublimacion').default),
  };
}

// ============================================================================
// ETIQUETAS HOOK
// ============================================================================

export function useEtiquetasCalculator() {
  const [internalState, setState] = useAtom(etiquetasStateAtom);
  const totals = useAtomValue(etiquetasTotalsAtom);
  const updateProductType = useSetAtom(updateEtiquetasProductTypeAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    indirect: internalState.indirectCosts || {
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
    },
    mo: internalState.laborCosts || {
      enabled: false,
      salary: 400,
      hoursPerMonth: 176,
      setupMinutes: 5,
      runMinutesPerUnit: 2,
      unitsPerBatch: 1,
    },
    productType: internalState.productType,
    gananciaPct: internalState.financials.gananciaPct,
    impuestosPct: internalState.financials.impuestosPct,
    applyGanancia: internalState.financials.applyGanancia,
    applyImpuestos: internalState.financials.applyImpuestos,
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
    setMo: (patch: any) => {
      setState({
        ...internalState,
        laborCosts: { ...internalState.laborCosts, ...patch },
      });
    },
    setGananciaPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, gananciaPct: value } }),
    setImpuestosPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, impuestosPct: value } }),
    setApplyGanancia: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyGanancia: value } }),
    setApplyImpuestos: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyImpuestos: value } }),
    setQuantity: (value: number) => setState({ ...internalState, quantity: value }),
    reset: () => setState(getCalculatorAtoms('etiquetas').default),
  };
}

// ============================================================================
// DTF HOOK
// ============================================================================

export function useDtfCalculator() {
  const [state, setState] = useAtom(dtfStateAtom);
  const totals = useAtomValue(dtfTotalsAtom);

  const setStatePatch = (patch: Partial<typeof state>) => setState((prev) => ({ ...prev, ...patch }));

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
    setExtras: (patch: Partial<typeof state.extras>) =>
      setState((prev) => ({ ...prev, extras: { ...prev.extras, ...patch } })),
    setPrenda: (patch: Partial<typeof state.prenda>) =>
      setState((prev) => ({ ...prev, prenda: { ...prev.prenda, ...patch } })),
    setDepreciation: (patch: Partial<typeof state.depreciation>) =>
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
    setMo: (patch: any) =>
      setState((prev) => ({ ...prev, laborCosts: { ...prev.laborCosts, ...patch } })),
    setGananciaPct: (v: number) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, gananciaPct: v } })),
    setImpuestosPct: (v: number) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, impuestosPct: v } })),
    setApplyGanancia: (v: boolean) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, applyGanancia: v } })),
    setApplyImpuestos: (v: boolean) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, applyImpuestos: v } })),
    reset: () => setState(getCalculatorAtoms('dtf').default),
  };
}

// ============================================================================
// EMPAQUES HOOK
// ============================================================================

export function useEmpaquesCalculator() {
  const [internalState, setState] = useAtom(empaquesStateAtom);
  const totals = useAtomValue(empaquesTotalsAtom);

  const state = {
    direct: internalState.directCosts || [],
    depreciation: internalState.depreciation || [],
    indirect: internalState.indirectCosts || {
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
    },
    mo: internalState.laborCosts || {
      enabled: false,
      salary: 400,
      hoursPerMonth: 176,
      setupMinutes: 5,
      runMinutesPerUnit: 3,
      unitsPerBatch: 1,
    },
    gananciaPct: internalState.financials.gananciaPct,
    impuestosPct: internalState.financials.impuestosPct,
    applyGanancia: internalState.financials.applyGanancia,
    applyImpuestos: internalState.financials.applyImpuestos,
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
    setMo: (patch: any) => {
      setState({
        ...internalState,
        laborCosts: { ...internalState.laborCosts!, ...patch },
      });
    },
    setGananciaPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, gananciaPct: value } }),
    setImpuestosPct: (value: number) =>
      setState({ ...internalState, financials: { ...internalState.financials, impuestosPct: value } }),
    setApplyGanancia: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyGanancia: value } }),
    setApplyImpuestos: (value: boolean) =>
      setState({ ...internalState, financials: { ...internalState.financials, applyImpuestos: value } }),
    setQuantity: (value: number) => setState({ ...internalState, quantity: value }),
    reset: () => setState(getCalculatorAtoms('empaques').default),
  };
}

// ============================================================================
// ESFERAS HOOK
// ============================================================================

export function useEsferasCalculator() {
  const [state, setState] = useAtom(esferasStateAtom);
  const totals = useAtomValue(esferasTotalsAtom);

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
    updateMo: (patch: any) => setState((prev) => ({ ...prev, laborCosts: { ...prev.laborCosts, ...patch } })),
    setGananciaPct: (value: number) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, gananciaPct: value } })),
    setImpuestosPct: (value: number) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, impuestosPct: value } })),
    setGananciaMode: (mode: 'markup' | 'margen') => setState((prev) => ({ ...prev, gananciaMode: mode })),
    setApplyGanancia: (value: boolean) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, applyGanancia: value } })),
    setApplyImpuestos: (value: boolean) =>
      setState((prev) => ({ ...prev, financials: { ...prev.financials, applyImpuestos: value } })),
    setQuantity: (value: number) => setState((prev) => ({ ...prev, quantity: value })),
    setQuantityEnabled: (value: boolean) => setState((prev) => ({ ...prev, quantityEnabled: value })),
    setProductSelection: (value: string) => setState((prev) => ({ ...prev, productSelection: value })),
    reset: () => setState(getCalculatorAtoms('esferas').default),
  };
}

// ============================================================================
// ENVIOS HOOK
// ============================================================================

export function useEnviosCalculator() {
  const [state, setState] = useAtom(enviosStateAtom);
  const totals = useAtomValue(enviosTotalsAtom);

  return {
    state,
    totals,
    setField: (key: any, value: any) => {
      setState({ ...state, [key]: value });
    },
    reset: () => setState(getCalculatorAtoms('envios').default),
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
