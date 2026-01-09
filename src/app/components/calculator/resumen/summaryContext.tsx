import { createContext, ReactNode, useCallback, useContext, useMemo, useState, useEffect } from 'react';

export type SummaryModuleId =
  | 'vinil'
  | 'sublimacion'
  | 'etiquetas'
  | 'empaques'
  | 'papeleria'
  | 'envios'
  | 'dtf'
  | 'esferas'
  | 'personalizado';

type SummaryContextValue = {
  totals: Partial<Record<SummaryModuleId, number>>;
  report: (id: SummaryModuleId, total: number) => void;
};

const SummaryContext = createContext<SummaryContextValue | null>(null);

export function SummaryProvider({ children }: { children: ReactNode }) {
  const [totals, setTotals] = useState<Partial<Record<SummaryModuleId, number>>>({});

  const report = useCallback((id: SummaryModuleId, total: number) => {
    setTotals((prev) => {
      const current = prev[id];
      if (current === total) return prev;
      return { ...prev, [id]: total };
    });
  }, []);

  const value = useMemo(() => ({ totals, report }), [totals, report]);

  return <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>;
}

export function useSummaryReporter(id: SummaryModuleId, total: number) {
  const ctx = useContext(SummaryContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.report(id, total);
  }, [ctx, id, total]);
}

export function useSummaryTotals() {
  return useContext(SummaryContext);
}
