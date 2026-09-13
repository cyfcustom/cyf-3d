import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useAtom } from 'jotai';
import * as fabric from 'fabric';
import { ChevronsUp, FlipHorizontal2, Maximize, Copy, Trash2 } from 'lucide-react';
import { layersAtom, Layer } from '../../store/atoms';
import type { SectionId } from '../../types/sections';

export interface FabricEditorHandle {
  getCanvasDataURL: () => string;
  addImageFromURL: (url: string, layerId: string) => void;
}

interface FabricEditorProps {
  width?: number;
  height?: number;
  activeSection: SectionId;
  onCanvasUpdate: (dataURL: string) => void;
}

const CANVAS_SIZE = 600;
const PRINT_W = 400;
const PRINT_H = 500;
const PRINT_X = (CANVAS_SIZE - PRINT_W) / 2;
const PRINT_Y = (CANVAS_SIZE - PRINT_H) / 2;
// Floor on Fabric scaleX — keeps the image visible if the user collapses
// a corner handle to 0 (which would otherwise render a 0×0 image and
// make the 3D projection read as "microscopic").
const MIN_SCALE = 0.02;

function clampScale(obj: fabric.Object | undefined) {
  if (!obj) return;
  const sx = obj.scaleX ?? 1;
  const sy = obj.scaleY ?? 1;
  if (sx < MIN_SCALE) obj.set({ scaleX: MIN_SCALE, scaleY: MIN_SCALE });
  else if (sy < MIN_SCALE) obj.set({ scaleX: MIN_SCALE, scaleY: MIN_SCALE });
}

const SECTION_DISPLAY: Record<SectionId, string> = {
  front: 'Frente',
  back: 'Espalda',
  inside: 'Interior',
  neck: 'Cuello',
  left_sleeve: 'Manga I',
  right_sleeve: 'Manga D',
};

