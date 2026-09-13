import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  Color3,
  Color4,
  PBRMaterial,
  DynamicTexture,
  SceneLoader,
  Mesh,
  ShadowGenerator,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { ShadowOnlyMaterial } from '@babylonjs/materials';
import { campaignAsset } from '../../lib/campaignAssets';
import { SEOUL_BLUE } from './CampaignFranelas';

/**
 * Visor 3D de la franela de campaña (modelo "Camiseta - Viento").
 *
 * El GLB trae mallas separadas por sección (`front`, `back`, `neck`, mangas,
 * `back_inside`). `front` y `back` llevan una DynamicTexture propia donde se
 * pintan el diseño del carrusel (pecho) y el logo fijo (espalda alta).
 *
 * Anclajes UV calibrados sobre el modelo (v=0 cuello, v=1 ruedo, u=0.5 centro):
 * - Diseño frontal: centro (0.50, 0.30), ancho 0.42 del frente.
 * - Logo trasero: centro (0.515, 0.13), ancho 0.32 de la espalda (bajo el cuello).
 */

const TEX_SIZE = 2048;

const FRONT_DESIGN_UV = { x: 0.5, y: 0.3, width: 0.42 };
const BACK_LOGO_UV = { x: 0.515, y: 0.13, width: 0.32 };

const CAM_FRONT_ALPHA = -Math.PI / 2;
const CAM_BACK_ALPHA = Math.PI / 2;

function hexToColor3(hex: string): Color3 {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new Color3(r, g, b);
}

function drawCenteredImage(
  texture: DynamicTexture,
  img: HTMLImageElement | HTMLCanvasElement,
  cxUV: number,
  cyUV: number,
  widthUV: number
) {
  const ctx = texture.getContext();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  const w = widthUV * TEX_SIZE;
  const aspect = img.width / img.height;
  const h = w / aspect;

  ctx.drawImage(img, cxUV * TEX_SIZE - w / 2, cyUV * TEX_SIZE - h / 2, w, h);
  texture.update();
}

function paintWhite(texture: DynamicTexture) {
  const ctx = texture.getContext();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  texture.update();
}

