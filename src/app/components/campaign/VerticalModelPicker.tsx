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
  /** Border colour applied to the active (centre) item. */
  activeBorderColor?: string;
}

// Five fixed vertical slots. The middle one is the active/selected item
// and is rendered larger; the slots above and below taper down. Gaps are
// uniform so the layout reads as a single stacked carousel column.
const SLOT_HEIGHTS = [44, 56, 76, 56, 44] as const;
const SLOT_GAP = 4;
const CENTER_SLOT = 2;
const TOTAL_HEIGHT =
  SLOT_HEIGHTS.reduce((a, b) => a + b, 0) + SLOT_GAP * (SLOT_HEIGHTS.length - 1);

function slotTop(slot: number): number {
  let t = 0;
  for (let i = 0; i < slot; i++) t += SLOT_HEIGHTS[i] + SLOT_GAP;
  return t;
}

/**
 * Vertical carousel picker with 5 visible slots and seamless infinite scroll.
 *
 * The middle slot is always the selected item (larger + coloured border).
 * Scrolling (wheel / touch) advances the carousel by one step; clicking a
 * non-centre slot brings that item to the centre. Wrap-around is invisible
 * because we map `activeId` onto an internal centre index that walks through
 * a tripled copy of the list — visible items always come from the middle
 * copy, so scrolling past the last item wraps cleanly to the first one.
 *
 * Fully controlled: `activeId` drives everything via derivation; clicks /
 * wheel / swipe invoke `onSelect(model.id)` which bubbles back up so the
 * parent's selection stays in sync with the visual centre.
 */
export function VerticalModelPicker({
  models,
  activeId,
  onSelect,
  activeBorderColor = '#0F4C81',
}: VerticalModelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const n = models.length;

  // Derive the centre index from props. If `activeId` doesn't match any
  // model (e.g. right after mount), fall back to the first item.
  const activeIdx = models.findIndex((m) => m.id === activeId);
  const safeActiveIdx = activeIdx >= 0 ? activeIdx : 0;
  // Map to the middle-copy index in the tripled list so the slots above
  // and below the centre land on neighbours of the same logical item.
  const centerIdx = n + safeActiveIdx;

  // Mutable ref so wheel/touch handlers always read the latest props
  // (the listeners are attached once per `n` change, not per render).
  const stateRef = useRef({ n, models, onSelect, safeActiveIdx });
  stateRef.current = { n, models, onSelect, safeActiveIdx };

  function selectByDelta(delta: number) {
    const { n: nn, models: ms, onSelect: sel, safeActiveIdx: ai } = stateRef.current;
    if (nn < 2) return;
    const nextIdx = ((ai + delta) % nn + nn) % nn;
    const m = ms[nextIdx];
    if (m) sel(m.id);
  }

  // Wheel: lock to one step per animation frame so trackpad inertia
  // doesn't blow past several items in a single tick.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || n < 2) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelLockRef.current) return;
      wheelLockRef.current = true;
      selectByDelta(e.deltaY > 0 ? 1 : -1);
      requestAnimationFrame(() => {
        wheelLockRef.current = false;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [n]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current == null || n < 2) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (Math.abs(dy) < 24) return;
    selectByDelta(dy < 0 ? 1 : -1);
  }

  function onSlotClick(slot: number) {
    if (slot < 0 || slot > 4 || slot === CENTER_SLOT || n < 2) return;
    const offset = slot - CENTER_SLOT; // -2..+2 (excluding 0)
    // The clicked slot's model is at tripledIdx = centerIdx + offset.
    // Map back to the original list index and notify the parent.
    const newIdx = ((centerIdx + offset) % n + n) % n;
    const m = models[newIdx];
    if (m) onSelect(m.id);
  }

  if (n === 0) {
    return <div style={{ height: TOTAL_HEIGHT }} aria-hidden />;
  }

  if (n === 1) {
    const model = models[0];
    return (
      <div
        ref={containerRef}
        className="relative w-full select-none"
        style={{ height: TOTAL_HEIGHT }}
      >
        <button
          type="button"
          onClick={() => onSelect(model.id)}
          aria-label={model.name}
          aria-pressed
          className="absolute left-1/2 overflow-hidden rounded-xl border-2 shadow-lg"
          style={{
            top: slotTop(CENTER_SLOT),
            width: SLOT_HEIGHTS[CENTER_SLOT],
            height: SLOT_HEIGHTS[CENTER_SLOT],
            transform: 'translateX(-50%)',
            borderColor: activeBorderColor,
          }}
        >
          <img
            src={model.url}
            alt={model.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </button>
      </div>
    );
  }

  // n >= 2 — render the tripled list. Every model gets a stable key tied
  // to its position in the tripled list, so when `centerIdx` changes
  // (because `activeId` changed upstream) each item's DOM node animates
  // between slots via the CSS transition.
  const tripled = [...models, ...models, ...models];

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none touch-none"
      style={{ height: TOTAL_HEIGHT }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {tripled.map((model, tripledIdx) => {
        const offset = tripledIdx - centerIdx;
        const slot = offset + CENTER_SLOT;
        const visible = slot >= 0 && slot <= 4;
        const isCenter = offset === 0;
        const top = visible
          ? slotTop(slot)
          : slot < 0
            ? -SLOT_HEIGHTS[0] - 8
            : TOTAL_HEIGHT + 8;
        const size = visible ? SLOT_HEIGHTS[slot] : SLOT_HEIGHTS[0];
        return (
          <button
            key={tripledIdx}
            type="button"
            onClick={() => onSlotClick(slot)}
            aria-hidden={!visible}
            tabIndex={visible ? 0 : -1}
            aria-label={model.name}
            aria-pressed={isCenter}
            className={cn(
              'absolute left-1/2 overflow-hidden rounded-xl border-2 transition-all duration-300 ease-out',
              visible ? '' : 'pointer-events-none opacity-0',
              isCenter ? 'z-10 shadow-lg' : '',
              visible && !isCenter ? 'opacity-70 hover:opacity-100' : ''
            )}
            style={{
              top,
              width: size,
              height: size,
              transform: 'translateX(-50%)',
              borderColor: isCenter ? activeBorderColor : 'transparent',
            }}
          >
            <img
              src={model.url}
              alt={model.name}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
}
