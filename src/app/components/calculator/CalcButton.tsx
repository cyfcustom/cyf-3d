import { ComponentProps } from 'react';
import { cn } from '@/app/components/ui/utils';

interface CalcButtonProps extends ComponentProps<'button'> {
  tone?: 'primary' | 'secondary' | 'ghost';
  spanTwoCols?: boolean;
}

export function CalcButton({
  tone = 'secondary',
  spanTwoCols = false,
  className,
  children,
  ...rest
}: CalcButtonProps) {
  const tones: Record<NonNullable<CalcButtonProps['tone']>, string> = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    secondary: 'bg-slate-800 text-white hover:bg-slate-700',
    ghost: 'bg-slate-700 text-white hover:bg-slate-600',
  };

  return (
    <button
      className={cn(
        'rounded-xl py-4 text-lg font-semibold shadow-lg transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500',
        tones[tone],
        spanTwoCols ? 'col-span-2' : '',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
