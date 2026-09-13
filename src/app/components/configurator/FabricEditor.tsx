import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useAtom } from 'jotai';
import * as fabric from 'fabric';
import { layersAtom, Layer } from '../../store/atoms';
import type { SectionId } from '../../types/sections';
import {
  CANVAS_SIZE,
  SECTION_DISPLAY,
  getPrintRect,
  clampScale,
} from './fabricConstants';
import {
  FabricToolbar,
  FABRIC_TOOLBAR_OFFSET_Y,
} from './FabricToolbar';
import { useFabricToolbarActions } from './useFabricToolbarActions';

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
          left: 0,
          top: 0,
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
        } as fabric.TDataUrlOptions);
      },
      addImageFromURL: (url: string, layerId: string) => {
        const fc = fcRef.current;
        if (!fc) return;
        fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
          const maxDim = Math.min(width, height) * 0.6;
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
        left: 0,
        top: 0,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
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
          const fabScale = obj.scaleX ?? 1;
          const sharedScale = layer.naturalWidth
            ? (fabScale * layer.naturalWidth) / (getPrintRect(activeSection).width)
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
    }, [setLayers, emitUpdate, activeSection]);

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
      const printRect = getPrintRect(activeSection);
      const border = new fabric.Rect({
        left: printRect.x,
        top: printRect.y,
        width: printRect.width,
        height: printRect.height,
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
        left: printRect.x,
        top: printRect.y,
        width: printRect.width,
        height: printRect.height,
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
        const top  = canvasRect.top  + (bounds.top + bounds.height) * zoom + FABRIC_TOOLBAR_OFFSET_Y;
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
        if (!obj.data?.layerId) return;
        const objSide = obj.data?.side || 'front';
        obj.set({ visible: objSide === activeSection, selectable: objSide === activeSection });
      });
      fc.requestRenderAll();
      emitUpdate();
    }, [activeSection, emitUpdate]);

    // Update border + clip path when active section changes (so the
    // dashed rectangle matches the section's print-area dimensions).
    useEffect(() => {
      const fc = fcRef.current;
      if (!fc) return;
      const printRect = getPrintRect(activeSection);
      const border = fc.getObjects().find((o: any) => !o.data?.layerId);
      if (border) {
        border.set({
          left: printRect.x,
          top: printRect.y,
          width: printRect.width,
          height: printRect.height,
        });
      }
      fc.clipPath = new fabric.Rect({
        left: printRect.x,
        top: printRect.y,
        width: printRect.width,
        height: printRect.height,
        absolutePositioned: true,
      });
      fc.requestRenderAll();
    }, [activeSection]);

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
      const printRect = getPrintRect(activeSection);
      for (const layer of layers) {
        if (existingIds.has(layer.id)) continue;
        fabric.FabricImage.fromURL(layer.thumbnail, { crossOrigin: 'anonymous' }).then((img) => {
          if (!fcRef.current) return;
          const sharedScale = layer.scale ?? 0.5;
          const naturalW = layer.naturalWidth ?? img.width ?? 1;
          const fabScale = (printRect.width * sharedScale) / naturalW;
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

    // ── Floating toolbar actions (extracted to a hook for readability) ──
    const toolbarActions = useFabricToolbarActions({
      fcRef,
      activeSection,
      layers,
      setLayers,
      syncToAtoms,
      clearToolbar: () => setToolbar(null),
    });

    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative bg-muted/20 rounded-xl p-2 overflow-hidden"
          style={{ width: '100%', maxWidth: width, aspectRatio: '1/1' }}
        >
          <canvas ref={canvasElRef} className="w-full h-full" />
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          {SECTION_DISPLAY[activeSection] ?? activeSection} · Arrastra para posicionar la imagen o usa las esquinas para redimensionar
        </p>

        <FabricToolbar
          visible={toolbar?.visible ?? false}
          left={toolbar?.left ?? 0}
          top={toolbar?.top ?? 0}
          activeObject={fcRef.current?.getActiveObject() ?? null}
          onBringToFront={toolbarActions.bringToFront}
          onSendToBack={toolbarActions.sendToBack}
          onFlipH={toolbarActions.flipH}
          onFitWidth={toolbarActions.fitToWidth}
          onDuplicate={toolbarActions.duplicate}
          onDelete={toolbarActions.removeSelected}
        />
      </div>
    );
  }
);
