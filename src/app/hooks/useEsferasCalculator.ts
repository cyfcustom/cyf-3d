import { useEffect, useMemo, useState } from 'react';
import { clampNumber, parseMoney } from '../lib/money';

type DirectItem = {
  id: string;
  label: string;
  enabled: boolean;
  price: number;
  quantity: number;
};

type DepItem = {
  id: string;
  label: string;
  enabled: boolean;
  price: number;
  mode: 'monthly' | 'life';
  unitsPerMonth?: number;
  lifeUnits?: number;
};

type IndirectState = {
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
  unitsPerMonth: number;
};

type MoState = {
  enabled: boolean;
  salary: number;
  hoursPerMonth: number;
  setupMinutes: number;
  runMinutesPerUnit: number;
  unitsPerBatch: number;
};

type EsferasState = {
  productSelection: string;
  direct: DirectItem[];
  depreciation: DepItem[];
  indirect: IndirectState;
  gananciaPct: number;
  impuestosPct: number;
  applyGanancia: boolean;
  applyImpuestos: boolean;
  gananciaMode: 'markup' | 'margen';
  mo: MoState;
  quantity: number;
  quantityEnabled: boolean;
};

const STORAGE_KEY = 'esferas-calculator-v1';

const defaultState: EsferasState = {
  productSelection: 'colores6',
  direct: [
    { id: 'producto', label: 'Producto', enabled: true, price: 24, quantity: 12 },
    { id: 'vinil', label: 'Vinil adhesivo', enabled: false, price: 8, quantity: 100 },
    { id: 'papel', label: 'Papel fotográfico', enabled: false, price: 10, quantity: 100 },
    { id: 'nieve', label: 'Nieve artificial', enabled: false, price: 6, quantity: 50 },
    { id: 'extra', label: 'Rellenos extra', enabled: false, price: 8, quantity: 100 },
    { id: 'cinta', label: 'Cinta/Lazo', enabled: false, price: 3.5, quantity: 45 },
    { id: 'silicon', label: 'Silicón en barra', enabled: false, price: 5, quantity: 50 },
  ],
  depreciation: [
    { id: 'impresora', label: 'Impresora', enabled: false, price: 240, mode: 'monthly', unitsPerMonth: 100 },
    { id: 'plancha', label: 'Plancha térmica', enabled: false, price: 400, mode: 'monthly', unitsPerMonth: 100 },
    { id: 'pc', label: 'Computadora', enabled: false, price: 350, mode: 'monthly', unitsPerMonth: 100 },
    { id: 'plotter', label: 'Plotter de corte', enabled: false, price: 400, mode: 'monthly', unitsPerMonth: 100 },
    { id: 'cuchilla', label: 'Cuchilla de corte', enabled: false, price: 30, mode: 'life', lifeUnits: 500 },
    { id: 'tapete', label: 'Tapete de corte', enabled: false, price: 12, mode: 'life', lifeUnits: 500 },
    { id: 'pistola', label: 'Pistola de silicón', enabled: false, price: 18, mode: 'monthly', unitsPerMonth: 100 },
  ],
  indirect: {
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
  gananciaPct: 40,
  impuestosPct: 16,
  applyGanancia: true,
  applyImpuestos: true,
  gananciaMode: 'margen',
  mo: {
    enabled: false,
    salary: 400,
    hoursPerMonth: 176,
    setupMinutes: 5,
    runMinutesPerUnit: 2,
    unitsPerBatch: 1,
  },
  quantity: 1,
  quantityEnabled: false,
};

function reviveState(raw: any): EsferasState {
  if (!raw || typeof raw !== 'object') return defaultState;
  const num = (v: any, fb: number) => {
    const n = parseMoney(v);
    return isFinite(n) ? n : fb;
  };
  const reviveDirect = Array.isArray(raw.direct)
    ? raw.direct.map((d: any): DirectItem => ({
        id: String(d.id ?? 'item'),
        label: String(d.label ?? 'Item'),
        enabled: Boolean(d.enabled),
        price: num(d.price, 0),
        quantity: clampNumber(num(d.quantity, 1), 0.0001, 1e9),
      }))
    : defaultState.direct;
  const reviveDep = Array.isArray(raw.depreciation)
    ? raw.depreciation.map((d: any): DepItem => ({
        id: String(d.id ?? 'dep'),
        label: String(d.label ?? 'Equipo'),
        enabled: Boolean(d.enabled),
        price: num(d.price, 0),
        mode: d.mode === 'life' ? 'life' : 'monthly',
        unitsPerMonth: clampNumber(num(d.unitsPerMonth, 100), 1, 1e9),
        lifeUnits: clampNumber(num(d.lifeUnits, 500), 1, 1e9),
      }))
    : defaultState.depreciation;
  const ind = raw.indirect ?? {};
  const moRaw = raw.mo ?? {};
  return {
    productSelection: String(raw.productSelection ?? defaultState.productSelection),
    direct: reviveDirect,
    depreciation: reviveDep,
    indirect: {
      enabled: Boolean(ind.enabled ?? defaultState.indirect.enabled),
      monthly: {
        alquiler: num(ind.monthly?.alquiler, defaultState.indirect.monthly.alquiler),
        internet: num(ind.monthly?.internet, defaultState.indirect.monthly.internet),
        suscripciones: num(ind.monthly?.suscripciones, defaultState.indirect.monthly.suscripciones),
        transporte: num(ind.monthly?.transporte, defaultState.indirect.monthly.transporte),
        electricidad: num(ind.monthly?.electricidad, defaultState.indirect.monthly.electricidad),
        publicidad: num(ind.monthly?.publicidad, defaultState.indirect.monthly.publicidad),
        otros: num(ind.monthly?.otros, defaultState.indirect.monthly.otros),
      },
      unitsPerMonth: clampNumber(num(ind.unitsPerMonth, defaultState.indirect.unitsPerMonth), 1, 1e9),
    },
    gananciaPct: clampNumber(num(raw.gananciaPct, defaultState.gananciaPct), 0, 1000),
    impuestosPct: clampNumber(num(raw.impuestosPct, defaultState.impuestosPct), 0, 1000),
    applyGanancia: Boolean(raw.applyGanancia ?? defaultState.applyGanancia),
    applyImpuestos: Boolean(raw.applyImpuestos ?? defaultState.applyImpuestos),
    gananciaMode: raw.gananciaMode === 'markup' ? 'markup' : 'margen',
    mo: {
      enabled: Boolean(moRaw.enabled ?? defaultState.mo.enabled),
      salary: num(moRaw.salary, defaultState.mo.salary),
      hoursPerMonth: clampNumber(num(moRaw.hoursPerMonth, defaultState.mo.hoursPerMonth), 0, 1e6),
      setupMinutes: clampNumber(num(moRaw.setupMinutes, defaultState.mo.setupMinutes), 0, 1e6),
      runMinutesPerUnit: clampNumber(num(moRaw.runMinutesPerUnit, defaultState.mo.runMinutesPerUnit), 0, 1e6),
      unitsPerBatch: clampNumber(num(moRaw.unitsPerBatch, defaultState.mo.unitsPerBatch), 1, 1e6),
    },
    quantity: clampNumber(num(raw.quantity, defaultState.quantity), 1, 1e6),
    quantityEnabled: Boolean(raw.quantityEnabled ?? defaultState.quantityEnabled),
  };
}

export function useEsferasCalculator() {
  const [state, setState] = useState<EsferasState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? reviveState(JSON.parse(raw)) : defaultState;
    } catch (e) {
      return defaultState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore write errors
    }
  }, [state]);

  const totals = useMemo(() => {
    const directPerUnit = state.direct.reduce((sum, item) => {
      if (!item.enabled) return sum;
      const qty = clampNumber(item.quantity, 0.0001, 1e9);
      return sum + item.price / qty;
    }, 0);

    const depreciationPerUnit = state.depreciation.reduce((sum, item) => {
      if (!item.enabled) return sum;
      if (item.mode === 'life') {
        const life = clampNumber(item.lifeUnits ?? 0, 1, 1e9);
        return sum + item.price / life;
      }
      const units = clampNumber(item.unitsPerMonth ?? 100, 1, 1e9);
      const perMonth = item.price / 24;
      return sum + perMonth / units;
    }, 0);

    const indirectBase = (() => {
      const monthly = state.indirect.monthly;
      const monthlyTotal =
        monthly.alquiler +
        monthly.internet +
        monthly.suscripciones +
        monthly.transporte +
        monthly.electricidad +
        monthly.publicidad +
        monthly.otros;
      const units = clampNumber(state.indirect.unitsPerMonth, 1, 1e9);
      return monthlyTotal / units;
    })();
    const indirectApplied = state.indirect.enabled ? indirectBase : 0;

    const moBase = (() => {
      const salary = clampNumber(state.mo.salary, 0, 1e9);
      const hours = clampNumber(state.mo.hoursPerMonth, 0, 1e6);
      const setup = clampNumber(state.mo.setupMinutes, 0, 1e6);
      const run = clampNumber(state.mo.runMinutesPerUnit, 0, 1e6);
      const units = clampNumber(state.mo.unitsPerBatch, 1, 1e6);
      const costPerMinute = hours > 0 ? salary / (hours * 60) : 0;
      const totalMinutes = setup + run * units;
      return units > 0 ? (totalMinutes * costPerMinute) / units : 0;
    })();
    const moApplied = state.mo.enabled ? moBase : 0;

    const subNoGI = directPerUnit + depreciationPerUnit + indirectApplied + moApplied;

    const ganPct = clampNumber(state.gananciaPct, 0, 1000);
    const impPct = clampNumber(state.impuestosPct, 0, 1000);
    const gananciaVal = state.applyGanancia
      ? state.gananciaMode === 'margen'
        ? subNoGI * (ganPct / Math.max(1, 100 - ganPct))
        : subNoGI * (ganPct / 100)
      : 0;
    const impuestosVal = state.applyImpuestos ? (subNoGI + gananciaVal) * (impPct / 100) : 0;
    const perUnitTotal = subNoGI + gananciaVal + impuestosVal;

    const qty = clampNumber(state.quantity, 1, 1e6);
    const multiplier = state.quantityEnabled ? qty : 1;

    return {
      perUnit: {
        direct: directPerUnit,
        depreciation: depreciationPerUnit,
        indirectBase,
        indirectApplied,
        moBase,
        moApplied,
        base: subNoGI,
        ganancia: gananciaVal,
        impuestos: impuestosVal,
        total: perUnitTotal,
      },
      quantity: multiplier,
      quantityEnabled: state.quantityEnabled,
      subtotalSinGI: subNoGI * multiplier,
      gananciaTotal: gananciaVal * multiplier,
      impuestosTotal: impuestosVal * multiplier,
      total: perUnitTotal * multiplier,
    };
  }, [state]);

  const updateDirect = (id: string, patch: Partial<DirectItem>) => {
    setState((prev) => ({
      ...prev,
      direct: prev.direct.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  };

  const updateDep = (id: string, patch: Partial<DepItem>) => {
    setState((prev) => ({
      ...prev,
      depreciation: prev.depreciation.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  };

  const updateIndirectMonthly = (key: keyof IndirectState['monthly'], value: number) => {
    setState((prev) => ({
      ...prev,
      indirect: {
        ...prev.indirect,
        monthly: { ...prev.indirect.monthly, [key]: value },
      },
    }));
  };

  const setIndirectUnits = (value: number) =>
    setState((prev) => ({ ...prev, indirect: { ...prev.indirect, unitsPerMonth: value } }));

  const setIndirectEnabled = (value: boolean) =>
    setState((prev) => ({ ...prev, indirect: { ...prev.indirect, enabled: value } }));

  const updateMo = (patch: Partial<MoState>) =>
    setState((prev) => ({ ...prev, mo: { ...prev.mo, ...patch } }));

  const setGananciaPct = (value: number) => setState((prev) => ({ ...prev, gananciaPct: value }));
  const setImpuestosPct = (value: number) => setState((prev) => ({ ...prev, impuestosPct: value }));
  const setGananciaMode = (mode: 'markup' | 'margen') => setState((prev) => ({ ...prev, gananciaMode: mode }));
  const setApplyGanancia = (value: boolean) => setState((prev) => ({ ...prev, applyGanancia: value }));
  const setApplyImpuestos = (value: boolean) => setState((prev) => ({ ...prev, applyImpuestos: value }));
  const setQuantity = (value: number) => setState((prev) => ({ ...prev, quantity: value }));
  const setQuantityEnabled = (value: boolean) => setState((prev) => ({ ...prev, quantityEnabled: value }));
  const setProductSelection = (value: string) => setState((prev) => ({ ...prev, productSelection: value }));

  const reset = () => setState(defaultState);

  return {
    state,
    totals,
    updateDirect,
    updateDep,
    updateIndirectMonthly,
    setIndirectUnits,
    setIndirectEnabled,
    updateMo,
    setGananciaPct,
    setImpuestosPct,
    setGananciaMode,
    setApplyGanancia,
    setApplyImpuestos,
    setQuantity,
    setQuantityEnabled,
    setProductSelection,
    reset,
  };
}
