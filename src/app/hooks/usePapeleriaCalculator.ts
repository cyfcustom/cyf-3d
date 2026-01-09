import { useEffect, useMemo, useState } from 'react';
import { clampNumber, parseMoney } from '../lib/money';

type DirectItem = {
  id: string;
  label: string;
  enabled: boolean;
  price: number;
  quantity: number;
};

type DepItem =
  | {
      id: string;
      label: string;
      enabled: boolean;
      mode: 'month';
      price: number;
      unitsPerMonth: number;
    }
  | {
      id: string;
      label: string;
      enabled: boolean;
      mode: 'life';
      price: number;
      lifeUnits: number;
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

type PapeleriaState = {
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

const STORAGE_KEY = 'papeleria-calculator-v1';

const defaultState: PapeleriaState = {
  direct: [
    { id: 'sustratoA', label: 'Sustrato A', enabled: false, price: 20, quantity: 50 },
    { id: 'sustratoB', label: 'Sustrato B', enabled: false, price: 0, quantity: 0 },
    { id: 'adhA', label: 'Adhesivo / montaje A', enabled: false, price: 3, quantity: 1 },
    { id: 'adhB', label: 'Adhesivo / montaje B', enabled: false, price: 0, quantity: 0 },
    { id: 'extra', label: 'Extra (shaker/acetato)', enabled: false, price: 0, quantity: 0 },
    { id: 'pack', label: 'Empaque', enabled: false, price: 5, quantity: 50 },
  ],
  depreciation: [
    { id: 'plotter', label: 'Plotter de corte', enabled: false, mode: 'month', price: 400, unitsPerMonth: 100 },
    { id: 'impresora', label: 'Impresora', enabled: false, mode: 'month', price: 240, unitsPerMonth: 100 },
    { id: 'guillotina', label: 'Guillotina', enabled: false, mode: 'month', price: 120, unitsPerMonth: 100 },
    { id: 'laminadora', label: 'Laminadora', enabled: false, mode: 'month', price: 150, unitsPerMonth: 100 },
    { id: 'pc', label: 'Computadora', enabled: false, mode: 'month', price: 350, unitsPerMonth: 100 },
    { id: 'cuchilla', label: 'Cuchilla', enabled: false, mode: 'life', price: 30, lifeUnits: 500 },
    { id: 'tapete', label: 'Tapete', enabled: false, mode: 'life', price: 12, lifeUnits: 100 },
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
  mo: {
    enabled: false,
    salary: 400,
    hoursPerMonth: 176,
    setupMinutes: 5,
    runMinutesPerUnit: 3,
    unitsPerBatch: 1,
  },
  gananciaPct: 40,
  impuestosPct: 16,
  applyGanancia: false,
  applyImpuestos: false,
  quantity: 1,
};

function reviveState(raw: any): PapeleriaState {
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
        quantity: clampNumber(num(d.quantity, 0), 0, 1e9),
      }))
    : defaultState.direct;

  const reviveDep = Array.isArray(raw.depreciation)
    ? raw.depreciation.map((d: any): DepItem => {
        const mode = d.mode === 'life' ? 'life' : 'month';
        if (mode === 'life') {
          return {
            id: String(d.id ?? 'dep'),
            label: String(d.label ?? 'Equipo'),
            enabled: Boolean(d.enabled),
            mode,
            price: num(d.price, 0),
            lifeUnits: clampNumber(num(d.lifeUnits, 1), 1, 1e9),
          } as DepItem;
        }
        return {
          id: String(d.id ?? 'dep'),
          label: String(d.label ?? 'Equipo'),
          enabled: Boolean(d.enabled),
          mode,
          price: num(d.price, 0),
          unitsPerMonth: clampNumber(num(d.unitsPerMonth, 100), 1, 1e9),
        } as DepItem;
      })
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

export function usePapeleriaCalculator() {
  const [state, setState] = useState<PapeleriaState>(() => {
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
      const price = clampNumber(item.price, 0);
      const qty = clampNumber(item.quantity, 0);
      const unit = qty > 0 ? price / qty : 0;
      return sum + unit;
    }, 0);

    const depPerUnit = state.depreciation.reduce((sum, item) => {
      if (!item.enabled) return sum;
      const price = clampNumber(item.price, 0);
      if (item.mode === 'life') {
        const perUse = item.lifeUnits > 0 ? price / item.lifeUnits : 0;
        return sum + perUse;
      }
      const perMonth = price / 24;
      const perUnit = perMonth / Math.max(1, item.unitsPerMonth);
      return sum + perUnit;
    }, 0);

    const indirectMonthlyTotal =
      state.indirect.monthly.alquiler +
      state.indirect.monthly.internet +
      state.indirect.monthly.suscripciones +
      state.indirect.monthly.transporte +
      state.indirect.monthly.electricidad +
      state.indirect.monthly.publicidad +
      state.indirect.monthly.otros;
    const indirectPerUnit = state.indirect.enabled
      ? indirectMonthlyTotal / Math.max(1, state.indirect.unitsPerMonth)
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

  const updateDirect = (id: string, patch: Partial<DirectItem>) => {
    setState((prev) => ({
      ...prev,
      direct: prev.direct.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  };

  const updateDepreciation = (id: string, patch: Partial<DepItem>) => {
    setState((prev) => ({
      ...prev,
      depreciation: prev.depreciation.map((it) => {
        if (it.id !== id) return it;
        if (it.mode === 'life') {
          const lifePatch = patch as Partial<Extract<DepItem, { mode: 'life' }>>;
          return {
            ...it,
            price: lifePatch.price ?? it.price,
            enabled: lifePatch.enabled ?? it.enabled,
            label: lifePatch.label ?? it.label,
            mode: 'life',
            lifeUnits: lifePatch.lifeUnits ?? it.lifeUnits,
          };
        } else {
          const monthPatch = patch as Partial<Extract<DepItem, { mode: 'month' }>>;
          return {
            ...it,
            price: monthPatch.price ?? it.price,
            enabled: monthPatch.enabled ?? it.enabled,
            label: monthPatch.label ?? it.label,
            mode: 'month',
            unitsPerMonth: monthPatch.unitsPerMonth ?? it.unitsPerMonth,
          };
        }
      }),
    }));
  };

  const setIndirect = (patch: Partial<IndirectState>) =>
    setState((prev) => ({
      ...prev,
      indirect: { ...prev.indirect, ...patch },
    }));

  const setIndirectMonthly = (key: keyof IndirectState['monthly'], value: number) =>
    setState((prev) => ({
      ...prev,
      indirect: {
        ...prev.indirect,
        monthly: { ...prev.indirect.monthly, [key]: value },
      },
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
