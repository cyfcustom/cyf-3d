/**
 * Shared calculation utilities for all calculators
 * Pure functions - no side effects
 */

import { clampNumber } from '@/app/lib/money';
import type {
  DirectCostItem,
  DepreciationItem,
  IndirectCosts,
  LaborCosts,
  FinancialSettings,
  PerUnitCosts,
  CalculationTotals,
} from './types';

// ============================================================================
// COST CALCULATIONS
// ============================================================================

/**
 * Calculate total direct costs per unit
 */
export function calculateDirectCosts(items: DirectCostItem[]): number {
  return items.reduce((sum, item) => {
    if (!item.enabled) return sum;
    const price = clampNumber(item.price, 0);
    const qty = clampNumber(item.quantity, 0);
    if (qty === 0) return sum;
    return sum + price / qty;
  }, 0);
}

/**
 * Calculate total depreciation per unit
 * Supports two modes: 'month' (24-month depreciation) and 'life' (total lifetime)
 */
export function calculateDepreciation(items: DepreciationItem[]): number {
  return items.reduce((sum, item) => {
    if (!item.enabled) return sum;
    const price = clampNumber(item.price, 0);

    if (item.mode === 'life') {
      const lifeUnits = clampNumber(item.lifeUnits, 1);
      return sum + price / lifeUnits;
    }

    // mode === 'month'
    const monthlyDepreciation = price / 24; // 24 months
    const unitsPerMonth = clampNumber(item.unitsPerMonth, 1);
    return sum + monthlyDepreciation / unitsPerMonth;
  }, 0);
}

/**
 * Calculate indirect costs per unit
 * Distributes monthly overhead across production volume
 */
export function calculateIndirectCosts(costs: IndirectCosts): number {
  if (!costs.enabled) return 0;

  const monthlyTotal =
    clampNumber(costs.monthly.rent, 0) +
    clampNumber(costs.monthly.internet, 0) +
    clampNumber(costs.monthly.subscriptions, 0) +
    clampNumber(costs.monthly.transport, 0) +
    clampNumber(costs.monthly.electricity, 0) +
    clampNumber(costs.monthly.advertising, 0) +
    clampNumber(costs.monthly.other, 0);

  const unitsPerMonth = clampNumber(costs.unitsPerMonth, 1);
  return monthlyTotal / unitsPerMonth;
}

/**
 * Calculate labor cost per unit
 * Based on time and hourly rate
 */
export function calculateLaborCosts(labor: LaborCosts): number {
  if (!labor.enabled) return 0;

  const hoursPerMonth = clampNumber(labor.hoursPerMonth, 1);
  const salary = clampNumber(labor.salary, 0);
  const costPerHour = salary / hoursPerMonth;

  const setupMinutes = clampNumber(labor.setupMinutes, 0);
  const runMinutesPerUnit = clampNumber(labor.runMinutesPerUnit, 0);
  const unitsPerBatch = clampNumber(labor.unitsPerBatch, 1);

  // Total time = setup + (run time x units in batch)
  const totalMinutes = setupMinutes + runMinutesPerUnit * unitsPerBatch;
  const totalHours = totalMinutes / 60;
  const totalCost = costPerHour * totalHours;

  // Distribute across batch
  return totalCost / unitsPerBatch;
}

/**
 * Apply profit margin
 */
export function calculateProfit(
  subtotal: number,
  settings: FinancialSettings
): number {
  if (!settings.applyProfit) return 0;
  const percentage = clampNumber(settings.profitPct, 0, 1000);
  return subtotal * (percentage / 100);
}

/**
 * Apply tax
 */
export function calculateTax(
  subtotalWithProfit: number,
  settings: FinancialSettings
): number {
  if (!settings.applyTax) return 0;
  const percentage = clampNumber(settings.taxPct, 0, 1000);
  return subtotalWithProfit * (percentage / 100);
}

// ============================================================================
// COMPOSITE CALCULATIONS
// ============================================================================

/**
 * Calculate complete per-unit costs
 */
