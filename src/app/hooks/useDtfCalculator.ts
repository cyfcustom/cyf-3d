import { useEffect, useMemo, useState } from 'react';
import { clampNumber, parseMoney } from '../lib/money';

type Modality = 'metro' | 'tramo30' | 'a3';

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

type DtfState = {
  modality: Modality;
  respectMinimum: boolean;
  pricePerUnit: number;
  lengthCm: number;
  calcByDesign: boolean;
  designCount: number;
  designWidthCm: number;
  designHeightCm: number;
  extras: {
    envio: number;
    diseno: number;
    plancha: number;
    otros: number;
  };
  prenda: {
    enabled: boolean;
    count: number;
    packPrice: number;
  };
  depreciation: {
    enabled: boolean;
    price: number;
    lifeUnits: number;
  };
  indirect: IndirectState;
  mo: MoState;
  gananciaPct: number;
  impuestosPct: number;
  applyGanancia: boolean;
  applyImpuestos: boolean;
};

const STORAGE_KEY = 'dtf-calculator-v1';

const defaultState: DtfState = {
  modality: 'metro',
  respectMinimum: true,
  pricePerUnit: 15,
  lengthCm: 0,
  calcByDesign: false,
  designCount: 1,
  designWidthCm: 10,
  designHeightCm: 10,
  extras: {
    envio: 0,
    diseno: 0,
    plancha: 0,
    otros: 0,
  },
  prenda: {
    enabled: false,
    count: 0,
    packPrice: 0,
  },
  depreciation: {
    enabled: false,
    price: 400,
    lifeUnits: 2400,
  },
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
};

function revive(raw: any): DtfState {
  if (!raw || typeof raw !== 'object') return defaultState;
  const num = (v: any, fb: number) => {
    const n = parseMoney(v);
    return isFinite(n) ? n : fb;
  };
  return {
    modality: raw.modality === 'tramo30' || raw.modality === 'a3' ? raw.modality : 'metro',
    respectMinimum: Boolean(raw.respectMinimum ?? defaultState.respectMinimum),
    pricePerUnit: num(raw.pricePerUnit, defaultState.pricePerUnit),
    lengthCm: num(raw.lengthCm, defaultState.lengthCm),
    calcByDesign: Boolean(raw.calcByDesign ?? defaultState.calcByDesign),
    designCount: clampNumber(num(raw.designCount, defaultState.designCount), 1, 1e6),
    designWidthCm: clampNumber(num(raw.designWidthCm, defaultState.designWidthCm), 0.1, 1e6),
    designHeightCm: clampNumber(num(raw.designHeightCm, defaultState.designHeightCm), 0.1, 1e6),
    extras: {
      envio: num(raw.extras?.envio, defaultState.extras.envio),
      diseno: num(raw.extras?.diseno, defaultState.extras.diseno),
      plancha: num(raw.extras?.plancha, defaultState.extras.plancha),
      otros: num(raw.extras?.otros, defaultState.extras.otros),
    },
    prenda: {
      enabled: Boolean(raw.prenda?.enabled ?? defaultState.prenda.enabled),
      count: clampNumber(num(raw.prenda?.count, defaultState.prenda.count), 0, 1e9),
      packPrice: num(raw.prenda?.packPrice, defaultState.prenda.packPrice),
    },
    depreciation: {
      enabled: Boolean(raw.depreciation?.enabled ?? defaultState.depreciation.enabled),
      price: num(raw.depreciation?.price, defaultState.depreciation.price),
      lifeUnits: clampNumber(num(raw.depreciation?.lifeUnits, defaultState.depreciation.lifeUnits), 1, 1e9),
    },
    indirect: {
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
    },
    mo: {
      enabled: Boolean(raw.mo?.enabled ?? defaultState.mo.enabled),
      salary: num(raw.mo?.salary, defaultState.mo.salary),
      hoursPerMonth: clampNumber(num(raw.mo?.hoursPerMonth, defaultState.mo.hoursPerMonth), 0, 1e9),
      setupMinutes: clampNumber(num(raw.mo?.setupMinutes, defaultState.mo.setupMinutes), 0, 1e9),
      runMinutesPerUnit: clampNumber(num(raw.mo?.runMinutesPerUnit, defaultState.mo.runMinutesPerUnit), 0, 1e9),
      unitsPerBatch: clampNumber(num(raw.mo?.unitsPerBatch, defaultState.mo.unitsPerBatch), 1, 1e9),
    },
    gananciaPct: clampNumber(num(raw.gananciaPct, defaultState.gananciaPct), 0, 1000),
    impuestosPct: clampNumber(num(raw.impuestosPct, defaultState.impuestosPct), 0, 1000),
    applyGanancia: Boolean(raw.applyGanancia ?? defaultState.applyGanancia),
    applyImpuestos: Boolean(raw.applyImpuestos ?? defaultState.applyImpuestos),
  };
}

