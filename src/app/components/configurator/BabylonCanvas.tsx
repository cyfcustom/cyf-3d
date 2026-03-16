import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useAtom } from 'jotai';
import {
  Engine, Scene, ArcRotateCamera, HemisphericLight, DirectionalLight,
  Vector3, Color3, Color4, Tools,
  PBRMaterial, DynamicTexture, AbstractMesh, SceneLoader,
  Mesh, ShadowGenerator,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { ShadowOnlyMaterial } from '@babylonjs/materials';
import { layersAtom, Layer } from '../../store/atoms';

export interface BabylonCanvasHandle {
  takeScreenshot: () => Promise<string | null>;
}

const TEX_SIZE = 1024;
const IMG_BASE_SIZE = 400;

interface BabylonCanvasProps {
  selectedColor: string;
  modelUrl: string;
}

function hexToColor3(hex: string): Color3 {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new Color3(r, g, b);
}

function redrawTexture(
  texture: DynamicTexture,
  color: string,
  layers: Layer[],
  side: 'front' | 'back',
  imagesCache: Map<string, HTMLImageElement>
) {
  const ctx = texture.getContext();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  const sideLayers = layers.filter(l => (l.side || 'front') === side);
  for (const layer of sideLayers) {
    const img = imagesCache.get(layer.id);
    if (!img) continue;

    const scale = layer.scale ?? 1;
    const imgAspect = img.width / img.height;
    let w: number, h: number;
    if (imgAspect >= 1) {
      w = IMG_BASE_SIZE * scale;
      h = w / imgAspect;
    } else {
      h = IMG_BASE_SIZE * scale;
      w = h * imgAspect;
    }

    const cx = (layer.x ?? 0.5) * TEX_SIZE;
    const cy = (layer.y ?? 0.4) * TEX_SIZE;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  }

  texture.update();
}

export const BabylonCanvas = forwardRef<BabylonCanvasHandle, BabylonCanvasProps>(function BabylonCanvas({ selectedColor, modelUrl }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const meshesRef = useRef<AbstractMesh[]>([]);
  const bodyMaterialRef = useRef<PBRMaterial | null>(null);
  const bodyTextureRef = useRef<DynamicTexture | null>(null);
  const solidMaterialRef = useRef<PBRMaterial | null>(null);
  const imagesCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [layers] = useAtom(layersAtom);
  const [textureReady, setTextureReady] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      return new Promise<string | null>((resolve) => {
        const engine = engineRef.current;
        const scene = sceneRef.current;
        if (!engine || !scene) {
          resolve(null);
          return;
        }
        scene.render();
        Tools.CreateScreenshotUsingRenderTarget(engine, scene.activeCamera!, { width: 800, height: 800 }, (data) => {
          resolve(data);
        });
      });
    },
  }));

  useEffect(() => {
    if (!loading && showHint) {
      const timer = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [loading, showHint]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const initScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (engineRef.current) {
      engineRef.current.dispose();
    }
    bodyTextureRef.current = null;
    bodyMaterialRef.current = null;
    solidMaterialRef.current = null;
    meshesRef.current = [];

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });
    engineRef.current = engine;

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0);
    sceneRef.current = scene;

    // Camera
    const camera = new ArcRotateCamera(
      'camera', -Math.PI / 2, Math.PI / 2.5, 5,
      Vector3.Zero(), scene
    );
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 15;
    camera.wheelDeltaPercentage = 0.01;
    camera.pinchDeltaPercentage = 0.01;
    camera.attachControl(canvas, true);

    // Lighting
    const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;

    const dirLight = new DirectionalLight('dir', new Vector3(0.25, -5, -0.25), scene);
    dirLight.intensity = 3;
    dirLight.position = new Vector3(0, 10, 0);

    // Shadow generator
    const shadowGen = new ShadowGenerator(1024, dirLight);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 32;

    // Shadow ground
    const ground = Mesh.CreateGround('shadowGround', 10, 10, 1, scene);
    const shadowMat = new ShadowOnlyMaterial('shadowMat', scene);
    shadowMat.activeLight = dirLight;
    ground.material = shadowMat;
    ground.receiveShadows = true;
    ground.position.y = -2;

    // Materials
    const bodyTexture = new DynamicTexture('body-tex', { width: TEX_SIZE, height: TEX_SIZE }, scene, false);
    bodyTextureRef.current = bodyTexture;

    const bodyMat = new PBRMaterial('body-mat', scene);
    bodyMat.albedoTexture = bodyTexture;
    bodyMat.metallic = 0;
    bodyMat.roughness = 0.85;
    bodyMaterialRef.current = bodyMat;

    const solidMat = new PBRMaterial('solid-mat', scene);
    solidMat.albedoColor = hexToColor3('#FFFFFF');
    solidMat.metallic = 0;
    solidMat.roughness = 0.85;
    solidMaterialRef.current = solidMat;

    // Initial texture fill
    const ctx = bodyTexture.getContext();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
    bodyTexture.update();

    // Load GLB model
    const lastSlash = modelUrl.lastIndexOf('/');
    const modelBase = modelUrl.substring(0, lastSlash + 1);
    const modelFilename = modelUrl.substring(lastSlash + 1);
    setLoading(true);

    SceneLoader.ImportMeshAsync('', modelBase, modelFilename, scene).then((result) => {
      const loadedMeshes = result.meshes.filter(m => m.getTotalVertices() > 0);
      meshesRef.current = loadedMeshes;

      if (loadedMeshes.length === 0) {
        setLoading(false);
        return;
      }

      // Find bounding info to normalize the model
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

      const rootNode = result.meshes[0];
      rootNode.position = center.negate().scale(scaleFactor);
      rootNode.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);

      // Find the largest mesh (body) and assign materials
      let largestMesh: AbstractMesh | null = null;
      let largestVertCount = 0;
      for (const mesh of loadedMeshes) {
        const verts = mesh.getTotalVertices();
        if (verts > largestVertCount) {
          largestVertCount = verts;
          largestMesh = mesh;
        }
      }

      for (const mesh of loadedMeshes) {
        if (mesh === largestMesh) {
          mesh.material = bodyMat;
        } else {
          mesh.material = solidMat;
        }
        shadowGen.addShadowCaster(mesh);
      }

      // Position ground below model
      ground.position.y = min.y * scaleFactor - center.y * scaleFactor - 0.05;

      camera.target = Vector3.Zero();
      camera.radius = targetSize * 1.8;

      setLoading(false);
      setTextureReady(v => v + 1);
    }).catch((err) => {
      console.error('Failed to load model:', err);
      setLoading(false);
    });

    engine.runRenderLoop(() => scene.render());

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      bodyTextureRef.current = null;
      bodyMaterialRef.current = null;
      solidMaterialRef.current = null;
      sceneRef.current = null;
      meshesRef.current = [];
    };
  }, [modelUrl]);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  // Update solid material color (secondary meshes)
  useEffect(() => {
    if (solidMaterialRef.current) {
      solidMaterialRef.current.albedoColor = hexToColor3(selectedColor);
    }
  }, [selectedColor]);

  // Load images + redraw body texture
  useEffect(() => {
    const texture = bodyTextureRef.current;
    if (!texture) return;

    let cancelled = false;
    const cache = imagesCacheRef.current;

    const loadAndRedraw = async () => {
      const newLayers = layers.filter(l => !cache.has(l.id));
      if (newLayers.length > 0) {
        await Promise.all(newLayers.map(l => new Promise<void>(resolve => {
          const img = new Image();
          img.onload = () => {
            if (!cancelled) cache.set(l.id, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = l.thumbnail;
        })));
      }

      const activeIds = new Set(layers.map(l => l.id));
      for (const id of cache.keys()) {
        if (!activeIds.has(id)) cache.delete(id);
      }

      if (!cancelled) {
        redrawTexture(texture, selectedColor, layers, 'front', cache);
      }
    };

    loadAndRedraw();
    return () => { cancelled = true; };
  }, [layers, selectedColor, textureReady]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-muted/30">
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
});