export function calculatePerUnitCosts(
  directCosts: DirectCostItem[] = [],
  depreciation: DepreciationItem[] = [],
  indirectCosts?: IndirectCosts,
  laborCosts?: LaborCosts,
  financials: FinancialSettings = {
    profitPct: 0,
    taxPct: 0,
    applyProfit: false,
    applyTax: false,
  }
): PerUnitCosts {
  const direct = calculateDirectCosts(directCosts);
  const dep = calculateDepreciation(depreciation);
  const indirect = indirectCosts ? calculateIndirectCosts(indirectCosts) : 0;
  const labor = laborCosts ? calculateLaborCosts(laborCosts) : 0;

  const subtotalBeforeProfitAndTax = direct + dep + indirect;
  const subtotal = subtotalBeforeProfitAndTax + labor;

  const profit = calculateProfit(subtotal, financials);
  const tax = calculateTax(subtotal + profit, financials);

  return {
    direct,
    depreciation: dep,
    indirect,
    labor,
    subtotalBeforeProfitAndTax,
    subtotal,
    profit,
    tax,
    total: subtotal + profit + tax,
  };
}

/**
 * Calculate totals for a given quantity
 */
export function calculateTotals(
  perUnit: PerUnitCosts,
  quantity: number
): CalculationTotals {
  const qty = clampNumber(quantity, 1, 1e6);

  return {
    perUnit,
    quantity: qty,
    subtotalBeforeProfitAndTax: perUnit.subtotalBeforeProfitAndTax * qty,
    subtotal: perUnit.subtotal * qty,
    totalProfit: perUnit.profit * qty,
    totalTax: perUnit.tax * qty,
    total: perUnit.total * qty,
  };
}

// ============================================================================
// VINYL-SPECIFIC CALCULATIONS
// ============================================================================

/**
 * Calculate with waste/scrap percentage
 * Used by Vinyl calculator
 */
export function applyWastePercentage(
  baseCost: number,
  wastePercentage: number
): number {
  const wastePct = clampNumber(wastePercentage, 0, 100);
  const wasteFactor = 1 + wastePct / 100;
  return baseCost * wasteFactor;
}

/**
 * Vinyl-specific total calculation
 */
export function calculateVinylPerUnit(
  directCosts: DirectCostItem[],
  depreciation: DepreciationItem[],
  extrasPerUnit: number,
  wastePct: number,
  financials: FinancialSettings
): PerUnitCosts {
  const direct = calculateDirectCosts(directCosts);
  const dep = calculateDepreciation(depreciation);
  const extras = clampNumber(extrasPerUnit, 0);

  const basePerUnit = direct + dep + extras;
  const afterWaste = applyWastePercentage(basePerUnit, wastePct);

  const profit = calculateProfit(afterWaste, financials);
  const tax = calculateTax(afterWaste + profit, financials);

  return {
    direct,
    depreciation: dep,
    indirect: extras, // Using 'indirect' field for extras
    labor: 0,
    subtotalBeforeProfitAndTax: basePerUnit,
    subtotal: afterWaste,
    profit,
    tax,
    total: afterWaste + profit + tax,
  };
}

// ============================================================================
// SHIPPING-SPECIFIC CALCULATIONS
// ============================================================================

/**
 * Calculate shipping costs
 */
export function calculateShippingCosts(
  courierEnabled: boolean,
  baseRate: number,
  km: number,
  kmRate: number,
  kg: number,
  kgRate: number,
  packagingEnabled: boolean,
  packagingCost: number,
  fragileEnabled: boolean,
  fragileCost: number,
  insuranceEnabled: boolean,
  insurancePercentage: number,
  otherCosts: number
): { courier: number; extras: number; total: number } {
  const courier = courierEnabled
    ? clampNumber(baseRate, 0) +
      clampNumber(km, 0) * clampNumber(kmRate, 0) +
      clampNumber(kg, 0) * clampNumber(kgRate, 0)
    : 0;

  const extrasBase =
    (packagingEnabled ? clampNumber(packagingCost, 0) : 0) +
    (fragileEnabled ? clampNumber(fragileCost, 0) : 0) +
    clampNumber(otherCosts, 0);

  const insurance = insuranceEnabled
    ? (courier + extrasBase) * (clampNumber(insurancePercentage, 0) / 100)
    : 0;

  const extras = extrasBase + insurance;

  return {
    courier,
    extras,
    total: courier + extras,
  };
}

