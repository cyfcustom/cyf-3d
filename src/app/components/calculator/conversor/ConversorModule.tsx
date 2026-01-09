import { useMemo, useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { parseMoney } from '@/app/lib/money';

const lengthUnits = [
  { value: 'mm', label: 'mm', factor: 0.1 },
  { value: 'cm', label: 'cm', factor: 1 },
  { value: 'm', label: 'm', factor: 100 },
  { value: 'in', label: 'in', factor: 2.54 },
  { value: 'ft', label: 'ft', factor: 30.48 },
  { value: 'yd', label: 'yd', factor: 91.44 },
] as const;

type LengthUnit = (typeof lengthUnits)[number]['value'];

const areaUnits = [
  { value: 'cm2', label: 'cm²', factor: 1 },
  { value: 'm2', label: 'm²', factor: 10000 },
  { value: 'in2', label: 'in²', factor: 6.4516 },
  { value: 'ft2', label: 'ft²', factor: 929.0304 },
] as const;

type AreaUnit = (typeof areaUnits)[number]['value'];

const massUnits = [
  { value: 'g', label: 'g', factor: 1 },
  { value: 'kg', label: 'kg', factor: 1000 },
  { value: 'lb', label: 'lb', factor: 453.59237 },
  { value: 'oz', label: 'oz', factor: 28.349523125 },
] as const;

type MassUnit = (typeof massUnits)[number]['value'];

type TempUnit = 'C' | 'F' | 'K';

function formatUnitOutput(value: number): string {
  if (!isFinite(value)) return '—';
  const rounded = Math.round(value * 10000) / 10000;
  const asString = String(rounded);
  return asString.includes('.') ? asString.replace('.', ',') : asString;
}

export function ConversorModule() {
  const [lenValue, setLenValue] = useState(1);
  const [lenFrom, setLenFrom] = useState<LengthUnit>('cm');
  const [lenTo, setLenTo] = useState<LengthUnit>('in');

  const [areaValue, setAreaValue] = useState(1);
  const [areaFrom, setAreaFrom] = useState<AreaUnit>('cm2');
  const [areaTo, setAreaTo] = useState<AreaUnit>('ft2');

  const [massValue, setMassValue] = useState(1);
  const [massFrom, setMassFrom] = useState<MassUnit>('g');
  const [massTo, setMassTo] = useState<MassUnit>('lb');

  const [tempValue, setTempValue] = useState(0);
  const [tempFrom, setTempFrom] = useState<TempUnit>('C');
  const [tempTo, setTempTo] = useState<TempUnit>('F');

  const [dpiWidthCm, setDpiWidthCm] = useState(10);
  const [dpiHeightCm, setDpiHeightCm] = useState(10);
  const [dpiValue, setDpiValue] = useState(300);

  const [pxWidth, setPxWidth] = useState(1181);
  const [pxHeight, setPxHeight] = useState(1181);
  const [pxDpi, setPxDpi] = useState(300);

  const lengthResult = useMemo(() => {
    const from = lengthUnits.find((u) => u.value === lenFrom)?.factor ?? 1;
    const to = lengthUnits.find((u) => u.value === lenTo)?.factor ?? 1;
    const cm = lenValue * from;
    const res = cm / to;
    return formatUnitOutput(res);
  }, [lenValue, lenFrom, lenTo]);

  const areaResult = useMemo(() => {
    const from = areaUnits.find((u) => u.value === areaFrom)?.factor ?? 1;
    const to = areaUnits.find((u) => u.value === areaTo)?.factor ?? 1;
    const cm2 = areaValue * from;
    const res = cm2 / to;
    return formatUnitOutput(res);
  }, [areaValue, areaFrom, areaTo]);

  const massResult = useMemo(() => {
    const from = massUnits.find((u) => u.value === massFrom)?.factor ?? 1;
    const to = massUnits.find((u) => u.value === massTo)?.factor ?? 1;
    const grams = massValue * from;
    const res = grams / to;
    return formatUnitOutput(res);
  }, [massValue, massFrom, massTo]);

  const tempResult = useMemo(() => {
    const toK = (v: number, unit: TempUnit) => {
      if (unit === 'C') return v + 273.15;
      if (unit === 'F') return (v - 32) * (5 / 9) + 273.15;
      return v;
    };
    const fromK = (k: number, unit: TempUnit) => {
      if (unit === 'C') return k - 273.15;
      if (unit === 'F') return (k - 273.15) * (9 / 5) + 32;
      return k;
    };

    const kVal = toK(tempValue, tempFrom);
    const res = fromK(kVal, tempTo);
    return formatUnitOutput(res);
  }, [tempValue, tempFrom, tempTo]);

  const pxFromCm = useMemo(() => {
    const pxf = dpiValue / 2.54;
    const pxW = Math.round(dpiWidthCm * pxf);
    const pxH = Math.round(dpiHeightCm * pxf);
    if (!isFinite(pxW) || !isFinite(pxH)) return '—';
    return `${pxW} x ${pxH}`;
  }, [dpiWidthCm, dpiHeightCm, dpiValue]);

  const cmFromPx = useMemo(() => {
    const factor = pxDpi === 0 ? Infinity : 2.54 / pxDpi;
    const cmW = pxWidth * factor;
    const cmH = pxHeight * factor;
    const formattedW = formatUnitOutput(cmW);
    const formattedH = formatUnitOutput(cmH);
    if (formattedW === '—' || formattedH === '—') return '—';
    return `${formattedW} x ${formattedH}`;
  }, [pxWidth, pxHeight, pxDpi]);

  return (
    <div className="space-y-6" id="conversor">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 9</p>
        <h2 className="text-2xl font-bold">Conversor de Unidades</h2>
        <p className="text-sm text-muted-foreground">Longitud, área, peso, temperatura y conversión de píxeles a tamaño físico en un solo lugar.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold">Longitud</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Valor</span>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.0001"
                value={lenValue}
                onChange={(e) => setLenValue(parseMoney(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">De</span>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={lenFrom}
                onChange={(e) => setLenFrom(e.target.value as LengthUnit)}
              >
                {lengthUnits.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">A</span>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={lenTo}
                onChange={(e) => setLenTo(e.target.value as LengthUnit)}
              >
                {lengthUnits.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Resultado</span>
              <Input type="text" readOnly value={lengthResult} />
            </div>
          </div>
        </div>

        <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold">Área</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Valor</span>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.0001"
                value={areaValue}
                onChange={(e) => setAreaValue(parseMoney(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">De</span>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={areaFrom}
                onChange={(e) => setAreaFrom(e.target.value as AreaUnit)}
              >
                {areaUnits.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">A</span>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={areaTo}
                onChange={(e) => setAreaTo(e.target.value as AreaUnit)}
              >
                {areaUnits.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Resultado</span>
              <Input type="text" readOnly value={areaResult} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold">Peso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Valor</span>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.0001"
                value={massValue}
                onChange={(e) => setMassValue(parseMoney(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">De</span>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={massFrom}
                onChange={(e) => setMassFrom(e.target.value as MassUnit)}
              >
                {massUnits.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">A</span>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={massTo}
                onChange={(e) => setMassTo(e.target.value as MassUnit)}
              >
                {massUnits.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Resultado</span>
              <Input type="text" readOnly value={massResult} />
            </div>
          </div>
        </div>

        <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold">Temperatura</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Valor</span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={tempValue}
                onChange={(e) => setTempValue(parseMoney(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">De</span>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value as TempUnit)}
              >
                <option value="C">°C</option>
                <option value="F">°F</option>
                <option value="K">K</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">A</span>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value as TempUnit)}
              >
                <option value="C">°C</option>
                <option value="F">°F</option>
                <option value="K">K</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Resultado</span>
              <Input type="text" readOnly value={tempResult} />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">Píxeles ↔ Tamaño físico (DPI)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Anchura (cm)</span>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={dpiWidthCm}
              onChange={(e) => setDpiWidthCm(parseMoney(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Altura (cm)</span>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={dpiHeightCm}
              onChange={(e) => setDpiHeightCm(parseMoney(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">DPI</span>
            <Input
              type="number"
              inputMode="decimal"
              step="1"
              value={dpiValue}
              onChange={(e) => setDpiValue(parseMoney(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Salida (px)</span>
            <Input type="text" readOnly value={pxFromCm} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Anchura (px)</span>
            <Input
              type="number"
              inputMode="decimal"
              step="1"
              value={pxWidth}
              onChange={(e) => setPxWidth(parseMoney(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Altura (px)</span>
            <Input
              type="number"
              inputMode="decimal"
              step="1"
              value={pxHeight}
              onChange={(e) => setPxHeight(parseMoney(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">DPI</span>
            <Input
              type="number"
              inputMode="decimal"
              step="1"
              value={pxDpi}
              onChange={(e) => setPxDpi(parseMoney(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Salida (cm)</span>
            <Input type="text" readOnly value={cmFromPx} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Fórmulas: px = cm x (DPI / 2.54); cm = px x (2.54 / DPI).</p>
      </div>
    </div>
  );
}
