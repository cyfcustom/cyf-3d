import { useCallback } from 'react';
import * as fabric from 'fabric';
import { layersAtom, Layer } from '../../../store/atoms';
import type { SectionId } from '../../../types/sections';
import { getPrintArea } from './fabricConstants';

/**
 * Floating-toolbar action handlers for the FabricEditor.
 *
 * Each action mutates the active Fabric object (or its layer in jotai),
 * then re-syncs. The duplicate action also adds a new layer to jotai.
 * The delete action removes both the Fabric object AND its layer.
 *
 * Kept as a custom hook (vs. inline IIFE in the toolbar) so the FabricEditor
 * component stays focused on the canvas + sync lifecycle.
 */
export function useFabricToolbarActions(args: {
  fcRef: React.MutableRefObject<fabric.Canvas | null>;
  activeSection: SectionId;
  layers: Layer[];
  setLayers: (next: Layer[] | ((prev: Layer[]) => Layer[])) => void;
  syncToAtoms: () => void;
  clearToolbar: () => void;
}) {
  const { fcRef, activeSection, layers, setLayers, syncToAtoms, clearToolbar } = args;

  const bringToFront = useCallback(() => {
    const fc = fcRef.current;
    const obj = fc?.getActiveObject();
    if (!fc || !obj) return;
    fc.bringObjectToFront(obj);
    fc.requestRenderAll();
  }, [fcRef]);

  const sendToBack = useCallback(() => {
    const fc = fcRef.current;
    const obj = fc?.getActiveObject();
    if (!fc || !obj) return;
    fc.sendObjectToBack(obj);
    fc.requestRenderAll();
  }, [fcRef]);

  const flipH = useCallback(() => {
    const obj = fcRef.current?.getActiveObject();
    if (!obj) return;
    obj.set('flipX', !obj.flipX);
    fcRef.current?.requestRenderAll();
    syncToAtoms();
  }, [fcRef, syncToAtoms]);

  const fitToWidth = useCallback(() => {
    const obj = fcRef.current?.getActiveObject();
    if (!obj) return;
    const printRect = getPrintArea(activeSection);
    const currentW = (obj.width ?? 1) * (obj.scaleX ?? 1);
    if (currentW <= 0) return;
    const ratio = printRect.width / currentW;
    obj.set({
      scaleX: (obj.scaleX ?? 1) * ratio,
      scaleY: (obj.scaleY ?? 1) * ratio,
    });
    fcRef.current?.requestRenderAll();
    syncToAtoms();
  }, [fcRef, activeSection, syncToAtoms]);

  const duplicate = useCallback(() => {
    const fc = fcRef.current;
    const obj = fc?.getActiveObject();
    if (!fc || !obj) return;
    const layerId = (obj as any).data?.layerId;
    if (!layerId) return;
    const srcLayer = layers.find(l => l.id === layerId);
    if (!srcLayer) return;

    const cloned = fabric.util.object.clone(obj) as fabric.Object;
    if (!cloned) return;
    const newLeft = (obj.left ?? 0) + 20;
    const newTop  = (obj.top  ?? 0) + 20;
    cloned.set({ left: newLeft, top: newTop });
    const newId = `${Date.now()}-copy`;
    (cloned as any).data = { layerId: newId, side: srcLayer.side };
    fc.add(cloned);
    fc.setActiveObject(cloned);
    fc.requestRenderAll();

    setLayers(prev => [...prev, {
      ...srcLayer,
      id: newId,
      x: newLeft / CANVAS_SIZE,
      y: newTop  / CANVAS_SIZE,
    }]);
  }, [fcRef, layers, setLayers]);

  const removeSelected = useCallback(() => {
    const fc = fcRef.current;
    const obj = fc?.getActiveObject();
    if (!fc || !obj) return;
    const layerId = (obj as any).data?.layerId;
    fc.remove(obj);
    fc.requestRenderAll();
    if (layerId) {
      setLayers(prev => prev.filter(l => l.id !== layerId));
    }
    clearToolbar();
  }, [fcRef, setLayers, clearToolbar]);

  return {
    bringToFront,
    sendToBack,
    flipH,
    fitToWidth,
    duplicate,
    removeSelected,
  };
}
