import { useEffect, useMemo, useState } from 'react';
import { clampNumber, parseMoney } from '../lib/money';

type DirectItem = {
  id: string;
  label: string;
  enabled: boolean;
  price: number; // total pack price
  quantity: number; // units in pack
};

type DepItem = {
  id: string;
  label: string;
  enabled: boolean;
  price: number; // asset cost
  lifeUnits: number; // uses or (months * unitsPerMonth)
};

type VinilState = {
  direct: DirectItem[];
  depreciation: DepItem[];
  extrasPerUnit: number;
  mermaPct: number;
  gananciaPct: number;
  impuestosPct: number;
  applyGanancia: boolean;
  applyImpuestos: boolean;
  quantity: number;
};

const STORAGE_KEY = 'vinil-calculator-v1';

const defaultState: VinilState = {
  direct: [
    { id: 'base', label: 'Producto base', enabled: true, price: 90, quantity: 36 },
    { id: 'papel', label: 'Papel', enabled: true, price: 10, quantity: 100 },
    { id: 'tinta', label: 'Tinta', enabled: true, price: 40, quantity: 300 },
    { id: 'cinta', label: 'Cinta térmica', enabled: true, price: 3, quantity: 100 },
    { id: 'empaque', label: 'Empaque', enabled: true, price: 5, quantity: 50 },
  ],
  depreciation: [
    { id: 'impresora', label: 'Impresora', enabled: true, price: 240, lifeUnits: 2400 },
    { id: 'plancha', label: 'Plancha térmica', enabled: true, price: 400, lifeUnits: 2400 },
    { id: 'pc', label: 'PC', enabled: true, price: 350, lifeUnits: 2400 },
    { id: 'tapete', label: 'Tapete de corte', enabled: false, price: 12, lifeUnits: 500 },
  ],
  extrasPerUnit: 0,
  mermaPct: 5,
  gananciaPct: 40,
  impuestosPct: 16,
  applyGanancia: true,
  applyImpuestos: true,
  quantity: 1,
};

function reviveState(raw: any): VinilState {
  if (!raw || typeof raw !== 'object') return defaultState;
  const safeNumber = (v: any, fallback: number) => {
    const n = parseMoney(v);
    return isFinite(n) ? n : fallback;
  };
  const reviveDirect = Array.isArray(raw.direct)
    ? raw.direct.map((d: any): DirectItem => ({
        id: String(d.id ?? 'item'),
        label: String(d.label ?? 'Item'),
        enabled: Boolean(d.enabled),
        price: safeNumber(d.price, 0),
        quantity: clampNumber(safeNumber(d.quantity, 1), 1, 1e6),
      }))
    : defaultState.direct;
  const reviveDep = Array.isArray(raw.depreciation)
    ? raw.depreciation.map((d: any): DepItem => ({
        id: String(d.id ?? 'dep'),
        label: String(d.label ?? 'Equipo'),
        enabled: Boolean(d.enabled),
        price: safeNumber(d.price, 0),
        lifeUnits: clampNumber(safeNumber(d.lifeUnits, 1), 1, 1e7),
      }))
    : defaultState.depreciation;

  return {
    direct: reviveDirect,
    depreciation: reviveDep,
    extrasPerUnit: safeNumber(raw.extrasPerUnit, defaultState.extrasPerUnit),
    mermaPct: clampNumber(safeNumber(raw.mermaPct, defaultState.mermaPct), 0, 100),
    gananciaPct: clampNumber(safeNumber(raw.gananciaPct, defaultState.gananciaPct), 0, 1000),
    impuestosPct: clampNumber(safeNumber(raw.impuestosPct, defaultState.impuestosPct), 0, 1000),
    applyGanancia: Boolean(raw.applyGanancia ?? defaultState.applyGanancia),
    applyImpuestos: Boolean(raw.applyImpuestos ?? defaultState.applyImpuestos),
    quantity: clampNumber(safeNumber(raw.quantity, defaultState.quantity), 1, 1e6),
  };
}

export function useVinilCalculator() {
  const [state, setState] = useState<VinilState>(() => {
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
      if (!item.price || !item.quantity) return sum;
      return sum + item.price / item.quantity;
    }, 0);

    const depPerUnit = state.depreciation.reduce((sum, item) => {
      if (!item.enabled) return sum;
      if (!item.price || !item.lifeUnits) return sum;
      return sum + item.price / item.lifeUnits;
    }, 0);

    const extrasPerUnit = clampNumber(state.extrasPerUnit, 0, 1e9);

    const basePerUnit = directPerUnit + depPerUnit + extrasPerUnit;
    const mermaFactor = 1 + clampNumber(state.mermaPct, 0, 100) / 100;
    const perUnitAfterMerma = basePerUnit * mermaFactor;

    const gananciaVal = state.applyGanancia
      ? perUnitAfterMerma * (clampNumber(state.gananciaPct, 0, 1000) / 100)
      : 0;
    const impuestosVal = state.applyImpuestos
      ? (perUnitAfterMerma + gananciaVal) * (clampNumber(state.impuestosPct, 0, 1000) / 100)
      : 0;

    const perUnitTotal = perUnitAfterMerma + gananciaVal + impuestosVal;
    const q = clampNumber(state.quantity, 1, 1e6);
    return {
      perUnit: {
        direct: directPerUnit,
        depreciation: depPerUnit,
        extras: extrasPerUnit,
        base: basePerUnit,
        afterMerma: perUnitAfterMerma,
        ganancia: gananciaVal,
        impuestos: impuestosVal,
        total: perUnitTotal,
      },
      quantity: q,
      total: perUnitTotal * q,
      subtotalSinGI: perUnitAfterMerma * q,
    };
  }, [state]);

  const updateDirect = (id: string, patch: Partial<DirectItem>) => {
    setState((prev) => ({
      ...prev,
      direct: prev.direct.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const updateDep = (id: string, patch: Partial<DepItem>) => {
    setState((prev) => ({
      ...prev,
      depreciation: prev.depreciation.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const setExtrasPerUnit = (value: number) => setState((prev) => ({ ...prev, extrasPerUnit: value }));
  const setMermaPct = (value: number) => setState((prev) => ({ ...prev, mermaPct: value }));
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
    setExtrasPerUnit,
    setMermaPct,
    setGananciaPct,
    setImpuestosPct,
    setApplyGanancia,
    setApplyImpuestos,
    setQuantity,
    reset,
  };
}
