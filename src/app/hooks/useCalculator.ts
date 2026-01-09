import { useState } from 'react';

type Operation = '+' | '-' | '×' | '÷' | null;

interface CalculatorState {
  currentValue: string;
  previousValue: string | null;
  operation: Operation;
  handleNumber: (digit: string) => void;
  handleOperation: (op: Exclude<Operation, null>) => void;
  calculate: () => void;
  reset: () => void;
}

const formatResult = (value: number) => {
  const rounded = Math.round((value + Number.EPSILON) * 1e6) / 1e6;
  return Number.isFinite(rounded) ? rounded.toString() : 'Error';
};

export function useCalculator(): CalculatorState {
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);

  const reset = () => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const handleNumber = (digit: string) => {
    setCurrentValue((prev) => {
      if (digit === '.' && prev.includes('.')) return prev;
      if (prev === '0' && digit !== '.') return digit;
      if (prev === '-0' && digit !== '.') return `-${digit}`;
      return `${prev}${digit}`;
    });
  };

  const performCalculation = (prev: number, curr: number, op: Exclude<Operation, null>): string => {
    switch (op) {
      case '+':
        return formatResult(prev + curr);
      case '-':
        return formatResult(prev - curr);
      case '×':
        return formatResult(prev * curr);
      case '÷':
        if (curr === 0) return 'Error';
        return formatResult(prev / curr);
      default:
        return '0';
    }
  };

  const handleOperation = (op: Exclude<Operation, null>) => {
    if (currentValue === 'Error') {
      reset();
      return;
    }

    if (previousValue !== null && operation) {
      const prev = parseFloat(previousValue);
      const curr = parseFloat(currentValue);
      const result = performCalculation(prev, curr, operation);
      setPreviousValue(result === 'Error' ? null : result);
      setCurrentValue('0');
      setOperation(op);
      return;
    }

    setPreviousValue(currentValue);
    setCurrentValue('0');
    setOperation(op);
  };

  const calculate = () => {
    if (operation === null || previousValue === null) return;

    const prev = parseFloat(previousValue);
    const curr = parseFloat(currentValue);
    const result = performCalculation(prev, curr, operation);

    setCurrentValue(result);
    setPreviousValue(null);
    setOperation(null);
  };

  return {
    currentValue,
    previousValue,
    operation,
    handleNumber,
    handleOperation,
    calculate,
    reset,
  };
}
