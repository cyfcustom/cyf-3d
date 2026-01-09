import { useEffect, useMemo, useState } from 'react';
import { clampNumber, parseMoney } from '../lib/money';

type MensajeriaType = 'Motorizado local' | 'Mensajería urbana' | 'Encomienda nacional' | 'Internacional' | 'Otro';

type EnviosState = {
  mensajeriaEnabled: boolean;
  tipo: MensajeriaType;
  km: number;
  base: number;
  tarifaKm: number;
  kg: number;
  tarifaKg: number;
  embalajeEnabled: boolean;
  fragilEnabled: boolean;
  seguroEnabled: boolean;
  embalaje: number;
  fragil: number;
  seguroPct: number;
  otros: number;
};

const STORAGE_KEY = 'envios-calculator-v1';

const defaultState: EnviosState = {
  mensajeriaEnabled: false,
  tipo: 'Motorizado local',
  km: 0,
  base: 0,
  tarifaKm: 0,
  kg: 0,
  tarifaKg: 0,
  embalajeEnabled: false,
  fragilEnabled: false,
  seguroEnabled: false,
  embalaje: 0,
  fragil: 0,
  seguroPct: 0,
  otros: 0,
};

function reviveState(raw: any): EnviosState {
  if (!raw || typeof raw !== 'object') return defaultState;
  const num = (v: any, fb: number) => {
    const n = parseMoney(v);
    return isFinite(n) ? n : fb;
  };
  const tipo = (raw.tipo as MensajeriaType) ?? defaultState.tipo;
  return {
    mensajeriaEnabled: Boolean(raw.mensajeriaEnabled ?? defaultState.mensajeriaEnabled),
    tipo: ['Motorizado local', 'Mensajería urbana', 'Encomienda nacional', 'Internacional', 'Otro'].includes(tipo)
      ? tipo
      : defaultState.tipo,
    km: clampNumber(num(raw.km, defaultState.km), 0, 1e6),
    base: clampNumber(num(raw.base, defaultState.base), 0, 1e9),
    tarifaKm: clampNumber(num(raw.tarifaKm, defaultState.tarifaKm), 0, 1e9),
    kg: clampNumber(num(raw.kg, defaultState.kg), 0, 1e6),
    tarifaKg: clampNumber(num(raw.tarifaKg, defaultState.tarifaKg), 0, 1e9),
    embalajeEnabled: Boolean(raw.embalajeEnabled ?? defaultState.embalajeEnabled),
    fragilEnabled: Boolean(raw.fragilEnabled ?? defaultState.fragilEnabled),
    seguroEnabled: Boolean(raw.seguroEnabled ?? defaultState.seguroEnabled),
    embalaje: clampNumber(num(raw.embalaje, defaultState.embalaje), 0, 1e9),
    fragil: clampNumber(num(raw.fragil, defaultState.fragil), 0, 1e9),
    seguroPct: clampNumber(num(raw.seguroPct, defaultState.seguroPct), 0, 1000),
    otros: clampNumber(num(raw.otros, defaultState.otros), 0, 1e9),
  };
}

export function useEnviosCalculator() {
  const [state, setState] = useState<EnviosState>(() => {
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
    const mensajeria = state.mensajeriaEnabled
      ? clampNumber(state.base, 0) + clampNumber(state.km, 0) * clampNumber(state.tarifaKm, 0) + clampNumber(state.kg, 0) * clampNumber(state.tarifaKg, 0)
      : 0;

    const extrasBase =
      (state.embalajeEnabled ? clampNumber(state.embalaje, 0) : 0) +
      (state.fragilEnabled ? clampNumber(state.fragil, 0) : 0) +
      clampNumber(state.otros, 0);
    const seguroVal = state.seguroEnabled ? (mensajeria + extrasBase) * (clampNumber(state.seguroPct, 0) / 100) : 0;
    const extras = extrasBase + seguroVal;

    return {
      mensajeria,
      extras,
      total: mensajeria + extras,
    };
  }, [state]);

  const setField = <K extends keyof EnviosState>(key: K, value: EnviosState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const reset = () => setState(defaultState);

  return {
    state,
    totals,
    setField,
    reset,
  };
}
