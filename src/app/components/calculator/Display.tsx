interface DisplayProps {
  currentValue: string;
  previousValue: string | null;
  operation: string | null;
}

export function Display({ currentValue, previousValue, operation }: DisplayProps) {
  return (
    <div className="w-full rounded-2xl bg-slate-900 text-right text-white p-4 shadow-inner min-h-[96px] flex flex-col justify-center gap-1">
      <div className="text-sm text-slate-300 truncate min-h-[20px]">
        {previousValue && (
          <span>
            {previousValue} {operation ?? ''}
          </span>
        )}
      </div>
      <div className="text-3xl sm:text-4xl font-semibold break-words" data-testid="calculator-display">
        {currentValue}
      </div>
    </div>
  );
}