interface Franela3DViewerProps {
  frontDesignUrl: string;
  backLogoUrl?: string;
  className?: string;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar imagen: ${url}`));
    img.src = url;
  });
}

export function Franela3DViewer({ frontDesignUrl, backLogoUrl = campaignAsset('logo.png'), className }: Franela3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const frontTextureRef = useRef<DynamicTexture | null>(null);
  const backTextureRef = useRef<DynamicTexture | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [view, setView] = useState<'front' | 'back'>('front');
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    if (!loading && showHint) {
      const timer = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [loading, showHint]);

  const initScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (engineRef.current) {
      engineRef.current.dispose();
    }
    frontTextureRef.current = null;
    backTextureRef.current = null;
    sceneRef.current = null;
    cameraRef.current = null;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });
    engineRef.current = engine;

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0);
    sceneRef.current = scene;

    // Encuadre idéntico al BabylonCanvas del configurador (probado): cámara
    // alejada a targetSize*1.8 con elevación PI/2.5, modelo centrado.
    const camera = new ArcRotateCamera(
      'franela-cam',
      CAM_FRONT_ALPHA,
      Math.PI / 2.5,
      5,
      Vector3.Zero(),
      scene
    );
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 15;
    camera.wheelDeltaPercentage = 0.01;
    camera.pinchDeltaPercentage = 0.01;
    camera.attachControl(canvas, true);
    cameraRef.current = camera;

    // Iluminación y sombra idénticas al BabylonCanvas probado.
    const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;

    const dirLight = new DirectionalLight('dir', new Vector3(0.25, -5, -0.25), scene);
    dirLight.intensity = 3;
    dirLight.position = new Vector3(0, 10, 0);

    const shadowGen = new ShadowGenerator(1024, dirLight);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 32;

    const ground = Mesh.CreateGround('shadowGround', 10, 10, 1, scene);
    const shadowMat = new ShadowOnlyMaterial('shadowMat', scene);
    shadowMat.activeLight = dirLight;
    ground.material = shadowMat;
    ground.receiveShadows = true;
    ground.position.y = -2;

    const frontTexture = new DynamicTexture(
      'front-tex',
      { width: TEX_SIZE, height: TEX_SIZE },
      scene,
      false
    );
    frontTextureRef.current = frontTexture;
    paintWhite(frontTexture);

    const backTexture = new DynamicTexture(
      'back-tex',
      { width: TEX_SIZE, height: TEX_SIZE },
      scene,
      false
    );
    backTextureRef.current = backTexture;
    paintWhite(backTexture);

    const frontMat = new PBRMaterial('front-mat', scene);
    frontMat.albedoTexture = frontTexture;
    frontMat.metallic = 0;
    frontMat.roughness = 0.9;

    const backMat = new PBRMaterial('back-mat', scene);
    backMat.albedoTexture = backTexture;
    backMat.metallic = 0;
    backMat.roughness = 0.9;

    const solidMat = new PBRMaterial('solid-mat', scene);
    solidMat.albedoColor = hexToColor3('#FFFFFF');
    solidMat.metallic = 0;
    solidMat.roughness = 0.9;

    const modelUrl = campaignAsset('model.glb');
    const lastSlash = modelUrl.lastIndexOf('/');
    const modelBase = modelUrl.substring(0, lastSlash + 1);
    const modelFilename = modelUrl.substring(lastSlash + 1);
    setLoading(true);

    SceneLoader.ImportMeshAsync('', modelBase, modelFilename, scene)
      .then((result) => {
        const loadedMeshes = result.meshes.filter((m) => m.getTotalVertices() > 0);
        if (loadedMeshes.length === 0) {
          setLoading(false);
          return;
        }

        let min = new Vector3(Infinity, Infinity, Infinity);
        let max = new Vector3(-Infinity, -Infinity, -Infinity);
        for (const mesh of loadedMeshes) {
          mesh.computeWorldMatrix(true);
          const bounds = mesh.getBoundingInfo().boundingBox;
          min = Vector3.Minimize(min, bounds.minimumWorld);
          max = Vector3.Maximize(max, bounds.maximumWorld);
        }

        const center = Vector3.Center(min, max);
        const size = max.subtract(min);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 3.5;
        const scaleFactor = targetSize / maxDim;

        for (const mesh of loadedMeshes) {
          mesh.position = center.negate().scale(scaleFactor);
          mesh.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
        }

        for (const mesh of loadedMeshes) {
          const name = mesh.name.toLowerCase();
          if (name === 'front') {
            mesh.material = frontMat;
          } else if (name === 'back') {
            mesh.material = backMat;
          } else {
            mesh.material = solidMat;
          }
          shadowGen.addShadowCaster(mesh);
        }

        ground.position.y = min.y * scaleFactor - center.y * scaleFactor - 0.05;

        camera.target = Vector3.Zero();
        // Igual que BabylonCanvas (probado): modelo centrado con aire.
        camera.radius = targetSize * 1.8;

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load campaign model:', err);
        setLoading(false);
      });

    engine.runRenderLoop(() => scene.render());

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      frontTextureRef.current = null;
      backTextureRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  // Diseño frontal dinámico (carrusel)
  useEffect(() => {
    const texture = frontTextureRef.current;
    if (!texture) return;
    if (!frontDesignUrl) {
      paintWhite(texture);
      return;
    }
    let cancelled = false;
    loadImage(frontDesignUrl)
      .then((img) => {
        if (!cancelled) {
          drawCenteredImage(texture, img, FRONT_DESIGN_UV.x, FRONT_DESIGN_UV.y, FRONT_DESIGN_UV.width);
        }
      })
      .catch((err) => {
        console.warn('[Franela3D] diseño frontal no disponible:', err);
        if (!cancelled) paintWhite(texture);
      });
    return () => {
      cancelled = true;
    };
  }, [frontDesignUrl, loading]);

  // Logo trasero fijo
  useEffect(() => {
    const texture = backTextureRef.current;
    if (!texture) return;
    if (!backLogoUrl) {
      paintWhite(texture);
      return;
    }
    let cancelled = false;
    loadImage(backLogoUrl)
      .then((img) => {
        if (!cancelled) {
          drawCenteredImage(texture, img, BACK_LOGO_UV.x, BACK_LOGO_UV.y, BACK_LOGO_UV.width);
        }
      })
      .catch((err) => {
        console.warn('[Franela3D] logo trasero no disponible:', err);
        if (!cancelled) paintWhite(texture);
      });
    return () => {
      cancelled = true;
    };
  }, [backLogoUrl, loading]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const switchView = (v: 'front' | 'back') => {
    setView(v);
    const camera = cameraRef.current;
    if (!camera) return;
    camera.alpha = v === 'front' ? CAM_FRONT_ALPHA : CAM_BACK_ALPHA;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-b from-[#E8EEF7] via-[#DCE5F1] to-[#C9D6EA] ${className ?? ''}`}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full outline-none"
        style={{ touchAction: 'none' }}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/60 backdrop-blur-sm">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-foreground">Cargando franela 3D...</p>
          </div>
        </div>
      )}

      {/* Controles superiores */}
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? (
            <Minimize2 size={16} className="text-foreground" />
          ) : (
            <Maximize2 size={16} className="text-foreground" />
          )}
        </button>
      </div>

      {/* Selector frente / espalda */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-card/80 p-1 backdrop-blur-sm">
        {(['front', 'back'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => switchView(v)}
            className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
              view === v ? 'text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
            style={view === v ? { backgroundColor: SEOUL_BLUE } : undefined}
            aria-pressed={view === v}
          >
            {v === 'front' ? 'Frente' : 'Espalda'}
          </button>
        ))}
      </div>

      {showHint && !loading && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card/80 px-4 py-2 backdrop-blur-sm transition-opacity duration-700">
          <span className="text-xs font-medium text-muted-foreground">
            Arrastra para rotar · Scroll para zoom
          </span>
        </div>
      )}
    </div>
  );
}