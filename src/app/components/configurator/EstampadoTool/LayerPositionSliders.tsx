import { useAtom } from 'jotai';
import { layersAtom } from '../../../store/atoms';
import type { SectionId } from '../../../types/sections';

interface LayerPositionSlidersProps {
  activeSection: SectionId;
}

/**
 * Compact X/Y sliders (0-100) for the first visible layer in the active
 * section. Pairs with the Fabric canvas drag — gives precise control when
 * the user wants numeric positioning.
 *
 * Returns null when there's no layer in the active section (so the section
 * tab state is rendered without the controls).
 */
export function LayerPositionSliders({ activeSection }: LayerPositionSlidersProps) {
  const [layers, setLayers] = useAtom(layersAtom);

  const targetLayer = layers.find(l => (l.side || 'front') === activeSection);
  if (!targetLayer) return null;

  const x = targetLayer.x ?? 0.5;
  const y = targetLayer.y ?? 0.4;

  const update = (next: { x?: number; y?: number }) => {
    setLayers(prev => prev.map(l =>
      l.id === targetLayer.id ? { ...l, ...next } : l
    ));
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Pos. X
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {Math.round(x * 100)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(x * 100)}
          onChange={e => update({ x: parseInt(e.target.value, 10) / 100 })}
          className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Pos. Y
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {Math.round(y * 100)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(y * 100)}
          onChange={e => update({ y: parseInt(e.target.value, 10) / 100 })}
          className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
}
