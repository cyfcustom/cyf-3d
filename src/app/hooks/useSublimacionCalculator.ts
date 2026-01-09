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
  unitsPerMonth: number; // producidas al mes
};

type MoSettings = {
  enabled: boolean;
  setupMinutes: number;
  runMinutesPerUnit: number;
  hourlyRate: number;
};

type SublimState = {
  direct: DirectItem[];
  depreciation: DepItem[];
  gananciaPct: number;
  impuestosPct: number;
  applyGanancia: boolean;
  applyImpuestos: boolean;
  mo: MoSettings;
  quantity: number;
};

const STORAGE_KEY = 'sublimacion-calculator-v1';

const defaultState: SublimState = {
  direct: [
    { id: 'producto', label: 'Producto base', enabled: true, price: 90, quantity: 36 },
    { id: 'papel', label: 'Papel sublimación', enabled: true, price: 10, quantity: 100 },
    { id: 'tinta', label: 'Tinta', enabled: true, price: 40, quantity: 300 },
    { id: 'cinta', label: 'Cinta térmica', enabled: true, price: 3, quantity: 100 },
    { id: 'empaque', label: 'Empaque', enabled: true, price: 5, quantity: 50 },
  ],
  depreciation: [
    { id: 'impresora', label: 'Impresora', enabled: true, price: 240, unitsPerMonth: 100 },
    { id: 'plancha', label: 'Plancha térmica', enabled: true, price: 400, unitsPerMonth: 100 },
    { id: 'pc', label: 'PC', enabled: true, price: 350, unitsPerMonth: 100 },
    { id: 'prensa', label: 'Prensa/plancha extra', enabled: false, price: 180, unitsPerMonth: 100 },
    { id: 'resistencia', label: 'Resistencia', enabled: false, price: 50, unitsPerMonth: 100 },
  ],
  gananciaPct: 40,
  impuestosPct: 16,
  applyGanancia: true,
  applyImpuestos: true,
  mo: {
    enabled: false,
    setupMinutes: 10,
    runMinutesPerUnit: 1.5,
    hourlyRate: 8,
  },
  quantity: 1,
};

function reviveState(raw: any): SublimState {
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
        quantity: clampNumber(num(d.quantity, 1), 1, 1e6),
      }))
    : defaultState.direct;
  const reviveDep = Array.isArray(raw.depreciation)
    ? raw.depreciation.map((d: any): DepItem => ({
        id: String(d.id ?? 'dep'),
        label: String(d.label ?? 'Equipo'),
        enabled: Boolean(d.enabled),
        price: num(d.price, 0),
        unitsPerMonth: clampNumber(num(d.unitsPerMonth, 100), 1, 1e6),
      }))
    : defaultState.depreciation;

  const moRaw = raw.mo ?? {};
  const mo: MoSettings = {
    enabled: Boolean(moRaw.enabled),
    setupMinutes: clampNumber(num(moRaw.setupMinutes, defaultState.mo.setupMinutes), 0, 1e4),
    runMinutesPerUnit: clampNumber(num(moRaw.runMinutesPerUnit, defaultState.mo.runMinutesPerUnit), 0, 1e4),
    hourlyRate: clampNumber(num(moRaw.hourlyRate, defaultState.mo.hourlyRate), 0, 1e6),
  };

  return {
    direct: reviveDirect,
    depreciation: reviveDep,
    gananciaPct: clampNumber(num(raw.gananciaPct, defaultState.gananciaPct), 0, 1000),
    impuestosPct: clampNumber(num(raw.impuestosPct, defaultState.impuestosPct), 0, 1000),
    applyGanancia: Boolean(raw.applyGanancia ?? defaultState.applyGanancia),
    applyImpuestos: Boolean(raw.applyImpuestos ?? defaultState.applyImpuestos),
    mo,
    quantity: clampNumber(num(raw.quantity, defaultState.quantity), 1, 1e6),
  };
}

export function useSublimacionCalculator() {
  const [state, setState] = useState<SublimState>(() => {
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
      // ignore
    }
  }, [state]);

  const totals = useMemo(() => {
    const directPerUnit = state.direct.reduce((sum, item) => {
      if (!item.enabled || !item.price || !item.quantity) return sum;
      return sum + item.price / item.quantity;
    }, 0);

    const depPerUnit = state.depreciation.reduce((sum, item) => {
      if (!item.enabled || !item.price || !item.unitsPerMonth) return sum;
      const monthly = item.price / 24; // 24 meses
      const perUnit = monthly / item.unitsPerMonth;
      return sum + perUnit;
    }, 0);

    const moPerUnit = state.mo.enabled
      ? ((clampNumber(state.mo.setupMinutes, 0) + clampNumber(state.mo.runMinutesPerUnit, 0)) / 60) *
        clampNumber(state.mo.hourlyRate, 0)
      : 0;

    const basePerUnit = directPerUnit + depPerUnit + moPerUnit;
    const q = clampNumber(state.quantity, 1, 1e6);

    const gananciaVal = state.applyGanancia ? basePerUnit * q * (state.gananciaPct / 100) : 0;
    const impuestosVal = state.applyImpuestos ? (basePerUnit * q + gananciaVal) * (state.impuestosPct / 100) : 0;

    const total = basePerUnit * q + gananciaVal + impuestosVal;

    return {
      perUnit: {
        direct: directPerUnit,
        depreciation: depPerUnit,
        mo: moPerUnit,
        base: basePerUnit,
        ganancia: state.applyGanancia ? basePerUnit * (state.gananciaPct / 100) : 0,
        impuestos: state.applyImpuestos ? (basePerUnit + (state.applyGanancia ? basePerUnit * (state.gananciaPct / 100) : 0)) * (state.impuestosPct / 100) : 0,
        total: basePerUnit +
          (state.applyGanancia ? basePerUnit * (state.gananciaPct / 100) : 0) +
          (state.applyImpuestos ? (basePerUnit + (state.applyGanancia ? basePerUnit * (state.gananciaPct / 100) : 0)) * (state.impuestosPct / 100) : 0),
      },
      quantity: q,
      subtotalSinGI: basePerUnit * q,
      gananciaTotal: gananciaVal,
      impuestosTotal: impuestosVal,
      total,
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

  const updateMo = (patch: Partial<MoSettings>) => {
    setState((prev) => ({ ...prev, mo: { ...prev.mo, ...patch } }));
  };

  const setGananciaPct = (value: number) => setState((prev) => ({ ...prev, gananciaPct: value }));
  const setImpuestosPct = (value: number) => setState((prev) => ({ ...prev, impuestosPct: value }));
  const setApplyGanancia = (value: boolean) => setState((prev) => ({ ...prev, applyGanancia: value }));
  const setApplyImpuestos = (value: boolean) => setState((prev) => ({ ...prev, applyImpuestos: value }));
  const setQuantity = (value: number) => setState((prev) => ({ ...prev, quantity: value }));

  const reset = () => setState(defaultState);

  return {
    state,
    totals,
    updateDirect,
    updateDep,
    updateMo,
    setGananciaPct,
    setImpuestosPct,
    setApplyGanancia,
    setApplyImpuestos,
    setQuantity,
    reset,
  };
}
