import { CalculatorLayout } from '../components/calculator/CalculatorLayout';
import { useCalculator } from '../hooks/useCalculator';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function CalculatorPage() {
  const { currentValue, previousValue, operation, handleNumber, handleOperation, calculate, reset } = useCalculator();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full px-4 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <CalculatorLayout
            currentValue={currentValue}
            previousValue={previousValue}
            operation={operation}
            onNumber={handleNumber}
            onOperation={handleOperation}
            onCalculate={calculate}
            onReset={reset}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