export const FabricEditor = forwardRef<FabricEditorHandle, FabricEditorProps>(
  function FabricEditor({ width = CANVAS_SIZE, height = CANVAS_SIZE, activeSection, onCanvasUpdate }, ref) {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fcRef = useRef<fabric.Canvas | null>(null);
    const [layers, setLayers] = useAtom(layersAtom);
    const suppressSyncRef = useRef(false);
    const [toolbar, setToolbar] = useState<{
      visible: boolean;
      left: number;
      top: number;
    } | null>(null);

    // Export handle
    useImperativeHandle(ref, () => ({
      getCanvasDataURL: () => {
        const fc = fcRef.current;
        if (!fc) return '';
        return fc.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 4,
          left: PRINT_X,
          top: PRINT_Y,
          width: PRINT_W,
          height: PRINT_H,
        } as fabric.TDataUrlOptions);
      },
      addImageFromURL: (url: string, layerId: string) => {
        const fc = fcRef.current;
        if (!fc) return;
        fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
          const maxDim = Math.min(PRINT_W, PRINT_H) * 0.6;
          const scale = maxDim / Math.max(img.width!, img.height!);
          img.set({
            left: CANVAS_SIZE / 2,
            top: CANVAS_SIZE / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
          });
          (img as any).data = { layerId, side: activeSection };
          fc.add(img);
          fc.setActiveObject(img);
          fc.requestRenderAll();
          emitUpdate();
        });
      },
    }));

    const emitUpdate = useCallback(() => {
      const fc = fcRef.current;
      if (!fc) return;
      const dataURL = fc.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 4,
        left: PRINT_X,
        top: PRINT_Y,
        width: PRINT_W,
        height: PRINT_H,
      } as fabric.TDataUrlOptions);
      onCanvasUpdate(dataURL);
    }, [onCanvasUpdate]);

    // Sync fabric objects → Jotai layers
    const syncToAtoms = useCallback(() => {
      const fc = fcRef.current;
      if (!fc || suppressSyncRef.current) return;

      suppressSyncRef.current = true;
      setLayers((prev) => {
        const updated = prev.map((layer) => {
          const obj = fc.getObjects().find((o: any) => o.data?.layerId === layer.id);
          if (!obj) return layer;
          // Convert Fabric's absolute scaleX back to the shared
          // "fraction of print area width" unit used by Babylon.
          //  scaleX = scaleX_frac * naturalWidth / PRINT_W
          const fabScale = obj.scaleX ?? 1;
          const sharedScale = layer.naturalWidth
            ? (fabScale * layer.naturalWidth) / PRINT_W
            : fabScale;
          return {
            ...layer,
            x: (obj.left ?? CANVAS_SIZE / 2) / CANVAS_SIZE,
            y: (obj.top ?? CANVAS_SIZE / 2) / CANVAS_SIZE,
            scale: sharedScale,
            rotation: obj.angle ?? 0,
            flipX: !!obj.flipX,
            flipY: !!obj.flipY,
          };
        });
        return updated;
      });
      setTimeout(() => { suppressSyncRef.current = false; }, 50);
      emitUpdate();
    }, [setLayers, emitUpdate]);

    // Initialize canvas
    useEffect(() => {
      if (!canvasElRef.current) return;
      const fc = new fabric.Canvas(canvasElRef.current, {
        backgroundColor: 'rgba(0,0,0,0)',
        preserveObjectStacking: true,
        width,
        height,
        selection: true,
      });
      fcRef.current = fc;

      // Dashed print area border
      const border = new fabric.Rect({
        left: PRINT_X,
        top: PRINT_Y,
        width: PRINT_W,
        height: PRINT_H,
        fill: 'transparent',
        stroke: '#9CA3AF',
        strokeDashArray: [8, 4],
        strokeWidth: 1.5,
        selectable: false,
        evented: false,
      });
      fc.add(border);

      // Clip path for print area
      fc.clipPath = new fabric.Rect({
        left: PRINT_X,
        top: PRINT_Y,
        width: PRINT_W,
        height: PRINT_H,
        absolutePositioned: true,
      });

      // Events
      fc.on('object:modified', (e) => {
        clampScale(e.target);
        syncToAtoms();
        updateToolbar();
      });
      fc.on('object:moved', (e) => {
        syncToAtoms();
        updateToolbar();
      });
      fc.on('object:scaled', (e) => {
        clampScale(e.target);
        syncToAtoms();
        updateToolbar();
      });
      fc.on('object:rotated', (e) => {
        syncToAtoms();
        updateToolbar();
      });

      // Selection tracking — drives the floating action toolbar position
      const updateToolbar = () => {
        const obj = fc.getActiveObject();
        if (!obj || !(obj as any).data?.layerId) {
          setToolbar(null);
          return;
        }
        const canvas = canvasElRef.current;
        if (!canvas) return;
        const bounds = obj.getBoundingRect(true, true);
        const canvasRect = canvas.getBoundingClientRect();
        const zoom = canvasRect.width / CANVAS_SIZE;
        const left = canvasRect.left + (bounds.left + bounds.width / 2) * zoom;
        const top  = canvasRect.top  + (bounds.top + bounds.height) * zoom + 12;
        setToolbar({ visible: true, left, top });
      };

      fc.on('selection:created', updateToolbar);
      fc.on('selection:updated', updateToolbar);
      fc.on('selection:cleared', () => setToolbar(null));

      return () => {
        fc.dispose();
        fcRef.current = null;
      };
    }, [width, height]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter objects by active section
    useEffect(() => {
      const fc = fcRef.current;
      if (!fc) return;
      fc.getObjects().forEach((obj: any) => {
        if (!obj.data?.layerId) return; // skip border rect
        const objSide = obj.data?.side || 'front';
        obj.set({ visible: objSide === activeSection, selectable: objSide === activeSection });
      });
      fc.requestRenderAll();
      emitUpdate();
    }, [activeSection, emitUpdate]);

    // Sync layers from Jotai → fabric (when layers added/removed externally)
    useEffect(() => {
      const fc = fcRef.current;
      if (!fc || suppressSyncRef.current) return;

      const existingIds = new Set(
        fc.getObjects()
          .filter((o: any) => o.data?.layerId)
          .map((o: any) => o.data.layerId)
      );
      const layerIds = new Set(layers.map((l) => l.id));

      // Remove objects whose layer was deleted
      const toRemove = fc.getObjects().filter((o: any) => o.data?.layerId && !layerIds.has(o.data.layerId));
      toRemove.forEach((o) => fc.remove(o));

      // Add new layers that don't have fabric objects yet
      for (const layer of layers) {
        if (existingIds.has(layer.id)) continue;
        // Load image
        fabric.FabricImage.fromURL(layer.thumbnail, { crossOrigin: 'anonymous' }).then((img) => {
          if (!fcRef.current) return;
          // Convert shared "fraction of print area width" → Fabric's
          // absolute scaleX (fraction of natural image size).
          //  scaleX = (PRINT_W * sharedScale) / naturalWidth
          const sharedScale = layer.scale ?? 0.5;
          const naturalW = layer.naturalWidth ?? img.width ?? 1;
          const targetWidth = PRINT_W * sharedScale;
          const fabScale = targetWidth / naturalW;
          img.set({
            left: (layer.x ?? 0.5) * CANVAS_SIZE,
            top: (layer.y ?? 0.4) * CANVAS_SIZE,
            originX: 'center',
            originY: 'center',
            scaleX: fabScale,
            scaleY: fabScale,
            angle: layer.rotation ?? 0,
            flipX: !!layer.flipX,
            flipY: !!layer.flipY,
            visible: (layer.side || 'front') === activeSection,
            selectable: (layer.side || 'front') === activeSection,
          });
          (img as any).data = { layerId: layer.id, side: layer.side || 'front' };
          fcRef.current!.add(img);
          fcRef.current!.requestRenderAll();
          emitUpdate();
        });
      }

      if (toRemove.length > 0) {
        fc.requestRenderAll();
        emitUpdate();
      }
    }, [layers, activeSection, emitUpdate]);

    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative bg-muted/20 rounded-xl p-2 overflow-hidden"
          style={{ width: '100%', maxWidth: width, aspectRatio: '1/1' }}
        >
          <canvas
            ref={canvasElRef}
            className="w-full h-full"
          />
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          {SECTION_DISPLAY[activeSection] ?? activeSection} · Arrastra para posicionar la imagen o usa las esquinas para redimensionar
        </p>

        {/* Floating action toolbar — anchored to the selected object's
            bottom-center. 5 actions: layer order, flip H, fit width,
            duplicate, delete. Rendered outside the canvas wrapper so it
            isn't clipped by overflow-hidden. */}
        {toolbar?.visible && (() => {
          const obj = fcRef.current?.getActiveObject() as any;
          if (!obj) return null;

          const bringToFront = () => {
            if (!fcRef.current) return;
            fcRef.current.bringObjectToFront(obj);
            fcRef.current.requestRenderAll();
          };
          const sendToBack = () => {
            if (!fcRef.current) return;
            fcRef.current.sendObjectToBack(obj);
            fcRef.current.requestRenderAll();
          };
          const flipH = () => {
            obj.set('flipX', !obj.flipX);
            fcRef.current?.requestRenderAll();
            syncToAtoms();
          };
          const fitToWidth = () => {
            const currentW = (obj.width ?? 1) * (obj.scaleX ?? 1);
            if (currentW <= 0) return;
            const ratio = PRINT_W / currentW;
            obj.set({
              scaleX: (obj.scaleX ?? 1) * ratio,
              scaleY: (obj.scaleY ?? 1) * ratio,
            });
            fcRef.current?.requestRenderAll();
            syncToAtoms();
          };
          const duplicate = () => {
            const fc = fcRef.current;
            if (!fc) return;
            const layerId = obj.data?.layerId;
            const srcLayer = layers.find(l => l.id === layerId);
            if (!srcLayer) return;

            // Clone via Fabric, offset 20px so the copy is visible next to original.
            const cloned = fabric.util.object.clone(obj) as fabric.Object;
            cloned.set({
              left: (obj.left ?? 0) + 20,
              top:  (obj.top  ?? 0) + 20,
            });
            const newId = `${Date.now()}-copy`;
            (cloned as any).data = {
              layerId: newId,
              side: srcLayer.side,
            };
            fc.add(cloned);
            fc.setActiveObject(cloned);
            fc.requestRenderAll();

            // Mirror layer in jotai so 3D + sidebar reflect the new layer.
            const newLayer: Layer = {
              ...srcLayer,
              id: newId,
              x: ((cloned.left ?? 0) / CANVAS_SIZE),
              y: ((cloned.top  ?? 0) / CANVAS_SIZE),
            };
            setLayers(prev => [...prev, newLayer]);
          };
          const removeSelected = () => {
            const fc = fcRef.current;
            if (!fc) return;
            const layerId = (obj as any).data?.layerId;
            fc.remove(obj);
            fc.requestRenderAll();
            if (layerId) {
              setLayers(prev => prev.filter(l => l.id !== layerId));
            }
            setToolbar(null);
          };

          // Mirror buttons. Width is fixed so left/top math is predictable.
          const toolbarWidth = 240;
          const halfW = toolbarWidth / 2;
          return (
            <div
              data-testid="fabric-toolbar"
              style={{
                position: 'fixed',
                left: toolbar.left - halfW,
                top: toolbar.top,
                width: toolbarWidth,
                zIndex: 50,
              }}
              className="flex items-center justify-around bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-xl px-2 py-1.5"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* 1. Layer ordering — up + down in one icon group */}
              <div className="flex items-center bg-muted rounded-full overflow-hidden">
                <button
                  onClick={bringToFront}
                  title="Traer al frente"
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                >
                  <ChevronsUp size={14} className="rotate-180" />
                </button>
                <button
                  onClick={sendToBack}
                  title="Enviar al fondo"
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                >
                  <ChevronsUp size={14} />
                </button>
              </div>

              {/* 2. Flip horizontal */}
              <button
                onClick={flipH}
                title="Voltear horizontal (espejo)"
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <FlipHorizontal2 size={16} />
              </button>

              {/* 3. Fit to print area width */}
              <button
                onClick={fitToWidth}
                title="Ajustar al ancho del área de impresión"
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <Maximize size={16} />
              </button>

              {/* 4. Duplicate */}
              <button
                onClick={duplicate}
                title="Duplicar capa"
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <Copy size={16} />
              </button>

              {/* 5. Delete — red, on the right end */}
              <button
                onClick={removeSelected}
                title="Eliminar capa"
                className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })()}
      </div>
    );
  }
);
