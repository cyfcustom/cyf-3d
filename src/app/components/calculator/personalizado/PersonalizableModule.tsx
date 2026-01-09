import { useMemo, useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney, formatMoney } from '@/app/lib/money';
import { useSummaryReporter } from '../resumen/summaryContext';

type DirRow = {
  desc: string;
  cant: number; // cantidad embalada
  precio: number; // precio del pack
  utilcant: number; // cantidad a usar
};

type DepRowVida = {
  desc: string;
  precio: number;
  modo: 'vida';
  vida: number; // usos totales
  usos: number; // usos a aplicar
};

type DepRowCap = {
  desc: string;
  precio: number;
  modo: 'capacidad';
  meses: number;
  capacidad: number; // uds/mes
  usos: number; // usos a aplicar
};

type DepRow = DepRowVida | DepRowCap;

type GIConfig = {
  modo: 'Margen' | 'Markup';
  gOn: boolean;
  gPct: number; // %
  iOn: boolean;
  iPct: number; // %
};

export function PersonalizableModule(){
  const [name, setName] = useState('');

  const [directos, setDirectos] = useState<DirRow[]>([
    { desc: '', cant: 1, precio: 0, utilcant: 1 },
  ]);

  const [depr, setDepr] = useState<DepRow[]>([
    { desc: '', precio: 0, modo:'vida', vida: 100, usos: 1 },
  ]);

  const [indOn, setIndOn] = useState(false);
  const [indMensual, setIndMensual] = useState(0); // suma mensual por rubros
  const [indUnits, setIndUnits] = useState(100); // uds/mes

  const [moOn, setMoOn] = useState(false);
  const [moSueldo, setMoSueldo] = useState(0);
  const [moHorasMes, setMoHorasMes] = useState(160);
  const [moSetupMin, setMoSetupMin] = useState(0);
  const [moRunMin, setMoRunMin] = useState(0);
  const [moUnits, setMoUnits] = useState(1);

  const [gi, setGi] = useState<GIConfig>({ modo:'Margen', gOn:true, gPct:30, iOn:true, iPct:16 });

  const [qtyOn, setQtyOn] = useState(false);
  const [qty, setQty] = useState(1);

  // helpers
  function fmt(n: number){ return formatMoney(n, 'USD'); }

  function addDirecto(){ setDirectos(d => [...d, { desc:'', cant:1, precio:0, utilcant:1 }]); }
  function removeDirecto(i: number){ setDirectos(d => d.filter((_,idx)=> idx!==i)); }
  function updateDirecto(i: number, patch: Partial<DirRow>){ setDirectos(d => d.map((row,idx)=> idx===i ? { ...row, ...patch } : row)); }

  function addDep(){ setDepr(d => [...d, { desc:'', precio:0, modo:'vida', vida:100, usos:1 }]); }
  function removeDep(i: number){ setDepr(d => d.filter((_,idx)=> idx!==i)); }
  function setDepMode(i: number, modo: 'vida'|'capacidad'){
    setDepr(d => d.map((row,idx)=>{
      if(idx!==i) return row;
      if(modo==='vida') return { desc: row.desc, precio: row.precio, modo:'vida', vida:100, usos:1 } as DepRowVida;
      return { desc: row.desc, precio: row.precio, modo:'capacidad', meses:24, capacidad:100, usos:1 } as DepRowCap;
    }));
  }
  function updateDep(i: number, patch: Partial<DepRow>){ setDepr(d => d.map((row,idx)=> idx===i ? ({ ...row, ...patch } as DepRow) : row)); }

  // cálculos
  const dirTotal = useMemo(()=>{
    return directos.reduce((acc, r)=>{
      const ud = r.cant>0 ? (r.precio / r.cant) : 0;
      const used = ud * Math.max(0, r.utilcant || 0);
      return acc + used;
    }, 0);
  }, [directos]);

  const depTotal = useMemo(()=>{
    return depr.reduce((acc, r)=>{
      let ud = 0;
      if(r.modo==='vida'){
        ud = r.vida>0 ? (r.precio / r.vida) : 0;
      }else{
        const porMes = r.meses>0 ? (r.precio / r.meses) : 0;
        ud = r.capacidad>0 ? (porMes / r.capacidad) : 0;
      }
      const used = ud * Math.max(0, r.usos || 0);
      return acc + used;
    }, 0);
  }, [depr]);

  const indUd = useMemo(()=>{
    if(!indOn) return 0;
    return indUnits>0 ? (indMensual / indUnits) : 0;
  }, [indOn, indMensual, indUnits]);

  const moUd = useMemo(()=>{
    if(!moOn) return 0;
    const valorMin = moHorasMes>0 ? (moSueldo / (moHorasMes*60)) : 0;
    const minsTot = moSetupMin + moRunMin;
    return moUnits>0 ? (valorMin * minsTot / moUnits) : 0;
  }, [moOn, moSueldo, moHorasMes, moSetupMin, moRunMin, moUnits]);

  const subtotal = useMemo(()=> dirTotal + depTotal + (indOn?indUd:0) + (moOn?moUd:0), [dirTotal, depTotal, indOn, indUd, moOn, moUd]);

  const GI = useMemo(()=>{
    let G = 0; let I = 0;
    const gp = gi.gPct/100; const ip = gi.iPct/100;
    if(gi.gOn){
      if(gi.modo==='Margen'){
        G = (gp>=1) ? 0 : (subtotal * gp / (1 - gp));
      }else{
        G = subtotal * gp;
      }
    }
    const baseImp = subtotal + G;
    if(gi.iOn){ I = baseImp * ip; }
    return { G, I };
  }, [gi, subtotal]);

  const pv = useMemo(()=> subtotal + GI.G + GI.I, [subtotal, GI]);

  // report to summary
  useSummaryReporter('personalizado', pv);

  const qtyBase = useMemo(()=> (qtyOn ? subtotal : 0) * qty, [qtyOn, subtotal, qty]);
  const qtySub = useMemo(()=> (qtyOn ? subtotal : 0) * qty, [qtyOn, subtotal, qty]);
  const qtyG = useMemo(()=> (qtyOn ? GI.G : 0) * qty, [qtyOn, GI.G, qty]);
  const qtyI = useMemo(()=> (qtyOn ? GI.I : 0) * qty, [qtyOn, GI.I, qty]);
  const qtyTotal = useMemo(()=> (qtyOn ? pv : 0) * qty, [qtyOn, pv, qty]);

  function reset(){
    setName('');
    setDirectos([{ desc:'', cant:1, precio:0, utilcant:1 }]);
    setDepr([{ desc:'', precio:0, modo:'vida', vida:100, usos:1 }]);
    setIndOn(false); setIndMensual(0); setIndUnits(100);
    setMoOn(false); setMoSueldo(0); setMoHorasMes(160); setMoSetupMin(0); setMoRunMin(0); setMoUnits(1);
    setGi({ modo:'Margen', gOn:true, gPct:30, iOn:true, iPct:16 });
    setQtyOn(false); setQty(1);
  }

  return (
    <div className="space-y-6" id="personalizado">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 10</p>
        <h2 className="text-2xl font-bold">Producto personalizable</h2>
        <p className="text-sm text-muted-foreground">Define líneas de costo, depreciación, indirectos, mano de obra y ganancia/impuestos para calcular el precio de venta.</p>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Nombre del producto</span>
            <Input type="text" value={name} onChange={(e)=> setName(e.target.value)} placeholder="Ej. Taza Premium 11oz" />
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">Costos directos</h3>
        <div className="space-y-3">
          {directos.map((r,i)=>{
            const ud = r.cant>0 ? (r.precio / r.cant) : 0;
            const used = ud * Math.max(0, r.utilcant||0);
            return (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 items-end">
                <div className="space-y-1 xl:col-span-2">
                  <span className="text-xs text-muted-foreground">Descripción</span>
                  <Input type="text" value={r.desc} onChange={(e)=> updateDirecto(i,{desc:e.target.value})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Cantidad</span>
                  <Input type="number" inputMode="decimal" step="1" min="0" value={r.cant} onChange={(e)=> updateDirecto(i,{cant:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Precio ($)</span>
                  <Input type="number" inputMode="decimal" step="0.01" min="0" value={r.precio} onChange={(e)=> updateDirecto(i,{precio:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Costo Ud.</span>
                  <Input readOnly value={fmt(ud)} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Cant. a utilizar</span>
                  <Input type="number" inputMode="decimal" step="0.01" min="0" value={r.utilcant} onChange={(e)=> updateDirecto(i,{utilcant:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Costo utilizado</span>
                  <Input readOnly value={fmt(used)} />
                </div>
                <div className="xl:col-span-6 flex justify-end">
                  <Button variant="outline" onClick={()=> removeDirecto(i)}>Eliminar</Button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-center">
            <Button onClick={addDirecto}>Agregar línea</Button>
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">Depreciación de equipos</h3>
        <div className="space-y-3">
          {depr.map((r,i)=>{
            const ud = r.modo==='vida'
              ? (r.vida>0 ? r.precio / r.vida : 0)
              : (()=>{ const porMes = (r.meses>0 ? r.precio / r.meses : 0); return r.capacidad>0 ? porMes / r.capacidad : 0; })();
            const used = ud * Math.max(0, r.usos||0);
            return (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 items-end">
                <div className="space-y-1 xl:col-span-2">
                  <span className="text-xs text-muted-foreground">Equipo</span>
                  <Input type="text" value={r.desc} onChange={(e)=> updateDep(i,{desc:e.target.value})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Precio ($)</span>
                  <Input type="number" inputMode="decimal" step="0.01" min="0" value={r.precio} onChange={(e)=> updateDep(i,{precio:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Modo</span>
                  <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={r.modo} onChange={(e)=> setDepMode(i, e.target.value as 'vida'|'capacidad')}>
                    <option value="vida">Vida útil (usos)</option>
                    <option value="capacidad">Capacidad/mes + meses</option>
                  </select>
                </div>
                {r.modo==='vida' ? (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Vida (usos)</span>
                    <Input type="number" inputMode="decimal" step="1" min="0" value={r.vida} onChange={(e)=> updateDep(i,{vida:parseMoney(e.target.value)})} />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Meses</span>
                      <Input type="number" inputMode="decimal" step="1" min="0" value={r.meses} onChange={(e)=> updateDep(i,{meses:parseMoney(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Cap./mes (uds)</span>
                      <Input type="number" inputMode="decimal" step="1" min="0" value={r.capacidad} onChange={(e)=> updateDep(i,{capacidad:parseMoney(e.target.value)})} />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Costo Ud.</span>
                  <Input readOnly value={fmt(ud)} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Cant. de usos</span>
                  <Input type="number" inputMode="decimal" step="0.01" min="0" value={r.usos} onChange={(e)=> updateDep(i,{usos:parseMoney(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Costo utilizado</span>
                  <Input readOnly value={fmt(used)} />
                </div>
                <div className="xl:col-span-7 flex justify-end">
                  <Button variant="outline" onClick={()=> removeDep(i)}>Eliminar</Button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-center">
            <Button onClick={addDep}>Agregar equipo</Button>
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 justify-between">
          <h3 className="text-lg font-semibold">Costos indirectos</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">Activar</span>
            <Switch checked={indOn} onCheckedChange={setIndOn} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Total mensual ($)</span>
            <Input type="number" inputMode="decimal" step="0.01" min="0" value={indMensual} onChange={(e)=> setIndMensual(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Unidades/mes</span>
            <Input type="number" inputMode="decimal" step="1" min="1" value={indUnits} onChange={(e)=> setIndUnits(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Costo Ud. (indirectos)</span>
            <Input readOnly value={fmt(indUd)} />
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 justify-between">
          <h3 className="text-lg font-semibold">Mano de obra</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">Activar</span>
            <Switch checked={moOn} onCheckedChange={setMoOn} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Sueldo mensual ($)</span>
            <Input type="number" inputMode="decimal" step="0.01" min="0" value={moSueldo} onChange={(e)=> setMoSueldo(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Horas/mes</span>
            <Input type="number" inputMode="decimal" step="1" min="0" value={moHorasMes} onChange={(e)=> setMoHorasMes(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Setup (min)</span>
            <Input type="number" inputMode="decimal" step="1" min="0" value={moSetupMin} onChange={(e)=> setMoSetupMin(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Run (min)</span>
            <Input type="number" inputMode="decimal" step="1" min="0" value={moRunMin} onChange={(e)=> setMoRunMin(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Unidades</span>
            <Input type="number" inputMode="decimal" step="1" min="1" value={moUnits} onChange={(e)=> setMoUnits(parseMoney(e.target.value))} />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">MO por Ud.</span>
            <Input readOnly value={fmt(moUd)} />
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">Ganancia / Impuestos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 items-end">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Modo</span>
            <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={gi.modo} onChange={(e)=> setGi(g=> ({...g, modo: e.target.value as 'Margen'|'Markup'}))}>
              <option value="Margen">Margen</option>
              <option value="Markup">Markup</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={gi.gOn} onCheckedChange={(v)=> setGi(g=> ({...g, gOn:v}))} />
            <span className="text-sm">Aplicar Ganancia</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Ganancia (%)</span>
            <Input type="number" inputMode="decimal" step="0.01" min="0" value={gi.gPct} onChange={(e)=> setGi(g=> ({...g, gPct: parseMoney(e.target.value)}))} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={gi.iOn} onCheckedChange={(v)=> setGi(g=> ({...g, iOn:v}))} />
            <span className="text-sm">Aplicar Impuesto</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Impuesto (%)</span>
            <Input type="number" inputMode="decimal" step="0.01" min="0" value={gi.iPct} onChange={(e)=> setGi(g=> ({...g, iPct: parseMoney(e.target.value)}))} />
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">Resumen</h3>
        <div className="flex flex-wrap gap-2">
          <div className="pill">Directos: <span className="result">{fmt(dirTotal)}</span></div>
          <div className="pill">Depreciación: <span className="result">{fmt(depTotal)}</span></div>
          <div className="pill">Indirectos: <span className="result">{fmt(indOn?indUd:0)}</span></div>
          <div className="pill">Mano de obra: <span className="result">{fmt(moOn?moUd:0)}</span></div>
          <div className="pill">Subtotal: <span className="result">{fmt(subtotal)}</span></div>
          <div className="pill">+ Ganancia: <span className="result">{fmt(GI.G)}</span></div>
          <div className="pill">+ Impuestos: <span className="result">{fmt(GI.I)}</span></div>
        </div>
        <div className="sep"></div>
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Precio de Venta: <span>{fmt(pv)}</span></div>
          <Button variant="outline" onClick={reset}>Reset</Button>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">Cantidad de productos</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm">Activar cantidad</span>
          <Switch checked={qtyOn} onCheckedChange={setQtyOn} />
          <Input type="number" inputMode="decimal" step="1" min="1" value={qty} onChange={(e)=> setQty(parseMoney(e.target.value))} style={{maxWidth:'120px'}} />
          <span className="text-xs text-muted-foreground">Multiplica los valores finales por Q (vista).</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="pill"><span>Base sin G/I ×Q</span><span className="result">{fmt(qtyBase)}</span></div>
          <div className="pill"><span>Subtotal ×Q</span><span className="result">{fmt(qtySub)}</span></div>
          <div className="pill"><span>Ganancia ×Q</span><span className="result">{fmt(qtyG)}</span></div>
          <div className="pill"><span>Impuestos ×Q</span><span className="result">{fmt(qtyI)}</span></div>
          <div className="pill"><span>Total ×Q</span><span className="result">{fmt(qtyTotal)}</span></div>
        </div>
      </div>
    </div>
  );
}
