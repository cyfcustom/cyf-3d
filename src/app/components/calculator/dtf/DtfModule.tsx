import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useSummaryReporter } from '../summary/summaryContext';

export function DtfModule() {
  const { t } = useTranslation('calculator');
  const calc = useDtfCalculator();
  const { state, totals } = calc;
  useSummaryReporter('dtf', totals.total);

  const modalityLabel = useMemo(() => {
    switch (state.modality) {
      case 'tramo30':
        return t('dtf.segment30Label');
      case 'a3':
        return t('dtf.a3Label');
      default:
        return t('dtf.meterLineal');
    }
  }, [state.modality, t]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.modalityLength')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={state.modality} onValueChange={(v) => calc.setModality(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metro">{t('dtf.meter')}</TabsTrigger>
                <TabsTrigger value="tramo30">{t('dtf.segment30')}</TabsTrigger>
                <TabsTrigger value="a3">{t('dtf.a3')}</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor="pricePerUnit">{t('dtf.pricePerUnit', { modality: modalityLabel })}</Label>
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
                <Label>{t('dtf.respectMinimum')}</Label>
                <p className="text-sm text-muted-foreground">{t('dtf.respectMinimumDesc')}</p>
              </div>
              <Switch checked={state.respectMinimum} onCheckedChange={(v) => calc.setRespectMinimum(v)} />
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label>{t('dtf.calcByDesign')}</Label>
                <Switch checked={state.calcByDesign} onCheckedChange={(v) => calc.setCalcByDesign(v)} />
              </div>
              {state.calcByDesign ? (
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>{t('dtf.designs')}</Label>
                    <Input
                      type="number"
                      min={1}
                      value={state.designCount}
                      onChange={(e) => calc.setDesignCount(parseMoney(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>{t('dtf.widthCm')}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={state.designWidthCm}
                      onChange={(e) => calc.setDesignWidthCm(parseMoney(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>{t('dtf.heightCm')}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={state.designHeightCm}
                      onChange={(e) => calc.setDesignHeightCm(parseMoney(e.target.value))}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{t('dtf.calculatedLength', { length: totals.designLength.toFixed(1) })}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>{t('dtf.lengthCm')}</Label>
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
            <CardTitle>{t('sections.extras')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                { key: 'shipping', label: t('dtf.extras.shipping') },
                { key: 'design', label: t('dtf.extras.design') },
                { key: 'press', label: t('dtf.extras.press') },
                { key: 'other', label: t('dtf.extras.other') },
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
            <CardTitle>{t('sections.garment')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('dtf.includeGarment')}</Label>
                <p className="text-sm text-muted-foreground">{t('dtf.garmentDesc')}</p>
              </div>
              <Switch checked={state.garment.enabled} onCheckedChange={(v) => calc.setGarment({ enabled: v })} />
            </div>
            {state.garment.enabled && (
              <div className="grid gap-2">
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>{t('dtf.garment.piecesPerPack')}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={state.garment.count}
                    onChange={(e) => calc.setGarment({ count: parseMoney(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>{t('fields.packagePrice')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={state.garment.packPrice}
                    onChange={(e) => calc.setGarment({ packPrice: parseMoney(e.target.value) })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{t('dtf.garmentCostPerUnit')} {formatMoney(totals.garmentUnit, 'USD')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sections.depreciationPress')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('dtf.includeDepreciation')}</Label>
                <p className="text-sm text-muted-foreground">{t('dtf.depreciationDesc')}</p>
              </div>
              <Switch checked={state.depreciation.enabled} onCheckedChange={(v) => calc.setDepreciation({ enabled: v })} />
            </div>
            {state.depreciation.enabled && (
              <div className="grid gap-2">
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>{t('dtf.depreciation.pressPrice')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={state.depreciation.price}
                    onChange={(e) => calc.setDepreciation({ price: parseMoney(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>{t('fields.usefulLifeStamps')}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={state.depreciation.lifeUnits}
                    onChange={(e) => calc.setDepreciation({ lifeUnits: parseMoney(e.target.value) })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{t('dtf.depreciationPerUnit')} {formatMoney(totals.depPerUnit, 'USD')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sections.indirectCosts')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('descriptions.prorateMonthly')}</Label>
                <p className="text-sm text-muted-foreground">{t('descriptions.prorateMonthlyDesc')}</p>
              </div>
              <Switch checked={state.indirect.enabled} onCheckedChange={(v) => calc.setIndirect({ enabled: v })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {([
                ['rent', t('indirectCosts.rent')],
                ['internet', t('indirectCosts.internet')],
                ['subscriptions', t('indirectCosts.subscriptions')],
                ['transport', t('indirectCosts.transport')],
                ['electricity', t('indirectCosts.electricity')],
                ['advertising', t('indirectCosts.advertising')],
                ['other', t('indirectCosts.other')],
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
                <Label>{t('fields.unitsPerMonth')}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.indirect.unitsPerMonth}
                  onChange={(e) => calc.setIndirect({ unitsPerMonth: parseMoney(e.target.value) || 1 })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t('dtf.indirectsPerUnit')} {formatMoney(totals.indirectPerUnit, 'USD')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sections.labor')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('descriptions.applyMO')}</Label>
                <p className="text-sm text-muted-foreground">{t('descriptions.applyMODesc')}</p>
              </div>
              <Switch checked={state.labor.enabled} onCheckedChange={(v) => calc.setLabor({ enabled: v })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>{t('fields.monthlySalary')}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.labor.salary}
                  onChange={(e) => calc.setLabor({ salary: parseMoney(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>{t('fields.hoursPerMonth')}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.labor.hoursPerMonth}
                  onChange={(e) => calc.setLabor({ hoursPerMonth: parseMoney(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>{t('fields.setupMin')}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.labor.setupMinutes}
                  onChange={(e) => calc.setLabor({ setupMinutes: parseMoney(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>{t('dtf.laborCard.runPerUnit')}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.labor.runMinutesPerUnit}
                  onChange={(e) => calc.setLabor({ runMinutesPerUnit: parseMoney(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>{t('fields.unitsPerBatch')}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={state.labor.unitsPerBatch}
                  onChange={(e) => calc.setLabor({ unitsPerBatch: parseMoney(e.target.value) || 1 })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t('dtf.moPerUnit')} {formatMoney(totals.laborPerUnit, 'USD')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sections.expensesTaxes')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('fields.applyProfitLabel')}</Label>
              </div>
              <Switch checked={state.applyProfit} onCheckedChange={(v) => calc.setApplyProfit(v)} />
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <Label>{t('dtf.gi.profitPct')}</Label>
              <Input
                type="number"
                min={0}
                value={state.profitPct}
                onChange={(e) => calc.setProfitPct(parseMoney(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{t('fields.applyTaxLabel')}</Label>
              </div>
              <Switch checked={state.applyTax} onCheckedChange={(v) => calc.setApplyTax(v)} />
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <Label>{t('dtf.gi.taxPct')}</Label>
              <Input
                type="number"
                min={0}
                value={state.taxPct}
                onChange={(e) => calc.setTaxPct(parseMoney(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>{t('summaryLabels.lengthCharged')}</span>
              <span>{totals.designLength.toFixed(1)} cm</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('summaryLabels.unitsCharged')}</span>
              <span>{totals.unitsCharged.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>{t('summaryLabels.directCost')}</span>
              <span>{formatMoney(totals.directCost, 'USD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('summaryLabels.extrasLabel')}</span>
              <span>{formatMoney(totals.extrasSum, 'USD')}</span>
            </div>
            {state.garment.enabled && (
              <div className="flex items-center justify-between">
                <span>{t('sections.garment')}</span>
                <span>{formatMoney(totals.garmentTotal, 'USD')}</span>
              </div>
            )}
            {state.depreciation.enabled && (
              <div className="flex items-center justify-between">
                <span>{t('sections.depreciation')}</span>
                <span>{formatMoney(totals.depTotal, 'USD')}</span>
              </div>
            )}
            {state.indirect.enabled && (
              <div className="flex items-center justify-between">
                <span>{t('summaryLabels.indirectPerUnit')}</span>
                <span>{formatMoney(totals.indirectTotal, 'USD')}</span>
              </div>
            )}
            {state.labor.enabled && (
              <div className="flex items-center justify-between">
                <span>{t('sections.labor')}</span>
                <span>{formatMoney(totals.laborTotal, 'USD')}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>{t('summaryLabels.subtotal')}</span>
              <span>{formatMoney(totals.subtotalBeforeFinancials, 'USD')}</span>
            </div>
            {state.applyProfit && (
              <div className="flex items-center justify-between">
                <span>{t('sections.profit')}</span>
                <span>{formatMoney(totals.profit, 'USD')}</span>
              </div>
            )}
            {state.applyTax && (
              <div className="flex items-center justify-between">
                <span>{t('sections.taxes')}</span>
                <span>{formatMoney(totals.tax, 'USD')}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>{t('summaryLabels.total')}</span>
              <span>{formatMoney(totals.total, 'USD')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sections.unitCosts')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>{t('summaryLabels.directDesign')}</span>
              <span>{formatMoney(totals.perDesignDirect, 'USD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('summaryLabels.extrasPerDesign')}</span>
              <span>{formatMoney(totals.perDesignExtras, 'USD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('summaryLabels.pressPerUnit')}</span>
              <span>{formatMoney(state.extras.press, 'USD')}</span>
            </div>
            {state.depreciation.enabled && (
              <div className="flex items-center justify-between">
                <span>{t('summaryLabels.depreciationPerUnitLong')}</span>
                <span>{formatMoney(totals.depPerUnit, 'USD')}</span>
              </div>
            )}
            {state.indirect.enabled && (
              <div className="flex items-center justify-between">
                <span>{t('summaryLabels.indirectPerUnitLong')}</span>
                <span>{formatMoney(totals.indirectPerUnit, 'USD')}</span>
              </div>
            )}
            {state.labor.enabled && (
              <div className="flex items-center justify-between">
                <span>{t('summaryLabels.moPerUnitLong')}</span>
                <span>{formatMoney(totals.laborPerUnit, 'USD')}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>{t('summaryLabels.costPerStamp')}</span>
              <span>{formatMoney(totals.costPerStamp, 'USD')}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>{t('summaryLabels.costPerShirt')}</span>
              <span>{formatMoney(totals.costPerShirt, 'USD')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sections.notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder={t('dtf.notesPlaceholder')} className="min-h-[120px]" />
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={calc.reset}>
                {t('actions.restart')}
              </Button>
              <Button className="ml-auto" onClick={() => navigator.clipboard.writeText(formatMoney(totals.total, 'USD'))}>
                {t('actions.copyTotal')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
