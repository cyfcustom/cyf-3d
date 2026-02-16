import { useMemo } from 'react';
import { useDtfCalculator } from '@/app/store/calculator';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import { useSummaryReporter } from '../resumen/summaryContext';

export function DtfModule() {
  const calc = useDtfCalculator();
  const { state, totals } = calc;
  useSummaryReporter('dtf', totals.total);

  const modalityLabel = useMemo(() => {
    switch (state.modality) {
      case 'tramo30':
        return 'Tramo de 30 cm';
      case 'a3':
        return 'Hoja A3';
      default:
        return 'Metro lineal';
    }
  }, [state.modality]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Modalidad y largo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={state.modality} onValueChange={(v) => calc.setModality(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metro">Metro</TabsTrigger>
                <TabsTrigger value="tramo30">Tramo 30 cm</TabsTrigger>
                <TabsTrigger value="a3">A3</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor="pricePerUnit">Precio por {modalityLabel}</Label>
              <Input
                id="pricePerUnit"
                type="number"
                inputMode="decimal"
                value={state.pricePerUnit}
                onChange={(e) => calc.setPricePerUnit(parseMoney(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div>
                <Label>Respetar cobro mínimo</Label>
                <p className="text-sm text-muted-foreground">Cobra al menos una unidad completa.</p>
              </div>
              <Switch checked={state.respectMinimum} onCheckedChange={(v) => calc.setRespectMinimum(v)} />
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Cálculo por diseño</Label>
                <Switch checked={state.calcByDesign} onCheckedChange={(v) => calc.setCalcByDesign(v)} />
              </div>
              {state.calcByDesign ? (
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>Diseños</Label>
                    <Input
                      type="number"
                      min={1}
                      value={state.designCount}
                      onChange={(e) => calc.setDesignCount(parseMoney(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>Ancho (cm)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={state.designWidthCm}
                      onChange={(e) => calc.setDesignWidthCm(parseMoney(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>Alto (cm)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={state.designHeightCm}
                      onChange={(e) => calc.setDesignHeightCm(parseMoney(e.target.value))}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Largo calculado: {totals.designLength.toFixed(1)} cm.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>Largo (cm)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={state.lengthCm}
                    onChange={(e) => calc.setLengthCm(parseMoney(e.target.value))}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                { key: 'envio', label: 'Envío' },
                { key: 'diseno', label: 'Diseño' },
                { key: 'plancha', label: 'Plancha por unidad' },
                { key: 'otros', label: 'Otros' },
              ] as const
            ).map((item) => (
              <div key={item.key} className="grid grid-cols-2 items-center gap-2">
                <Label>{item.label}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={(state.extras as any)[item.key]}
                  onChange={(e) => calc.setExtras({ [item.key]: parseMoney(e.target.value) } as any)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Incluir prenda</Label>
                <p className="text-sm text-muted-foreground">Costo del paquete dividido entre piezas.</p>
              </div>
              <Switch checked={state.prenda.enabled} onCheckedChange={(v) => calc.setPrenda({ enabled: v })} />
            </div>
            {state.prenda.enabled && (
              <div className="grid gap-2">
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>Piezas por paquete</Label>
                  <Input
                    type="number"
                    min={1}
                    value={state.prenda.count}
                    onChange={(e) => calc.setPrenda({ count: parseMoney(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>Precio del paquete</Label>
                  <Input
                    type="number"
                    min={0}
                    value={state.prenda.packPrice}
                    onChange={(e) => calc.setPrenda({ packPrice: parseMoney(e.target.value) })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Costo prenda/unidad: {formatMoney(totals.prendaUnit, 'USD')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Depreciación plancha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Incluir depreciación</Label>
                <p className="text-sm text-muted-foreground">Precio / vida útil en estampados.</p>
              </div>
              <Switch checked={state.depreciation.enabled} onCheckedChange={(v) => calc.setDepreciation({ enabled: v })} />
            </div>
            {state.depreciation.enabled && (
              <div className="grid gap-2">
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>Precio plancha</Label>
                  <Input
                    type="number"
                    min={0}
                    value={state.depreciation.price}
                    onChange={(e) => calc.setDepreciation({ price: parseMoney(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>Vida útil (estampados)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={state.depreciation.lifeUnits}
                    onChange={(e) => calc.setDepreciation({ lifeUnits: parseMoney(e.target.value) })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Depreciación/unidad: {formatMoney(totals.depPerUnit, 'USD')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Costos indirectos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Prorratear gastos mensuales</Label>
                <p className="text-sm text-muted-foreground">Suma mensual / unidades al mes.</p>
              </div>
              <Switch checked={state.indirect.enabled} onCheckedChange={(v) => calc.setIndirect({ enabled: v })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {([
                ['alquiler', 'Alquiler'],
                ['internet', 'Internet'],
                ['suscripciones', 'Suscripciones'],
                ['transporte', 'Transporte'],
                ['electricidad', 'Electricidad'],
                ['publicidad', 'Publicidad'],
                ['otros', 'Otros'],
              ] as const).map(([key, label]) => (
                <div key={key} className="grid grid-cols-2 items-center gap-2">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={state.indirect.monthly[key]}
                    onChange={(e) => calc.setIndirectMonthly(key, parseMoney(e.target.value))}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Unidades/mes</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.indirect.unitsPerMonth}
                  onChange={(e) => calc.setIndirect({ unitsPerMonth: parseMoney(e.target.value) || 1 })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Indirectos/ud: {formatMoney(totals.indirectPerUnit, 'USD')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mano de obra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Aplicar MO</Label>
                <p className="text-sm text-muted-foreground">(setup + corrida × lote) × tarifa / lote.</p>
              </div>
              <Switch checked={state.mo.enabled} onCheckedChange={(v) => calc.setMo({ enabled: v })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Salario mensual</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.mo.salary}
                  onChange={(e) => calc.setMo({ salary: parseMoney(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Horas al mes</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.mo.hoursPerMonth}
                  onChange={(e) => calc.setMo({ hoursPerMonth: parseMoney(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Setup (min)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.mo.setupMinutes}
                  onChange={(e) => calc.setMo({ setupMinutes: parseMoney(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Corrida/ud (min)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.mo.runMinutesPerUnit}
                  onChange={(e) => calc.setMo({ runMinutesPerUnit: parseMoney(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Unidades por lote</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.mo.unitsPerBatch}
                  onChange={(e) => calc.setMo({ unitsPerBatch: parseMoney(e.target.value) || 1 })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">MO/ud: {formatMoney(totals.moPerUnit, 'USD')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gasto & Impuestos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Aplicar ganancia</Label>
              </div>
              <Switch checked={state.applyGanancia} onCheckedChange={(v) => calc.setApplyGanancia(v)} />
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <Label>Ganancia %</Label>
              <Input
                type="number"
                min={0}
                value={state.gananciaPct}
                onChange={(e) => calc.setGananciaPct(parseMoney(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Aplicar impuestos</Label>
              </div>
              <Switch checked={state.applyImpuestos} onCheckedChange={(v) => calc.setApplyImpuestos(v)} />
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <Label>Impuestos %</Label>
              <Input
                type="number"
                min={0}
                value={state.impuestosPct}
                onChange={(e) => calc.setImpuestosPct(parseMoney(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Largo cobrado</span>
              <span>{totals.designLength.toFixed(1)} cm</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Unidades cobradas</span>
              <span>{totals.unitsCharged.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>Costo directo</span>
              <span>{formatMoney(totals.directCost, 'USD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Extras</span>
              <span>{formatMoney(totals.extrasSum, 'USD')}</span>
            </div>
            {state.prenda.enabled && (
              <div className="flex items-center justify-between">
                <span>Prenda</span>
                <span>{formatMoney(totals.prendaTotal, 'USD')}</span>
              </div>
            )}
            {state.depreciation.enabled && (
              <div className="flex items-center justify-between">
                <span>Depreciación</span>
                <span>{formatMoney(totals.depTotal, 'USD')}</span>
              </div>
            )}
            {state.indirect.enabled && (
              <div className="flex items-center justify-between">
                <span>Indirectos</span>
                <span>{formatMoney(totals.indirectTotal, 'USD')}</span>
              </div>
            )}
            {state.mo.enabled && (
              <div className="flex items-center justify-between">
                <span>Mano de obra</span>
                <span>{formatMoney(totals.moTotal, 'USD')}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotalSinGI, 'USD')}</span>
            </div>
            {state.applyGanancia && (
              <div className="flex items-center justify-between">
                <span>Ganancia</span>
                <span>{formatMoney(totals.ganancia, 'USD')}</span>
              </div>
            )}
            {state.applyImpuestos && (
              <div className="flex items-center justify-between">
                <span>Impuestos</span>
                <span>{formatMoney(totals.impuestos, 'USD')}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(totals.total, 'USD')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Costos unitarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Diseño directo</span>
              <span>{formatMoney(totals.perDesignDirect, 'USD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Extras por diseño</span>
              <span>{formatMoney(totals.perDesignExtras, 'USD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Plancha por unidad</span>
              <span>{formatMoney(state.extras.plancha, 'USD')}</span>
            </div>
            {state.depreciation.enabled && (
              <div className="flex items-center justify-between">
                <span>Depreciación por unidad</span>
                <span>{formatMoney(totals.depPerUnit, 'USD')}</span>
              </div>
            )}
            {state.indirect.enabled && (
              <div className="flex items-center justify-between">
                <span>Indirectos por unidad</span>
                <span>{formatMoney(totals.indirectPerUnit, 'USD')}</span>
              </div>
            )}
            {state.mo.enabled && (
              <div className="flex items-center justify-between">
                <span>MO por unidad</span>
                <span>{formatMoney(totals.moPerUnit, 'USD')}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Costo por estampado</span>
              <span>{formatMoney(totals.costPerStamp, 'USD')}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Costo por camiseta</span>
              <span>{formatMoney(totals.costPerShirt, 'USD')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Notas y observaciones" className="min-h-[120px]" />
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={calc.reset}>
                Reiniciar
              </Button>
              <Button className="ml-auto" onClick={() => navigator.clipboard.writeText(formatMoney(totals.total, 'USD'))}>
                Copiar total
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
