import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { layersAtom } from '../../store/atoms';
import { useAtom } from 'jotai';
import type { Section, SectionId } from '../../types/sections';
import { useBabylonScene } from './useBabylonScene';

export interface BabylonCanvasHandle {
  takeScreenshot: () => Promise<string | null>;
}

interface BabylonCanvasProps {
  modelUrl: string;
  sections: Section[];
  activeSection?: SectionId;
}

/**
 * Babylon.js-powered 3D view of the selected garment model. The full
 * scene lifecycle (engine, scene, camera, lights, GLB loader, materials,
 * render loop, disposal) lives in `useBabylonScene` — this component is
 * just the React shell + fullscreen toggle.
 */
export const BabylonCanvas = forwardRef<BabylonCanvasHandle, BabylonCanvasProps>(
  function BabylonCanvas({ modelUrl, sections, activeSection: _activeSection }, ref) {
    const [layers] = useAtom(layersAtom);
    const [textureReady, setTextureReady] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const { canvasRef, takeScreenshot, loading } = useBabylonScene({
      modelUrl,
      sections,
      layers,
      imagesCache: useImagesCache(),
      textureReady,
    });

    // Expose screenshot handle to parent.
    useImperativeHandle(ref, () => ({ takeScreenshot }), [takeScreenshot]);

    // Initial redraw trigger after first render (so the GLB-loaded
    // textures actually get drawn once).
    useEffect(() => { setTextureReady(v => v + 1); }, []);

    // Auto-hide the interaction hint after a few seconds.
    useEffect(() => {
      if (!loading && showHint) {
        const t = setTimeout(() => setShowHint(false), 4000);
        return () => clearTimeout(t);
      }
    }, [loading, showHint]);

    // Fullscreen API.
    useEffect(() => {
      const handler = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', handler);
      return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const toggleFullscreen = () => {
      if (!containerRef.current) return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    };

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center bg-muted/30"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full outline-none"
          style={{ touchAction: 'none' }}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/60 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-foreground">Cargando modelo 3D...</p>
            </div>
          </div>
        )}

        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 p-2.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? (
            <Minimize2 size={18} className="text-foreground" />
          ) : (
            <Maximize2 size={18} className="text-foreground" />
          )}
        </button>

        {showHint && !loading && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border transition-opacity duration-700"
            style={{ animation: 'fadeInUp 0.5s ease-out' }}
          >
            <span className="text-xs text-muted-foreground font-medium">
              Arrastra para rotar · Scroll para zoom · Pellizca para acercar
            </span>
          </div>
        )}
      </div>
    );
  }
);

// Local hook to own the image cache Map (stable across renders).
function useImagesCache() {
  const cacheRef = useRef(new Map<string, HTMLImageElement>());
  return cacheRef.current;
}
