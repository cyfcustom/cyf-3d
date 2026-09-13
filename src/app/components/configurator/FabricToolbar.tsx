import { ChevronsUp, FlipHorizontal2, Maximize, Copy, Trash2 } from 'lucide-react';
import * as fabric from 'fabric';
import { CANVAS_SIZE } from './fabricConstants';

/**
 * Floating action toolbar that follows the selected object's bottom-center.
 * 5 actions: layer order (▼/▲), flip H, fit width, duplicate, delete.
 *
 * Positioning is `position: fixed` and computed by the parent FabricEditor
 * from `canvas.getBoundingClientRect()` + zoom + object bounds, so this
 * component is pure: it just renders the buttons at a given viewport
 * position.
 */

interface FabricToolbarProps {
  visible: boolean;
  left: number;     // viewport X of the desired center
  top: number;      // viewport Y of the desired top
  activeObject: fabric.Object | null;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onFlipH: () => void;
  onFitWidth: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const TOOLBAR_WIDTH = 240;
const HALF_WIDTH = TOOLBAR_WIDTH / 2;

export function FabricToolbar({
  visible,
  left,
  top,
  activeObject,
  onBringToFront,
  onSendToBack,
  onFlipH,
  onFitWidth,
  onDuplicate,
  onDelete,
}: FabricToolbarProps) {
  if (!visible || !activeObject) return null;

  return (
    <div
      data-testid="fabric-toolbar"
      style={{
        position: 'fixed',
        left: left - HALF_WIDTH,
        top,
        width: TOOLBAR_WIDTH,
        zIndex: 50,
      }}
      className="flex items-center justify-around bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-xl px-2 py-1.5"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 1. Layer ordering — up + down in one icon group */}
      <div className="flex items-center bg-muted rounded-full overflow-hidden">
        <button
          onClick={onSendToBack}
          title="Enviar al fondo"
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          <ChevronsUp size={14} className="rotate-180" />
        </button>
        <button
          onClick={onBringToFront}
          title="Traer al frente"
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          <ChevronsUp size={14} />
        </button>
      </div>

      {/* 2. Flip horizontal */}
      <button
        onClick={onFlipH}
        title="Voltear horizontal (espejo)"
        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
      >
        <FlipHorizontal2 size={16} />
      </button>

      {/* 3. Fit to print area width */}
      <button
        onClick={onFitWidth}
        title="Ajustar al ancho del área de impresión"
        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
      >
        <Maximize size={16} />
      </button>

      {/* 4. Duplicate */}
      <button
        onClick={onDuplicate}
        title="Duplicar capa"
        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
      >
        <Copy size={16} />
      </button>

      {/* 5. Delete — red, on the right end */}
      <button
        onClick={onDelete}
        title="Eliminar capa"
        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

/** Re-export for callers that need to compute positions. */
export const FABRIC_TOOLBAR_WIDTH = TOOLBAR_WIDTH;
export const FABRIC_TOOLBAR_OFFSET_Y = 12;
export { CANVAS_SIZE };
