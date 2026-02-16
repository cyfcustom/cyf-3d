import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney, formatMoney } from '@/app/lib/money';
import { useSummaryReporter } from '../summary/summaryContext';

type DirRow = {
  desc: string;
  qty: number;
  price: number;
  useQty: number;
};

type DepRowLife = {
  desc: string;
  price: number;
  mode: 'life';
  life: number;
  uses: number;
};

type DepRowCapacity = {
  desc: string;
  price: number;
  mode: 'capacity';
  months: number;
  capacity: number;
  uses: number;
};

type DepRow = DepRowLife | DepRowCapacity;

type GIConfig = {
  mode: 'margin' | 'markup';
  profitOn: boolean;
  profitPct: number;
  taxOn: boolean;
  taxPct: number;
};

export function CustomizableModule(){
  const { t } = useTranslation('calculator');
  const [name, setName] = useState('');

  const [directs, setDirects] = useState<DirRow[]>([
    { desc: '', qty: 1, price: 0, useQty: 1 },
  ]);

  const [depr, setDepr] = useState<DepRow[]>([
    { desc: '', price: 0, mode:'life', life: 100, uses: 1 },
  ]);

  const [indOn, setIndOn] = useState(false);
  const [indMonthly, setIndMonthly] = useState(0);
  const [indUnits, setIndUnits] = useState(100);

  const [moOn, setMoOn] = useState(false);
  const [moSalary, setMoSalary] = useState(0);
  const [moHoursMonth, setMoHoursMonth] = useState(160);
  const [moSetupMin, setMoSetupMin] = useState(0);
  const [moRunMin, setMoRunMin] = useState(0);
  const [moUnits, setMoUnits] = useState(1);

  const [gi, setGi] = useState<GIConfig>({ mode:'margin', profitOn:true, profitPct:30, taxOn:true, taxPct:16 });

  const [qtyOn, setQtyOn] = useState(false);
  const [qty, setQty] = useState(1);

  function fmt(n: number){ return formatMoney(n, 'USD'); }

  function addDirect(){ setDirects(d => [...d, { desc:'', qty:1, price:0, useQty:1 }]); }
  function removeDirect(i: number){ setDirects(d => d.filter((_,idx)=> idx!==i)); }
  function updateDirect(i: number, patch: Partial<DirRow>){ setDirects(d => d.map((row,idx)=> idx===i ? { ...row, ...patch } : row)); }

  function addDep(){ setDepr(d => [...d, { desc:'', price:0, mode:'life', life:100, uses:1 }]); }
  function removeDep(i: number){ setDepr(d => d.filter((_,idx)=> idx!==i)); }
  function setDepMode(i: number, mode: 'life'|'capacity'){
    setDepr(d => d.map((row,idx)=>{
      if(idx!==i) return row;
      if(mode==='life') return { desc: row.desc, price: row.price, mode:'life', life:100, uses:1 } as DepRowLife;
      return { desc: row.desc, price: row.price, mode:'capacity', months:24, capacity:100, uses:1 } as DepRowCapacity;
    }));
  }
  function updateDep(i: number, patch: Partial<DepRow>){ setDepr(d => d.map((row,idx)=> idx===i ? ({ ...row, ...patch } as DepRow) : row)); }

  const dirTotal = useMemo(()=>{
    return directs.reduce((acc, r)=>{
      const ud = r.qty>0 ? (r.price / r.qty) : 0;
      const used = ud * Math.max(0, r.useQty || 0);
      return acc + used;
    }, 0);
  }, [directs]);

  const depTotal = useMemo(()=>{
    return depr.reduce((acc, r)=>{
      let ud = 0;
      if(r.mode==='life'){
        ud = r.life>0 ? (r.price / r.life) : 0;
      }else{
        const perMonth = r.months>0 ? (r.price / r.months) : 0;
        ud = r.capacity>0 ? (perMonth / r.capacity) : 0;
      }
      const used = ud * Math.max(0, r.uses || 0);
      return acc + used;
    }, 0);
  }, [depr]);

  const indPerUnit = useMemo(()=>{
    if(!indOn) return 0;
    return indUnits>0 ? (indMonthly / indUnits) : 0;
  }, [indOn, indMonthly, indUnits]);

  const moPerUnit = useMemo(()=>{
    if(!moOn) return 0;
    const ratePerMin = moHoursMonth>0 ? (moSalary / (moHoursMonth*60)) : 0;
    const totalMins = moSetupMin + moRunMin;
    return moUnits>0 ? (ratePerMin * totalMins / moUnits) : 0;
  }, [moOn, moSalary, moHoursMonth, moSetupMin, moRunMin, moUnits]);

  const subtotal = useMemo(()=> dirTotal + depTotal + (indOn?indPerUnit:0) + (moOn?moPerUnit:0), [dirTotal, depTotal, indOn, indPerUnit, moOn, moPerUnit]);

  const financials = useMemo(()=>{
    let profit = 0; let tax = 0;
    const gp = gi.profitPct/100; const tp = gi.taxPct/100;
    if(gi.profitOn){
      if(gi.mode==='margin'){
        profit = (gp>=1) ? 0 : (subtotal * gp / (1 - gp));
      }else{
        profit = subtotal * gp;
      }
    }
    const taxBase = subtotal + profit;
    if(gi.taxOn){ tax = taxBase * tp; }
    return { profit, tax };
  }, [gi, subtotal]);

  const salePrice = useMemo(()=> subtotal + financials.profit + financials.tax, [subtotal, financials]);

  useSummaryReporter('customizable', salePrice);

  const qtyBase = useMemo(()=> (qtyOn ? subtotal : 0) * qty, [qtyOn, subtotal, qty]);
  const qtySub = useMemo(()=> (qtyOn ? subtotal : 0) * qty, [qtyOn, subtotal, qty]);
  const qtyProfit = useMemo(()=> (qtyOn ? financials.profit : 0) * qty, [qtyOn, financials.profit, qty]);
  const qtyTax = useMemo(()=> (qtyOn ? financials.tax : 0) * qty, [qtyOn, financials.tax, qty]);
  const qtyTotal = useMemo(()=> (qtyOn ? salePrice : 0) * qty, [qtyOn, salePrice, qty]);

  function reset(){
    setName('');
    setDirects([{ desc:'', qty:1, price:0, useQty:1 }]);
    setDepr([{ desc:'', price:0, mode:'life', life:100, uses:1 }]);
    setIndOn(false); setIndMonthly(0); setIndUnits(100);
    setMoOn(false); setMoSalary(0); setMoHoursMonth(160); setMoSetupMin(0); setMoRunMin(0); setMoUnits(1);
    setGi({ mode:'margin', profitOn:true, profitPct:30, taxOn:true, taxPct:16 });
    setQtyOn(false); setQty(1);
  }

  return (
    <div className="space-y-6" id="customizable">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('custom.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('custom.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('descriptions.customDescription')}</p>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('fields.productName')}</span>
            <Input type="text" value={name} onChange={(e)=> setName(e.target.value)} placeholder={t('custom.placeholder')} />
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">{t('sections.directCosts')}</h3>
        <div className="space-y-3">
          {directs.map((r,i)=>{
            const ud = r.qty>0 ? (r.price / r.qty) : 0;
            const used = ud * Math.max(0, r.useQty||0);
            return (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 items-end">
                <div className="space-y-1 xl:col-span-2">
                  <span className="text-xs text-muted-foreground">{t('fields.description')}</span>
                  <Input type="text" value={r.desc} onChange={(e)=> updateDirect(i,{desc:e.target.value})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.quantity')}</span>
                  <Input type="number" inputMode="decimal" step="1" min="0" value={r.qty} onChange={(e)=> updateDirect(i,{qty:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.priceDollar')}</span>
                  <Input type="number" inputMode="decimal" step="0.01" min="0" value={r.price} onChange={(e)=> updateDirect(i,{price:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.unitCostShort')}</span>
                  <Input readOnly value={fmt(ud)} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.qtyToUse')}</span>
                  <Input type="number" inputMode="decimal" step="0.01" min="0" value={r.useQty} onChange={(e)=> updateDirect(i,{useQty:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.usedCost')}</span>
                  <Input readOnly value={fmt(used)} />
                </div>
                <div className="xl:col-span-6 flex justify-end">
                  <Button variant="outline" onClick={()=> removeDirect(i)}>{t('actions.delete')}</Button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-center">
            <Button onClick={addDirect}>{t('actions.addLine')}</Button>
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">{t('sections.depreciationEquipment')}</h3>
        <div className="space-y-3">
          {depr.map((r,i)=>{
            const ud = r.mode==='life'
              ? (r.life>0 ? r.price / r.life : 0)
              : (()=>{ const perMonth = (r.months>0 ? r.price / r.months : 0); return r.capacity>0 ? perMonth / r.capacity : 0; })();
            const used = ud * Math.max(0, r.uses||0);
            return (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 items-end">
                <div className="space-y-1 xl:col-span-2">
                  <span className="text-xs text-muted-foreground">{t('custom.equipment')}</span>
                  <Input type="text" value={r.desc} onChange={(e)=> updateDep(i,{desc:e.target.value})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.priceDollar')}</span>
                  <Input type="number" inputMode="decimal" step="0.01" min="0" value={r.price} onChange={(e)=> updateDep(i,{price:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.mode')}</span>
                  <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={r.mode} onChange={(e)=> setDepMode(i, e.target.value as 'life'|'capacity')}>
                    <option value="life">{t('custom.modeLife')}</option>
                    <option value="capacity">{t('custom.modeCapacity')}</option>
                  </select>
                </div>
                {r.mode==='life' ? (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{t('custom.lifeUses')}</span>
                    <Input type="number" inputMode="decimal" step="1" min="0" value={r.life} onChange={(e)=> updateDep(i,{life:parseMoney(e.target.value)})} />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">{t('fields.months')}</span>
                      <Input type="number" inputMode="decimal" step="1" min="0" value={r.months} onChange={(e)=> updateDep(i,{months:parseMoney(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">{t('fields.capacityPerMonth')}</span>
                      <Input type="number" inputMode="decimal" step="1" min="0" value={r.capacity} onChange={(e)=> updateDep(i,{capacity:parseMoney(e.target.value)})} />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.unitCostShort')}</span>
                  <Input readOnly value={fmt(ud)} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.usageCount')}</span>
                  <Input type="number" inputMode="decimal" step="0.01" min="0" value={r.uses} onChange={(e)=> updateDep(i,{uses:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.usedCost')}</span>
                  <Input readOnly value={fmt(used)} />
                </div>
                <div className="xl:col-span-7 flex justify-end">
                  <Button variant="outline" onClick={()=> removeDep(i)}>{t('actions.delete')}</Button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-center">
            <Button onClick={addDep}>{t('actions.addEquipment')}</Button>
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 justify-between">
          <h3 className="text-lg font-semibold">{t('sections.indirectCosts')}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('fields.activate')}</span>
            <Switch checked={indOn} onCheckedChange={setIndOn} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('fields.monthlyTotal')}</span>
            <Input type="number" inputMode="decimal" step="0.01" min="0" value={indMonthly} onChange={(e)=> setIndMonthly(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('fields.unitsPerMonth')}</span>
            <Input type="number" inputMode="decimal" step="1" min="1" value={indUnits} onChange={(e)=> setIndUnits(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('fields.unitCostIndirect')}</span>
            <Input readOnly value={fmt(indPerUnit)} />
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 justify-between">
          <h3 className="text-lg font-semibold">{t('sections.labor')}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('fields.activate')}</span>
            <Switch checked={moOn} onCheckedChange={setMoOn} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('fields.monthlySalaryDollar')}</span>
            <Input type="number" inputMode="decimal" step="0.01" min="0" value={moSalary} onChange={(e)=> setMoSalary(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('fields.hoursPerMonthShort')}</span>
            <Input type="number" inputMode="decimal" step="1" min="0" value={moHoursMonth} onChange={(e)=> setMoHoursMonth(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('fields.setupMin')}</span>
            <Input type="number" inputMode="decimal" step="1" min="0" value={moSetupMin} onChange={(e)=> setMoSetupMin(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('custom.run')}</span>
            <Input type="number" inputMode="decimal" step="1" min="0" value={moRunMin} onChange={(e)=> setMoRunMin(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('custom.units')}</span>
            <Input type="number" inputMode="decimal" step="1" min="1" value={moUnits} onChange={(e)=> setMoUnits(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('custom.moPerUnit')}</span>
            <Input readOnly value={fmt(moPerUnit)} />
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">{t('sections.profitTaxes')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 items-end">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('fields.mode')}</span>
            <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={gi.mode} onChange={(e)=> setGi(g=> ({...g, mode: e.target.value as 'margin'|'markup'}))}>
              <option value="margin">{t('custom.margin')}</option>
              <option value="markup">{t('custom.markup')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={gi.profitOn} onCheckedChange={(v)=> setGi(g=> ({...g, profitOn:v}))} />
            <span className="text-sm">{t('fields.applyProfit')}</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('fields.profitPct')}</span>
            <Input type="number" inputMode="decimal" step="0.01" min="0" value={gi.profitPct} onChange={(e)=> setGi(g=> ({...g, profitPct: parseMoney(e.target.value)}))} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={gi.taxOn} onCheckedChange={(v)=> setGi(g=> ({...g, taxOn:v}))} />
            <span className="text-sm">{t('fields.applyTaxes')}</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('custom.taxPct')}</span>
            <Input type="number" inputMode="decimal" step="0.01" min="0" value={gi.taxPct} onChange={(e)=> setGi(g=> ({...g, taxPct: parseMoney(e.target.value)}))} />
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">{t('sections.summary')}</h3>
        <div className="flex flex-wrap gap-2">
          <div className="pill">{t('custom.directsLabel')} <span className="result">{fmt(dirTotal)}</span></div>
          <div className="pill">{t('custom.depreciationLabel')} <span className="result">{fmt(depTotal)}</span></div>
          <div className="pill">{t('custom.indirectsLabel')} <span className="result">{fmt(indOn?indPerUnit:0)}</span></div>
          <div className="pill">{t('custom.laborLabel')} <span className="result">{fmt(moOn?moPerUnit:0)}</span></div>
          <div className="pill">{t('custom.subtotalLabel')} <span className="result">{fmt(subtotal)}</span></div>
          <div className="pill">{t('custom.profitLabel')} <span className="result">{fmt(financials.profit)}</span></div>
          <div className="pill">{t('custom.taxLabel')} <span className="result">{fmt(financials.tax)}</span></div>
        </div>
        <div className="sep"></div>
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">{t('summaryLabels.salePriceColon')} <span>{fmt(salePrice)}</span></div>
          <Button variant="outline" onClick={reset}>{t('actions.reset')}</Button>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">{t('sections.productQuantity')}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm">{t('fields.activateQuantity')}</span>
          <Switch checked={qtyOn} onCheckedChange={setQtyOn} />
          <Input type="number" inputMode="decimal" step="1" min="1" value={qty} onChange={(e)=> setQty(parseMoney(e.target.value))} style={{maxWidth:'120px'}} />
          <span className="text-xs text-muted-foreground">{t('descriptions.qtyMultiplierCustom')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="pill"><span>{t('summaryLabels.baseNoGIxQ')}</span><span className="result">{fmt(qtyBase)}</span></div>
          <div className="pill"><span>{t('summaryLabels.subtotalxQ')}</span><span className="result">{fmt(qtySub)}</span></div>
          <div className="pill"><span>{t('summaryLabels.profitxQ')}</span><span className="result">{fmt(qtyProfit)}</span></div>
          <div className="pill"><span>{t('summaryLabels.taxxQ')}</span><span className="result">{fmt(qtyTax)}</span></div>
          <div className="pill"><span>{t('summaryLabels.totalxQ')}</span><span className="result">{fmt(qtyTotal)}</span></div>
        </div>
      </div>
    </div>
  );
}