// ============================================================================
// DTF-SPECIFIC CALCULATIONS
// ============================================================================

/**
 * Calculate DTF totals based on modality and design parameters
 */
export function calculateDtfTotals(state: any) {
  const ANCHO = 57;
  const unitLen = state.modality === 'a3' ? 42 : state.modality === 'tramo30' ? 30 : 100;

  const designLength = state.calcByDesign
    ? (() => {
        const cols = Math.max(1, Math.floor(ANCHO / Math.max(0.1, state.designWidthCm)));
        const rows = Math.ceil(Math.max(1, state.designCount) / cols);
        return rows * state.designHeightCm;
      })()
    : state.lengthCm;

  const unitsChargedRaw = designLength / unitLen;
  const unitsCharged = state.respectMinimum ? Math.max(1, Math.ceil(unitsChargedRaw)) : unitsChargedRaw;

  const directCost = clampNumber(unitsCharged * state.pricePerUnit, 0, 1e12);

  const designCount = Math.max(1, state.designCount);

  const extrasFixed =
    clampNumber(state.extras.shipping, 0, 1e12) +
    clampNumber(state.extras.design, 0, 1e12) +
    clampNumber(state.extras.other, 0, 1e12);
  const pressTotal = clampNumber(state.extras.press, 0, 1e12) * designCount;
  const extrasSum = extrasFixed + pressTotal;

  const garmentUnit = state.garment.count > 0 ? state.garment.packPrice / state.garment.count : 0;
  const garmentTotal = state.garment.enabled ? garmentUnit * designCount : 0;

  const depPerUnit = state.depreciation.enabled ? state.depreciation.price / state.depreciation.lifeUnits : 0;
  const depTotal = depPerUnit * designCount;

  const indirectBase = (() => {
    const m = state.indirectCosts.monthly;
    const monthlyTotal =
      m.rent + m.internet + m.subscriptions + m.transport + m.electricity + m.advertising + m.other;
    return monthlyTotal / Math.max(1, state.indirectCosts.unitsPerMonth);
  })();
  const indirectPerUnit = state.indirectCosts.enabled ? indirectBase : 0;
  const indirectTotal = indirectPerUnit * designCount;

  const laborPerUnit = state.laborCosts.enabled
    ? (() => {
        const costPerMinute =
          state.laborCosts.hoursPerMonth > 0
            ? state.laborCosts.salary / (state.laborCosts.hoursPerMonth * 60)
            : 0;
        const totalMinutes =
          state.laborCosts.setupMinutes + state.laborCosts.runMinutesPerUnit * state.laborCosts.unitsPerBatch;
        return state.laborCosts.unitsPerBatch > 0 ? (totalMinutes * costPerMinute) / state.laborCosts.unitsPerBatch : 0;
      })()
    : 0;
  const laborTotal = laborPerUnit * designCount;

  const subtotal = directCost + extrasSum + garmentTotal + depTotal + indirectTotal + laborTotal;

  const profitVal = state.financials.applyProfit ? subtotal * (state.financials.profitPct / 100) : 0;
  const taxVal = state.financials.applyTax
    ? (subtotal + profitVal) * (state.financials.taxPct / 100)
    : 0;
  const total = subtotal + profitVal + taxVal;

  const perDesignDirect = designCount > 0 ? directCost / designCount : 0;
  const perDesignExtras = designCount > 0 ? extrasFixed / designCount : 0;
  const costPerStamp =
    perDesignDirect + perDesignExtras + state.extras.press + depPerUnit + indirectPerUnit + laborPerUnit;
  const costPerShirt = garmentUnit + costPerStamp;

  return {
    designLength,
    unitsCharged,
    directCost,
    extrasSum,
    pressTotal,
    garmentUnit,
    garmentTotal,
    depPerUnit,
    depTotal,
    indirectPerUnit,
    indirectTotal,
    laborPerUnit,
    laborTotal,
    subtotalBeforeFinancials: subtotal,
    profit: profitVal,
    tax: taxVal,
    total,
    perDesignDirect,
    perDesignExtras,
    costPerStamp,
    costPerShirt,
    designCount,
  };
}

