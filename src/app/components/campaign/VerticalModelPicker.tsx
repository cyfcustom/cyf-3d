import { useEffect, useRef } from 'react';
import { cn } from '../ui/utils';

export interface VerticalModelOption {
  id: string;
  name: string;
  url: string;
}

interface VerticalModelPickerProps {
  models: VerticalModelOption[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Border colour applied to the active item. */
  activeBorderColor?: string;
}

/**
 * Vertical scrolling model picker with seamless infinite scroll.
 *
 * The list is rendered triplicated so when the user scrolls past the
 * "real" middle copy into a duplicated zone, the scroll position is
 * silently reset to the equivalent position in the real copy — giving
 * the illusion of an infinite loop (after the last model, the first
 * appears again).
 *
 * The active item is rendered larger (w-20 h-20) with a coloured
 * border; inactive items are smaller (w-14 h-14) and dimmed. On click
 * or external activeId change, the middle copy's instance of the
 * active item is smoothly scrolled into the centre so the user always
 * re-enters the "real" zone.
 */
export function VerticalModelPicker({
  models,
  activeId,
  onSelect,
  activeBorderColor = '#0F4C81',
}: VerticalModelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Need at least 2 items for the wrap-around to feel natural with 3
  // copies. With 1 item the triplication would show the same item
  // three times in a row.
  const supportsLoop = models.length >= 2;
  const display = supportsLoop ? [...models, ...models, ...models] : models;
  const initialMountRef = useRef(true);

  // Loop reset: silently jump to the equivalent position in the middle
  // copy when entering the first/third duplicated zones.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !supportsLoop) return;
    const onScroll = () => {
      const total = el.scrollHeight;
      const third = total / 3;
      if (total === 0) return;
      if (el.scrollTop < third * 0.5) {
        el.scrollTop += third;
      } else if (el.scrollTop > third * 2.5) {
        el.scrollTop -= third;
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [supportsLoop]);

  // Centre the active item (in the middle copy) when activeId changes
  // or on first mount. Smooth on subsequent changes, instant on mount.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || models.length === 0) return;

    const third = supportsLoop ? el.scrollHeight / 3 : 0;
    const buttons = el.querySelectorAll<HTMLButtonElement>('[data-model-id]');
    let target: HTMLButtonElement | undefined;
    for (const btn of Array.from(buttons)) {
      if (btn.dataset.modelId !== activeId) continue;
      if (!supportsLoop) {
        target = btn;
        break;
      }
      const top = btn.offsetTop;
      if (top >= third && top < third * 2) {
        target = btn;
        break;
      }
    }
    if (!target) return;

    const offset =
      target.offsetTop - el.clientHeight / 2 + target.clientHeight / 2;

    if (initialMountRef.current) {
      el.scrollTop = offset;
      initialMountRef.current = false;
    } else {
      el.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }, [activeId, supportsLoop, models.length]);

  if (models.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto"
      style={{ scrollbarWidth: 'thin' }}
    >
      <div className="flex flex-col items-center gap-3 py-3">
        {display.map((m, i) => {
          const isActive = m.id === activeId;
          return (
            <button
              key={`${m.id}-${i}`}
              data-model-id={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={cn(
                'shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300',
                isActive
                  ? 'h-20 w-20 scale-105 shadow-lg'
                  : 'h-14 w-14 opacity-60 hover:scale-105 hover:opacity-100'
              )}
              style={isActive ? { borderColor: activeBorderColor } : undefined}
              aria-label={m.name}
              aria-pressed={isActive}
            >
              <img
                src={m.url}
                alt={m.name}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}