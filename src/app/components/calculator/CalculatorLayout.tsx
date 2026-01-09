import { Display } from './Display';
import { CalcButton } from './CalcButton';

interface CalculatorLayoutProps {
  currentValue: string;
  previousValue: string | null;
  operation: string | null;
  onNumber: (digit: string) => void;
  onOperation: (op: '+' | '-' | '×' | '÷') => void;
  onCalculate: () => void;
  onReset: () => void;
}

export function CalculatorLayout({
  currentValue,
  previousValue,
  operation,
  onNumber,
  onOperation,
  onCalculate,
  onReset,
}: CalculatorLayoutProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Calculadora de gastos</h1>
        <p className="text-sm text-muted-foreground">
          Calcula rápidamente sumas, restas, multiplicaciones y divisiones. Optimizada para móvil y desktop.
        </p>
      </div>

      <Display currentValue={currentValue} previousValue={previousValue} operation={operation} />

      <div className="grid grid-cols-4 gap-3">
        <CalcButton tone="ghost" onClick={onReset}>
          AC
        </CalcButton>
        <CalcButton tone="ghost" onClick={() => onOperation('÷')}>
          ÷
        </CalcButton>
        <CalcButton tone="ghost" onClick={() => onOperation('×')}>
          ×
        </CalcButton>
        <CalcButton tone="ghost" onClick={() => onOperation('-')}>
          −
        </CalcButton>

        {[7, 8, 9].map((n) => (
          <CalcButton key={n} onClick={() => onNumber(String(n))}>
            {n}
          </CalcButton>
        ))}
        <CalcButton tone="ghost" onClick={() => onOperation('+')}>
          +
        </CalcButton>

        {[4, 5, 6].map((n) => (
          <CalcButton key={n} onClick={() => onNumber(String(n))}>
            {n}
          </CalcButton>
        ))}
        <CalcButton tone="primary" className="row-span-2" onClick={onCalculate}>
          =
        </CalcButton>

        {[1, 2, 3].map((n) => (
          <CalcButton key={n} onClick={() => onNumber(String(n))}>
            {n}
          </CalcButton>
        ))}

        <CalcButton spanTwoCols onClick={() => onNumber('0')}>
          0
        </CalcButton>
        <CalcButton onClick={() => onNumber('.')}>.</CalcButton>
        <div className="h-full" />
      </div>
    </div>
  );
}
