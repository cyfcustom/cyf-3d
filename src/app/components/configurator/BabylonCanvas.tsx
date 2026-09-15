import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { layersAtom, sceneBackgroundAtom } from '../../store/atoms';
import { useAtom, useAtomValue } from 'jotai';
import type { Section, SectionId } from '../../types/sections';
import { useBabylonScene } from './useBabylonScene';

export interface BabylonCanvasHandle {
  takeScreenshot: () => Promise<string | null>;
}

interface BabylonCanvasProps {
  modelUrl: string;
  sections: Section[];
  activeSection?: SectionId;
  /**
   * Optional override for the container's background-related classes.
   * When provided, it replaces the default `bg-muted/30` (and the
   * transparent background when sceneBackgroundAtom is set). Used by
   * the campaign viewer to apply a gradient + border + rounded corners
   * directly on the container so fullscreen mode preserves them.
   */
  containerClassName?: string;
  /** Camera distance multiplier passed through to useBabylonScene. */
  cameraRadiusMultiplier?: number;
}

/**
 * Babylon.js-powered 3D view of the selected garment model. The full
 * scene lifecycle (engine, scene, camera, lights, GLB loader, materials,
 * render loop, disposal) lives in `useBabylonScene` — this component is
 * just the React shell + fullscreen toggle.
 */
export const BabylonCanvas = forwardRef<BabylonCanvasHandle, BabylonCanvasProps>(
  function BabylonCanvas({ modelUrl, sections, activeSection: _activeSection, containerClassName, cameraRadiusMultiplier }, ref) {
    const [layers] = useAtom(layersAtom);
    const [textureReady, setTextureReady] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const background = useAtomValue(sceneBackgroundAtom);

    const { canvasRef, takeScreenshot, loading } = useBabylonScene({
      modelUrl,
      sections,
      layers,
      imagesCache: useImagesCache(),
      textureReady,
      cameraRadiusMultiplier,
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

    // Lock page scroll while the wheel is over the canvas so the
    // camera zoom doesn't fight with the document's vertical scroll.
    // Babylon's own wheel listener (attached via attachControl) still
    // fires for camera zoom — preventDefault only stops the browser's
    // default page-scroll action, not other listeners. Listener is on
    // the container, not the canvas, so scrolling over the surrounding
    // page (title, picker, etc.) still works normally.
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => e.preventDefault();
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const toggleFullscreen = () => {
      if (!containerRef.current) return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    };

    // Default background: muted/30 when no override and no scene background.
    // When containerClassName is provided, it replaces the bg part entirely.
    const defaultBg = background === null ? 'bg-muted/30' : '';
    const bgClass = containerClassName !== undefined ? containerClassName : defaultBg;

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center ${bgClass}`}
        style={
          background === null
            ? undefined
            : background.type === 'color'
              ? { backgroundColor: background.value }
              : {
                  backgroundImage: `url(${background.value})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }
        }
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