// ============================================================================
// SPHERES-SPECIFIC CALCULATIONS
// ============================================================================

/**
 * Calculate Spheres totals with special profit mode (markup vs margin)
 */
export function calculateSpheresTotals(state: any) {
  const directPerUnit = state.directCosts.reduce((sum: number, item: any) => {
    if (!item.enabled) return sum;
    const qty = clampNumber(item.quantity, 0.0001, 1e9);
    return sum + item.price / qty;
  }, 0);

  const depreciationPerUnit = state.depreciation.reduce((sum: number, item: any) => {
    if (!item.enabled) return sum;
    if (item.mode === 'life') {
      const life = clampNumber(item.lifeUnits ?? 0, 1, 1e9);
      return sum + item.price / life;
    }
    const units = clampNumber(item.unitsPerMonth ?? 100, 1, 1e9);
    const perMonth = item.price / 24;
    return sum + perMonth / units;
  }, 0);

  const indirectBase = (() => {
    const monthly = state.indirectCosts.monthly;
    const monthlyTotal =
      monthly.rent +
      monthly.internet +
      monthly.subscriptions +
      monthly.transport +
      monthly.electricity +
      monthly.advertising +
      monthly.other;
    const units = clampNumber(state.indirectCosts.unitsPerMonth, 1, 1e9);
    return monthlyTotal / units;
  })();
  const indirectApplied = state.indirectCosts.enabled ? indirectBase : 0;

  const laborBase = (() => {
    const salary = clampNumber(state.laborCosts.salary, 0, 1e9);
    const hours = clampNumber(state.laborCosts.hoursPerMonth, 0, 1e6);
    const setup = clampNumber(state.laborCosts.setupMinutes, 0, 1e6);
    const run = clampNumber(state.laborCosts.runMinutesPerUnit, 0, 1e6);
    const units = clampNumber(state.laborCosts.unitsPerBatch, 1, 1e6);
    const costPerMinute = hours > 0 ? salary / (hours * 60) : 0;
    const totalMinutes = setup + run * units;
    return units > 0 ? (totalMinutes * costPerMinute) / units : 0;
  })();
  const laborApplied = state.laborCosts.enabled ? laborBase : 0;

  const subtotalBeforeFinancials = directPerUnit + depreciationPerUnit + indirectApplied + laborApplied;

  const profitPct = clampNumber(state.financials.profitPct, 0, 1000);
  const taxPct = clampNumber(state.financials.taxPct, 0, 1000);
  const profitVal = state.financials.applyProfit
    ? state.profitMode === 'margin'
      ? subtotalBeforeFinancials * (profitPct / Math.max(1, 100 - profitPct))
      : subtotalBeforeFinancials * (profitPct / 100)
    : 0;
  const taxVal = state.financials.applyTax ? (subtotalBeforeFinancials + profitVal) * (taxPct / 100) : 0;
  const perUnitTotal = subtotalBeforeFinancials + profitVal + taxVal;

  const qty = clampNumber(state.quantity, 1, 1e6);
  const multiplier = state.quantityEnabled ? qty : 1;

  return {
    perUnit: {
      direct: directPerUnit,
      depreciation: depreciationPerUnit,
      indirectBase,
      indirectApplied,
      laborBase,
      laborApplied,
      base: subtotalBeforeFinancials,
      profit: profitVal,
      tax: taxVal,
      total: perUnitTotal,
    },
    quantity: multiplier,
    quantityEnabled: state.quantityEnabled,
    subtotalBeforeFinancials: subtotalBeforeFinancials * multiplier,
    totalProfit: profitVal * multiplier,
    totalTax: taxVal * multiplier,
    total: perUnitTotal * multiplier,
  };
}
