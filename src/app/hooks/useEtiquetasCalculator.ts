import { useEffect, useMemo, useState } from 'react';
import { clampNumber, parseMoney } from '../lib/money';

type DirectItem = {
  id: 'producto' | 'tinta' | 'laminado';
  label: string;
  enabled: boolean;
  price: number;
  quantity: number;
};

type DepItem =
  | {
      id: 'cuchilla';
      label: string;
      enabled: boolean;
      mode: 'life';
      price: number;
      lifeUnits: number;
    }
  | {
      id: 'plotter' | 'impresora';
      label: string;
      enabled: boolean;
      mode: 'month';
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

type EtiquetasState = {
  direct: DirectItem[];
  productType: keyof typeof PRODUCT_PRESETS;
  depreciation: DepItem[];
  indirect: IndirectState;
  mo: MoState;
  gananciaPct: number;
  impuestosPct: number;
  applyGanancia: boolean;
  applyImpuestos: boolean;
  quantity: number;
};

const PRODUCT_PRESETS = {
  'Vinil imprimible': { quantity: 20, price: 13 },
  'Papel fotográfico adhesivo': { quantity: 50, price: 13 },
  'Etiqueta PVC': { quantity: 20, price: 15 },
  'Etiqueta BOPP': { quantity: 20, price: 16 },
  Holográfico: { quantity: 20, price: 18 },
  Transparente: { quantity: 20, price: 14 },
  Kraft: { quantity: 20, price: 12 },
  Otros: { quantity: 1, price: 2.5 },
} as const;

const STORAGE_KEY = 'etiquetas-calculator-v1';

const defaultState: EtiquetasState = {
  direct: [
    { id: 'producto', label: 'Producto base', enabled: true, price: 13, quantity: 20 },
    { id: 'tinta', label: 'Tinta', enabled: true, price: 30, quantity: 1000 },
    { id: 'laminado', label: 'Laminado en frío', enabled: false, price: 10, quantity: 20 },
  ],
  productType: 'Vinil imprimible',
  depreciation: [
    { id: 'cuchilla', label: 'Cuchilla', enabled: true, mode: 'life', price: 25, lifeUnits: 100 },
    { id: 'plotter', label: 'Plotter de corte', enabled: true, mode: 'month', price: 400, unitsPerMonth: 100 },
    { id: 'impresora', label: 'Impresora', enabled: true, mode: 'month', price: 240, unitsPerMonth: 100 },
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
    runMinutesPerUnit: 2,
    unitsPerBatch: 1,
  },
  gananciaPct: 40,
  impuestosPct: 16,
  applyGanancia: true,
  applyImpuestos: true,
  quantity: 1,
};

function reviveState(raw: any): EtiquetasState {
  if (!raw || typeof raw !== 'object') return defaultState;
  const num = (v: any, fb: number) => {
    const n = parseMoney(v);
    return isFinite(n) ? n : fb;
  };
  const reviveDirect = Array.isArray(raw.direct)
    ? raw.direct.map((d: any): DirectItem => ({
        id: (d.id as DirectItem['id']) ?? 'producto',
        label: String(d.label ?? 'Item'),
        enabled: Boolean(d.enabled),
        price: num(d.price, 0),
        quantity: clampNumber(num(d.quantity, 0), 0, 1e9),
      }))
    : defaultState.direct;

  const reviveDep = Array.isArray(raw.depreciation)
    ? raw.depreciation.map((d: any): DepItem => {
        const mode: DepItem['mode'] = d.mode === 'life' ? 'life' : 'month';
        if (mode === 'life') {
          return {
            id: 'cuchilla',
            label: String(d.label ?? 'Equipo'),
            enabled: Boolean(d.enabled),
            mode,
            price: num(d.price, 0),
            lifeUnits: clampNumber(num(d.lifeUnits, 1), 1, 1e9),
          };
        }
        return {
          id: d.id === 'plotter' ? 'plotter' : 'impresora',
          label: String(d.label ?? 'Equipo'),
          enabled: Boolean(d.enabled),
          mode,
          price: num(d.price, 0),
          unitsPerMonth: clampNumber(num(d.unitsPerMonth, 100), 1, 1e9),
        };
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

  const productType = (raw.productType as EtiquetasState['productType']) ?? defaultState.productType;

  return {
    direct: reviveDirect,
    productType: PRODUCT_PRESETS[productType] ? productType : defaultState.productType,
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

export function useEtiquetasCalculator() {
  const [state, setState] = useState<EtiquetasState>(() => {
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
      if (item.mode === 'life') {
        const perUse = item.lifeUnits > 0 ? item.price / item.lifeUnits : 0;
        return sum + perUse;
      }
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

  const updateDirect = (id: DirectItem['id'], patch: Partial<DirectItem>) => {
    setState((prev) => ({
      ...prev,
      direct: prev.direct.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  };

  const updateDepreciation = (id: DepItem['id'], patch: Partial<DepItem>) => {
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

  const setProductType = (type: EtiquetasState['productType']) => {
    setState((prev) => {
      const preset = PRODUCT_PRESETS[type];
      const updatedDirect = preset
        ? prev.direct.map((it) =>
            it.id === 'producto'
              ? { ...it, price: preset.price, quantity: preset.quantity }
              : it
          )
        : prev.direct;
      return { ...prev, productType: preset ? type : prev.productType, direct: updatedDirect };
    });
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
    setProductType,
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
