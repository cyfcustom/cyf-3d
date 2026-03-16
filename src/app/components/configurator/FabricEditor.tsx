import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useAtom } from 'jotai';
import * as fabric from 'fabric';
import { layersAtom, Layer } from '../../store/atoms';

export interface FabricEditorHandle {
  getCanvasDataURL: () => string;
  addImageFromURL: (url: string, layerId: string) => void;
}

interface FabricEditorProps {
  width?: number;
  height?: number;
  activeSide: 'front' | 'back';
  onCanvasUpdate: (dataURL: string) => void;
}

const CANVAS_SIZE = 600;
const PRINT_W = 400;
const PRINT_H = 500;
const PRINT_X = (CANVAS_SIZE - PRINT_W) / 2;
const PRINT_Y = (CANVAS_SIZE - PRINT_H) / 2;

export const FabricEditor = forwardRef<FabricEditorHandle, FabricEditorProps>(
  function FabricEditor({ width = CANVAS_SIZE, height = CANVAS_SIZE, activeSide, onCanvasUpdate }, ref) {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fcRef = useRef<fabric.Canvas | null>(null);
    const [layers, setLayers] = useAtom(layersAtom);
    const suppressSyncRef = useRef(false);

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
          (img as any).data = { layerId, side: activeSide };
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
          return {
            ...layer,
            x: (obj.left ?? CANVAS_SIZE / 2) / CANVAS_SIZE,
            y: (obj.top ?? CANVAS_SIZE / 2) / CANVAS_SIZE,
            scale: obj.scaleX ?? 1,
            rotation: obj.angle ?? 0,
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
      fc.on('object:modified', syncToAtoms);
      fc.on('object:moved', syncToAtoms);
      fc.on('object:scaled', syncToAtoms);
      fc.on('object:rotated', syncToAtoms);

      return () => {
        fc.dispose();
        fcRef.current = null;
      };
    }, [width, height]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter objects by activeSide
    useEffect(() => {
      const fc = fcRef.current;
      if (!fc) return;
      fc.getObjects().forEach((obj: any) => {
        if (!obj.data?.layerId) return; // skip border rect
        const objSide = obj.data?.side || 'front';
        obj.set({ visible: objSide === activeSide, selectable: objSide === activeSide });
      });
      fc.requestRenderAll();
      emitUpdate();
    }, [activeSide, emitUpdate]);

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
          const maxDim = Math.min(PRINT_W, PRINT_H) * 0.6;
          const baseScale = maxDim / Math.max(img.width!, img.height!);
          const scale = baseScale * (layer.scale ?? 1);
          img.set({
            left: (layer.x ?? 0.5) * CANVAS_SIZE,
            top: (layer.y ?? 0.4) * CANVAS_SIZE,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            angle: layer.rotation ?? 0,
            visible: (layer.side || 'front') === activeSide,
            selectable: (layer.side || 'front') === activeSide,
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
    }, [layers, activeSide, emitUpdate]);

    return (
      <div className="flex items-center justify-center bg-muted/20 rounded-xl p-2 overflow-hidden">
        <div className="relative" style={{ width, height, maxWidth: '100%', aspectRatio: '1/1' }}>
          <canvas ref={canvasElRef} />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border">
            <span className="text-[10px] text-muted-foreground font-medium">
              {activeSide === 'front' ? 'Frente' : 'Atrás'} · Arrastra para posicionar
            </span>
          </div>
        </div>
      </div>
    );
  }
);
