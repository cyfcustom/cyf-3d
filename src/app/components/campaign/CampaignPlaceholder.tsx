import { cn } from '../ui/utils';

interface CampaignPlaceholderProps {
  /** Headline shown beneath the CYF isotipo. */
  message?: string;
  /** Optional secondary line (e.g. context about what's coming next). */
  hint?: string;
  /** Outer sizing — matches the CampaignViewer's container. */
  className?: string;
}

/**
 * Static placeholder shown in place of the 3D viewer while the public
 * 'seul' folder is loading, or when it's empty. Renders the CYF isotipo
 * over a soft gradient background so the visual rhythm of the section
 * stays intact and no fake/test model is exposed to the visitor.
 */
export function CampaignPlaceholder({
  message = 'Cargando diseños…',
  hint,
  className,
}: CampaignPlaceholderProps) {
  return (
    <div
      className={cn(
        'aspect-square w-[min(100%,400px)] shrink-0 overflow-hidden rounded-3xl border border-gray-200',
        'bg-gradient-to-b from-[#E8EEF7] via-[#DCE5F1] to-[#C9D6EA]',
        'flex items-center justify-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="animate-in fade-in flex flex-col items-center gap-3 px-6 text-center duration-700">
        <img
          src="/CYF CUSTOM_isotipo circular negro.png"
          alt="CYF Custom"
          className="h-20 w-20 opacity-90 sm:h-24 sm:w-24"
        />
        <p className="text-sm font-semibold text-gray-700 sm:text-base">{message}</p>
        {hint && <p className="text-xs text-gray-500 sm:text-sm">{hint}</p>}
      </div>
    </div>
  );
}
