import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

// ── Source-of-truth: hardcoded list of local model folders ─────────────────
// Generated from /Users/august/Dev/personal/cyf-3d/modelos at build time.
// To refresh: re-run `tree -hl modelos/` and replace this array.
const MODEL_FOLDERS = [
  '10', '101', '105', '115', '125', '133', '139', '145', '149', '157',
  '179', '20', '221', '256', '265', '281', '30', '368', '381', '395',
  '398', '4', '435', '449', '484', '497', '50', '509', '516', '52',
  '535', '556', '57', '572', '575', '6', '635', '657', '674', '715',
  '735', '81', '858', '861', '868', '870', '873', '875', '879', '92',
  '95',
];

// ── JSX intrinsic-element declaration for <model-viewer> ──────────────────
// (the web component is registered globally by the CDN script in index.html)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'camera-controls'?: boolean | string;
          'auto-rotate'?: boolean | string;
          'shadow-intensity'?: string | number;
          'environment-image'?: string;
          'camera-orbit'?: string;
          'field-of-view'?: string;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'interaction-prompt'?: string;
          poster?: string;
        },
        HTMLElement
      >;
    }
  }
}

export function ModelPreviewPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('folder') ?? MODEL_FOLDERS[0];
  const [activeFolder, setActiveFolder] = useState(initial);
  const [autoRotate, setAutoRotate] = useState(true);

  const src = useMemo(
    () => `/modelos/${activeFolder}/model.glb`,
    [activeFolder]
  );

  // Keep URL in sync so the user can share/bookmark
  useEffect(() => {
    if (params.get('folder') !== activeFolder) {
      setParams({ folder: activeFolder }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolder]);

  const go = (delta: number) => {
    const idx = MODEL_FOLDERS.indexOf(activeFolder);
    if (idx === -1) return;
    const next = MODEL_FOLDERS[(idx + delta + MODEL_FOLDERS.length) % MODEL_FOLDERS.length];
    setActiveFolder(next);
  };

  const onLoad = () => toast.success(`Modelo ${activeFolder} cargado`);
  const onError = () => toast.error(`No se pudo cargar /modelos/${activeFolder}/model.glb`);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/models"
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          title="Volver a Modelos"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold">Preview de modelos locales</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Visualiza los <code>.glb</code> de la carpeta <code>modelos/</code> antes de subirlos.
          </p>
        </div>
        <div className="text-sm font-bold text-muted-foreground">
          {MODEL_FOLDERS.indexOf(activeFolder) + 1} / {MODEL_FOLDERS.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* ── Viewer ─────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div className="font-mono text-sm font-bold">
              modelos/{activeFolder}/model.glb
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRotate((v) => !v)}
                className={`p-2 rounded-lg text-sm font-bold transition-colors ${
                  autoRotate ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                title="Auto-rotar"
              >
                <RotateCw size={16} />
              </button>
              <button
                onClick={() => go(-1)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => go(1)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Siguiente"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => (document.querySelector('model-viewer') as any)?.requestFullscreen?.()}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Pantalla completa"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          {/* @ts-expect-error — custom web-component registered by CDN script */}
          <model-viewer
            key={src}
            src={src}
            alt={`Modelo ${activeFolder}`}
            camera-controls
            auto-rotate={autoRotate || undefined}
            shadow-intensity="1"
            interaction-prompt="none"
            style={{ width: '100%', height: '70vh', backgroundColor: '#f5f5f5' }}
            onLoad={onLoad}
            onError={onError}
          />
        </div>

        {/* ── Folder grid ───────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-3 max-h-[70vh] overflow-y-auto">
          <div className="text-xs font-bold text-muted-foreground uppercase px-2 pb-2">
            Carpetas
          </div>
          <div className="grid grid-cols-4 gap-2">
            {MODEL_FOLDERS.map((folder) => (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`aspect-square rounded-xl font-mono text-sm font-bold transition-all ${
                  folder === activeFolder
                    ? 'bg-primary text-primary-foreground scale-105'
                    : 'bg-muted hover:bg-accent text-foreground'
                }`}
              >
                {folder}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelPreviewPage;
