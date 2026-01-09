import { useEffect, useMemo, useState } from 'react';
import { clampNumber, parseMoney } from '../lib/money';

type DirectId = 'caja' | 'bolsa' | 'relleno' | 'etiqueta' | 'tarjeta' | 'cinta';

type DirectItem = {
  id: DirectId;
  label: string;
  enabled: boolean;
  price: number;
  quantity: number;
};

type DepItem = {
  id: 'impresora';
  label: string;
  enabled: boolean;
  price: number;
  unitsPerMonth: number;
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

type EmpaquesState = {
  direct: DirectItem[];
  depreciation: DepItem[];
  indirect: IndirectState;
  mo: MoState;
  gananciaPct: number;
  impuestosPct: number;
  applyGanancia: boolean;
  applyImpuestos: boolean;
  quantity: number;
};

const STORAGE_KEY = 'empaques-calculator-v1';

const defaultState: EmpaquesState = {
  direct: [
    { id: 'caja', label: 'Caja', enabled: true, price: 20, quantity: 50 },
    { id: 'bolsa', label: 'Bolsa', enabled: true, price: 12, quantity: 100 },
    { id: 'relleno', label: 'Relleno / Protección', enabled: true, price: 5, quantity: 1 },
    { id: 'etiqueta', label: 'Etiqueta', enabled: true, price: 8, quantity: 100 },
    { id: 'tarjeta', label: 'Tarjeta de agradecimiento', enabled: true, price: 6, quantity: 50 },
    { id: 'cinta', label: 'Cinta adhesiva', enabled: true, price: 2, quantity: 1 },
  ],
  depreciation: [{ id: 'impresora', label: 'Impresora de etiquetas', enabled: true, price: 200, unitsPerMonth: 100 }],
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
  mo: {
    enabled: false,
    salary: 400,
    hoursPerMonth: 176,
    setupMinutes: 5,
    runMinutesPerUnit: 2,
    unitsPerBatch: 1,
  },
  gananciaPct: 30,
  impuestosPct: 16,
  applyGanancia: true,
  applyImpuestos: true,
  quantity: 1,
};

function reviveState(raw: any): EmpaquesState {
  if (!raw || typeof raw !== 'object') return defaultState;
  const num = (v: any, fb: number) => {
    const n = parseMoney(v);
    return isFinite(n) ? n : fb;
  };

  const reviveDirect = Array.isArray(raw.direct)
    ? raw.direct.map((d: any): DirectItem => ({
        id: (d.id as DirectId) ?? 'caja',
        label: String(d.label ?? 'Item'),
        enabled: Boolean(d.enabled),
        price: num(d.price, 0),
        quantity: clampNumber(num(d.quantity, 0), 0, 1e9),
      }))
    : defaultState.direct;

  const reviveDep = Array.isArray(raw.depreciation)
    ? raw.depreciation.map((d: any): DepItem => ({
        id: 'impresora',
        label: String(d.label ?? 'Equipo'),
        enabled: Boolean(d.enabled),
        price: num(d.price, 0),
        unitsPerMonth: clampNumber(num(d.unitsPerMonth, 100), 1, 1e9),
      }))
    : defaultState.depreciation;

  const revIndirect: IndirectState = {
    enabled: Boolean(raw.indirect?.enabled ?? defaultState.indirect.enabled),
    monthly: {
      alquiler: num(raw.indirect?.monthly?.alquiler, defaultState.indirect.monthly.alquiler),
      internet: num(raw.indirect?.monthly?.internet, defaultState.indirect.monthly.internet),
      suscripciones: num(raw.indirect?.monthly?.suscripciones, defaultState.indirect.monthly.suscripciones),
      transporte: num(raw.indirect?.monthly?.transporte, defaultState.indirect.monthly.transporte),
      electricidad: num(raw.indirect?.monthly?.electricidad, defaultState.indirect.monthly.electricidad),
      publicidad: num(raw.indirect?.monthly?.publicidad, defaultState.indirect.monthly.publicidad),
      otros: num(raw.indirect?.monthly?.otros, defaultState.indirect.monthly.otros),
    },
    unitsPerMonth: clampNumber(num(raw.indirect?.unitsPerMonth, defaultState.indirect.unitsPerMonth), 1, 1e9),
  };

  const revMo: MoState = {
    enabled: Boolean(raw.mo?.enabled ?? defaultState.mo.enabled),
    salary: num(raw.mo?.salary, defaultState.mo.salary),
    hoursPerMonth: clampNumber(num(raw.mo?.hoursPerMonth, defaultState.mo.hoursPerMonth), 0, 1e6),
    setupMinutes: clampNumber(num(raw.mo?.setupMinutes, defaultState.mo.setupMinutes), 0, 1e6),
    runMinutesPerUnit: clampNumber(num(raw.mo?.runMinutesPerUnit, defaultState.mo.runMinutesPerUnit), 0, 1e6),
    unitsPerBatch: clampNumber(num(raw.mo?.unitsPerBatch, defaultState.mo.unitsPerBatch), 1, 1e6),
  };

  return {
    direct: reviveDirect,
    depreciation: reviveDep,
    indirect: revIndirect,
    mo: revMo,
    gananciaPct: clampNumber(num(raw.gananciaPct, defaultState.gananciaPct), 0, 1000),
    impuestosPct: clampNumber(num(raw.impuestosPct, defaultState.impuestosPct), 0, 1000),
    applyGanancia: Boolean(raw.applyGanancia ?? defaultState.applyGanancia),
    applyImpuestos: Boolean(raw.applyImpuestos ?? defaultState.applyImpuestos),
    quantity: clampNumber(num(raw.quantity, defaultState.quantity), 1, 1e6),
  };
}

export function useEmpaquesCalculator() {
  const [state, setState] = useState<EmpaquesState>(() => {
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
      // ignore storage errors
    }
  }, [state]);

  const totals = useMemo(() => {
    const directPerUnit = state.direct.reduce((sum, item) => {
      if (!item.enabled) return sum;
      const price = clampNumber(item.price, 0);
      const qty = clampNumber(item.quantity, 0);
      const unit = qty > 0 ? price / qty : 0;
      return sum + unit;
    }, 0);

    const depPerUnit = state.depreciation.reduce((sum, item) => {
      if (!item.enabled) return sum;
      const perMonth = item.price / 24;
      const perUnit = perMonth / Math.max(1, item.unitsPerMonth);
      return sum + perUnit;
    }, 0);

    const indirectMonthly =
      state.indirect.monthly.alquiler +
      state.indirect.monthly.internet +
      state.indirect.monthly.suscripciones +
      state.indirect.monthly.transporte +
      state.indirect.monthly.electricidad +
      state.indirect.monthly.publicidad +
      state.indirect.monthly.otros;
    const indirectPerUnit = state.indirect.enabled
      ? indirectMonthly / Math.max(1, state.indirect.unitsPerMonth)
      : 0;

    const moPerUnit = state.mo.enabled
      ? (() => {
          const costPerHour = state.mo.hoursPerMonth > 0 ? state.mo.salary / state.mo.hoursPerMonth : 0;
          const totalMinutes = state.mo.setupMinutes + state.mo.runMinutesPerUnit * state.mo.unitsPerBatch;
          return state.mo.unitsPerBatch > 0 ? (costPerHour * (totalMinutes / 60)) / state.mo.unitsPerBatch : 0;
        })()
      : 0;

    const subtotalSinGI = directPerUnit + depPerUnit + indirectPerUnit;
    const subtotal = subtotalSinGI + moPerUnit;

    const gananciaVal = state.applyGanancia ? subtotal * (state.gananciaPct / 100) : 0;
    const impuestosVal = state.applyImpuestos ? (subtotal + gananciaVal) * (state.impuestosPct / 100) : 0;

    const perUnitTotal = subtotal + gananciaVal + impuestosVal;
    const quantity = clampNumber(state.quantity, 1, 1e6);

    return {
      perUnit: {
        direct: directPerUnit,
        depreciation: depPerUnit,
        indirect: indirectPerUnit,
        mo: moPerUnit,
        subtotalSinGI,
        subtotal,
        ganancia: gananciaVal,
        impuestos: impuestosVal,
        total: perUnitTotal,
      },
      quantity,
      subtotalSinGI: subtotalSinGI * quantity,
      subtotal: subtotal * quantity,
      gananciaTotal: gananciaVal * quantity,
      impuestosTotal: impuestosVal * quantity,
      total: perUnitTotal * quantity,
    };
  }, [state]);

  const updateDirect = (id: DirectId, patch: Partial<DirectItem>) => {
    setState((prev) => ({
      ...prev,
      direct: prev.direct.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  };

  const updateDepreciation = (patch: Partial<DepItem>) => {
    setState((prev) => ({
      ...prev,
      depreciation: prev.depreciation.map((it) => ({ ...it, ...patch })),
    }));
  };

  const setIndirect = (patch: Partial<IndirectState>) =>
    setState((prev) => ({ ...prev, indirect: { ...prev.indirect, ...patch } }));

  const setIndirectMonthly = (key: keyof IndirectState['monthly'], value: number) =>
    setState((prev) => ({
      ...prev,
      indirect: { ...prev.indirect, monthly: { ...prev.indirect.monthly, [key]: value } },
    }));

  const setMo = (patch: Partial<MoState>) => setState((prev) => ({ ...prev, mo: { ...prev.mo, ...patch } }));
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
    updateDepreciation,
    setIndirect,
    setIndirectMonthly,
    setMo,
    setGananciaPct,
    setImpuestosPct,
    setApplyGanancia,
    setApplyImpuestos,
    setQuantity,
    reset,
  };
}