export function useDtfCalculator() {
  const [state, setState] = useState<DtfState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? revive(JSON.parse(raw)) : defaultState;
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
    const ANCHO = 57;
    const unitLen = state.modality === 'a3' ? 42 : state.modality === 'tramo30' ? 30 : 100;

    const designLength = state.calcByDesign
      ? (() => {
          const cols = Math.max(1, Math.floor(ANCHO / Math.max(0.1, state.designWidthCm)));
          const filas = Math.ceil(Math.max(1, state.designCount) / cols);
          return filas * state.designHeightCm;
        })()
      : state.lengthCm;

    const unitsChargedRaw = designLength / unitLen;
    const unitsCharged = state.respectMinimum ? Math.max(1, Math.ceil(unitsChargedRaw)) : unitsChargedRaw;

    const directCost = clampNumber(unitsCharged * state.pricePerUnit, 0, 1e12);

    const designCount = Math.max(1, state.designCount);

    const extrasFixed =
      clampNumber(state.extras.envio, 0, 1e12) +
      clampNumber(state.extras.diseno, 0, 1e12) +
      clampNumber(state.extras.otros, 0, 1e12);
    const planchaTotal = clampNumber(state.extras.plancha, 0, 1e12) * designCount;
    const extrasSum = extrasFixed + planchaTotal;

    const prendaUnit = state.prenda.count > 0 ? state.prenda.packPrice / state.prenda.count : 0;
    const prendaTotal = state.prenda.enabled ? prendaUnit * designCount : 0;

    const depPerUnit = state.depreciation.enabled ? state.depreciation.price / state.depreciation.lifeUnits : 0;
    const depTotal = depPerUnit * designCount;

    const indirectBase = (() => {
      const m = state.indirect.monthly;
      const monthlyTotal =
        m.alquiler +
        m.internet +
        m.suscripciones +
        m.transporte +
        m.electricidad +
        m.publicidad +
        m.otros;
      return monthlyTotal / Math.max(1, state.indirect.unitsPerMonth);
    })();
    const indirectPerUnit = state.indirect.enabled ? indirectBase : 0;
    const indirectTotal = indirectPerUnit * designCount;

    const moPerUnit = state.mo.enabled
      ? (() => {
          const costPerMinute = state.mo.hoursPerMonth > 0 ? state.mo.salary / (state.mo.hoursPerMonth * 60) : 0;
          const totalMinutes = state.mo.setupMinutes + state.mo.runMinutesPerUnit * state.mo.unitsPerBatch;
          return state.mo.unitsPerBatch > 0 ? (totalMinutes * costPerMinute) / state.mo.unitsPerBatch : 0;
        })()
      : 0;
    const moTotal = moPerUnit * designCount;

    const subtotal = directCost + extrasSum + prendaTotal + depTotal + indirectTotal + moTotal;

    const ganVal = state.applyGanancia ? subtotal * (state.gananciaPct / 100) : 0;
    const impVal = state.applyImpuestos ? (subtotal + ganVal) * (state.impuestosPct / 100) : 0;
    const total = subtotal + ganVal + impVal;

    const perDesignDirect = designCount > 0 ? directCost / designCount : 0;
    const perDesignExtras = designCount > 0 ? extrasFixed / designCount : 0;
    const costPerStamp =
      perDesignDirect +
      perDesignExtras +
      state.extras.plancha +
      depPerUnit +
      indirectPerUnit +
      moPerUnit;
    const costPerShirt = prendaUnit + costPerStamp;

    return {
      designLength,
      unitsCharged,
      directCost,
      extrasSum,
      planchaTotal,
      prendaUnit,
      prendaTotal,
      depPerUnit,
      depTotal,
      indirectPerUnit,
      indirectTotal,
      moPerUnit,
      moTotal,
      subtotalSinGI: subtotal,
      ganancia: ganVal,
      impuestos: impVal,
      total,
      perDesignDirect,
      perDesignExtras,
      costPerStamp,
      costPerShirt,
      designCount,
    };
  }, [state]);

  const setStatePatch = (patch: Partial<DtfState>) => setState((prev) => ({ ...prev, ...patch }));

  return {
    state,
    totals,
    setModality: (mod: Modality) => setStatePatch({ modality: mod }),
    setRespectMinimum: (v: boolean) => setStatePatch({ respectMinimum: v }),
    setPricePerUnit: (v: number) => setStatePatch({ pricePerUnit: v }),
    setLengthCm: (v: number) => setStatePatch({ lengthCm: v }),
    setCalcByDesign: (v: boolean) => setStatePatch({ calcByDesign: v }),
    setDesignCount: (v: number) => setStatePatch({ designCount: v }),
    setDesignWidthCm: (v: number) => setStatePatch({ designWidthCm: v }),
    setDesignHeightCm: (v: number) => setStatePatch({ designHeightCm: v }),
    setExtras: (patch: Partial<DtfState['extras']>) =>
      setState((prev) => ({ ...prev, extras: { ...prev.extras, ...patch } })),
    setPrenda: (patch: Partial<DtfState['prenda']>) =>
      setState((prev) => ({ ...prev, prenda: { ...prev.prenda, ...patch } })),
    setDepreciation: (patch: Partial<DtfState['depreciation']>) =>
      setState((prev) => ({ ...prev, depreciation: { ...prev.depreciation, ...patch } })),
    setIndirect: (patch: Partial<IndirectState>) =>
      setState((prev) => ({ ...prev, indirect: { ...prev.indirect, ...patch } })),
    setIndirectMonthly: (key: keyof IndirectState['monthly'], value: number) =>
      setState((prev) => ({
        ...prev,
        indirect: {
          ...prev.indirect,
          monthly: { ...prev.indirect.monthly, [key]: value },
        },
      })),
    setMo: (patch: Partial<MoState>) => setState((prev) => ({ ...prev, mo: { ...prev.mo, ...patch } })),
    setGananciaPct: (v: number) => setStatePatch({ gananciaPct: v }),
    setImpuestosPct: (v: number) => setStatePatch({ impuestosPct: v }),
    setApplyGanancia: (v: boolean) => setStatePatch({ applyGanancia: v }),
    setApplyImpuestos: (v: boolean) => setStatePatch({ applyImpuestos: v }),
    reset: () => setState(defaultState),
  };
}
