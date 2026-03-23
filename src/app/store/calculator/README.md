# Calculator Store - Arquitectura Jotai

Sistema centralizado de gestión de estado para todas las calculadoras de CYF Custom usando Jotai.

## 🎯 Características

- ✅ **Persistencia automática** en localStorage con `atomWithStorage`
- ✅ **Cálculos reactivos** con derived atoms
- ✅ **Tipos compartidos** para consistencia
- ✅ **Lógica centralizada** sin duplicación
- ✅ **API ergonómica** con hooks convenientes
- ✅ **Fácil testing** - funciones puras
- ✅ **Preparado para presupuestos/cotizaciones/facturas**

## 📁 Estructura

```
calculator/
├── types.ts          # TypeScript types compartidos
├── calculations.ts   # Funciones puras de cálculo
├── defaults.ts       # Estados por defecto y presets
├── atoms.ts          # Jotai atoms (estado + derivados)
├── hooks.ts          # Hooks convenientes para componentes
├── index.ts          # Exports centralizados
└── README.md         # Esta documentación
```

## 🚀 Uso Básico

### En Componentes

```tsx
import { usePapeleriaCalculator } from '@/app/store/calculator';

function PapeleriaModule() {
  const {
    state,      // Estado actual
    totals,     // Cálculos automáticos (reactive)
    updateDirect,
    setQuantity,
    reset
  } = usePapeleriaCalculator();

  return (
    <div>
      <p>Total: ${totals.total.toFixed(2)}</p>
      <button onClick={() => setQuantity(10)}>
        Set Quantity
      </button>
    </div>
  );
}
```

### Acceso Directo a Atoms

```tsx
import { useAtomValue } from 'jotai';
import { papeleriaTotalsAtom } from '@/app/store/calculator';

function Summary() {
  // Solo lectura, no re-renderiza en cambios de state
  const totals = useAtomValue(papeleriaTotalsAtom);

  return <div>Total: ${totals.total}</div>;
}
```

### Uso Dinámico

```tsx
import { useCalculator } from '@/app/store/calculator';

function DynamicCalculator({ type }: { type: CalculatorType }) {
  const { state, totals } = useCalculator(type);

  return <div>{totals.total}</div>;
}
```

## 📊 Estructura de Datos

### Cost Items

```typescript
// Costos directos (materiales)
interface DirectCostItem {
  id: string;
  label: string;
  enabled: boolean;
  price: number;      // Precio del paquete
  quantity: number;   // Unidades en el paquete
}

// Depreciación (equipos)
type DepreciationItem =
  | {
      mode: 'month';
      price: number;         // Costo del equipo
      unitsPerMonth: number; // Producción mensual
    }
  | {
      mode: 'life';
      price: number;    // Costo del equipo
      lifeUnits: number; // Vida útil total
    };

// Costos indirectos
interface IndirectCosts {
  enabled: boolean;
  monthly: {
    alquiler: number;
    internet: number;
    electricidad: number;
    // ... más campos
  };
  unitsPerMonth: number;
}

// Mano de obra
interface LaborCosts {
  enabled: boolean;
  salary: number;
  hoursPerMonth: number;
  setupMinutes: number;
  runMinutesPerUnit: number;
  unitsPerBatch: number;
}
```

### Calculation Results

```typescript
interface CalculationTotals {
  perUnit: {
    direct: number;
    depreciation: number;
    indirect: number;
    labor: number;
    subtotal: number;
    profit: number;
    tax: number;
    total: number;
  };
  quantity: number;
  total: number;
  // ... más campos
}
```

## 🔧 API de Hooks

### `usePapeleriaCalculator()`

```typescript
const {
  state,                    // Estado completo
  totals,                   // Cálculos reactivos

  // Updaters
  updateDirect,             // (id, patch) => void
  updateDepreciation,       // (id, patch) => void
  setIndirect,              // (patch) => void
  setIndirectMonthly,       // (key, value) => void
  setMo,                    // (patch) => void
  setGananciaPct,           // (value) => void
  setImpuestosPct,          // (value) => void
  setApplyGanancia,         // (value) => void
  setApplyImpuestos,        // (value) => void
  setQuantity,              // (value) => void

  reset,                    // () => void
} = usePapeleriaCalculator();
```

### `useVinilCalculator()`

Similar a Papelería, pero incluye:
- `setExtrasPerUnit(value)` - Extras por unidad
- `setMermaPct(value)` - Porcentaje de merma

### `useEtiquetasCalculator()`

Similar a Papelería, pero incluye:
- `setProductType(type)` - Cambia el tipo de producto y aplica preset

### `useEnviosCalculator()`

Estructura única para envíos:
```typescript
const { state, totals, setField, reset } = useEnviosCalculator();

// state.mensajeria.tipo, state.mensajeria.km, etc.
// totals.mensajeria, totals.extras, totals.total
```

## 🧮 Funciones de Cálculo

Todas las funciones son **puras** (sin side effects) y están en `calculations.ts`:

```typescript
import {
  calculateDirectCosts,
  calculateDepreciation,
  calculateIndirectCosts,
  calculateLaborCosts,
  calculatePerUnitCosts,
  calculateTotals
} from '@/app/store/calculator';

// Usar en custom logic
const directTotal = calculateDirectCosts(items);
const depTotal = calculateDepreciation(equipment);
```

## 🎨 Patrones de Uso

### Actualizar Item Individual

```tsx
// Cambiar precio de un material
updateDirect({
  id: 'sustrato',
  patch: { price: 25 }
});

// Toggle enabled
updateDirect({
  id: 'sustrato',
  patch: { enabled: !state.directCosts[0].enabled }
});
```

### Actualizar Costos Indirectos

```tsx
// Cambiar campo específico
setIndirectMonthly('alquiler', 500);

// Cambiar múltiples campos
setIndirect({
  monthly: {
    ...state.indirectCosts.monthly,
    alquiler: 500,
    internet: 50
  }
});

// Toggle enabled
setIndirect({ enabled: !state.indirectCosts.enabled });
```

### Actualizar Mano de Obra

```tsx
setMo({
  enabled: true,
  salary: 500,
  hoursPerMonth: 176
});
```

### Actualizar Financials

```tsx
setGananciaPct(45);
setImpuestosPct(18);
setApplyGanancia(true);
setApplyImpuestos(true);
```

## 🔄 Migración desde Hooks Anteriores

### Antes (useState hook)

```typescript
const {
  state,
  totals,
  updateDirect,
  setQuantity,
  reset
} = usePapeleriaCalculator(); // Custom hook con useState
```

### Ahora (Jotai atoms)

```typescript
import { usePapeleriaCalculator } from '@/app/store/calculator';

const {
  state,      // Mismo API
  totals,     // Mismo API, pero reactivo con Jotai
  updateDirect,
  setQuantity,
  reset
} = usePapeleriaCalculator(); // Wrapper de Jotai atoms
```

**¡API compatible!** Los componentes existentes funcionarán sin cambios.

## 💾 Persistencia

La persistencia en localStorage es **automática** gracias a `atomWithStorage`:

```typescript
// Se guarda automáticamente en localStorage
export const papeleriaStateAtom = atomWithStorage(
  'papeleria-calculator-v2',  // Key
  PAPELERIA_DEFAULT_STATE     // Default
);
```

- ✅ Auto-save en cada cambio
- ✅ Auto-load al iniciar
- ✅ Manejo de errores integrado
- ✅ Migración de versiones (v1 → v2)

## 🧪 Testing

Las funciones de cálculo son puras, fáciles de testear:

```typescript
import { calculateDirectCosts } from '@/app/store/calculator';

describe('calculateDirectCosts', () => {
  it('calculates per-unit cost', () => {
    const items = [
      { id: '1', enabled: true, price: 100, quantity: 10 }
    ];
    expect(calculateDirectCosts(items)).toBe(10);
  });
});
```

## 🚀 Próximos Pasos: Presupuestos/Cotizaciones

Con esta arquitectura, es fácil agregar:

### 1. Quote Atom (Presupuesto)

```typescript
export interface Quote {
  id: string;
  calculatorType: CalculatorType;
  snapshot: CalculatorState;  // Estado guardado
  totals: CalculationTotals;  // Cálculos guardados
  customer: CustomerInfo;
  createdAt: Date;
  status: 'draft' | 'sent' | 'approved';
}

export const quotesAtom = atomWithStorage<Quote[]>('quotes-v1', []);
```

### 2. Crear Presupuesto desde Calculadora

```typescript
function createQuote(calculatorType: CalculatorType) {
  const atoms = getCalculatorAtoms(calculatorType);
  const state = get(atoms.state);
  const totals = get(atoms.totals);

  const quote: Quote = {
    id: generateId(),
    calculatorType,
    snapshot: state,
    totals,
    customer: {...},
    createdAt: new Date(),
    status: 'draft'
  };

  set(quotesAtom, (prev) => [...prev, quote]);
}
```

### 3. Restaurar Calculadora desde Presupuesto

```typescript
function restoreQuote(quote: Quote) {
  const atoms = getCalculatorAtoms(quote.calculatorType);
  set(atoms.state, quote.snapshot);
}
```

## 📝 Convenciones

- **Atoms**: `camelCaseAtom`
- **Hooks**: `useCamelCase()`
- **Types**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case.ts`

## 🐛 Debugging

Jotai DevTools (opcional):

```tsx
import { DevTools } from 'jotai-devtools';

function App() {
  return (
    <>
      <DevTools />
      <YourApp />
    </>
  );
}
```

## 📚 Referencias

- [Jotai Docs](https://jotai.org/)
- [atomWithStorage](https://jotai.org/docs/utilities/storage)
- [Derived Atoms](https://jotai.org/docs/core/atom#derived-atoms)
