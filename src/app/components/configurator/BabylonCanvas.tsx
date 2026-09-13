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
import type { Section, SectionId } from '../../types/sections';

export interface BabylonCanvasHandle {
  takeScreenshot: () => Promise<string | null>;
}

const TEX_SIZE = 1024;
const IMG_BASE_SIZE = 400;

interface BabylonCanvasProps {
  modelUrl: string;
  /** Section definitions for the loaded model. */
  sections: Section[];
  /**
   * Currently active section — used to know which section's color picker
   * is selected. (Visual layers are per-section via Layer.side.)
   */
  activeSection?: SectionId;
}

function hexToColor3(hex: string): Color3 {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new Color3(r, g, b);
}

function redrawSectionTexture(
  texture: DynamicTexture,
  color: string,
  layers: Layer[],
  sectionId: SectionId,
  imagesCache: Map<string, HTMLImageElement>
) {
  const ctx = texture.getContext();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  const sectionLayers = layers.filter(l => (l.side || 'front') === sectionId);
  for (const layer of sectionLayers) {
    const img = imagesCache.get(layer.id);
    if (!img) continue;

    const scale = Math.max(0, layer.scale ?? 1);
    const imgAspect = img.width / img.height;
    let w: number, h: number;
    if (imgAspect >= 1) {
      w = IMG_BASE_SIZE * scale;
      h = w / imgAspect;
    } else {
      h = IMG_BASE_SIZE * scale;
      w = h * imgAspect;
    }
    // Hard floor: never render below ~5% of print area so a zero/negative
    // scale doesn't make the image disappear entirely (and so accidental
    // scale=0 doesn't drop the 3D projection to nothing).
    const MIN_DIM = IMG_BASE_SIZE * 0.05;
    if (w < MIN_DIM) w = MIN_DIM;
    if (h < MIN_DIM) h = MIN_DIM;

    const cx = (layer.x ?? 0.5) * TEX_SIZE;
    const cy = (layer.y ?? 0.4) * TEX_SIZE;
    const rotationDeg = layer.rotation ?? 0;
    const rotationRad = (rotationDeg * Math.PI) / 180;
    // Image drawn in normal canvas orientation. UV flips (uScale=-1,
    // vScale=-1 + invertY=true default) on the texture compensate for
    // this model's UV authoring.
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotationRad);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  texture.update();
}

interface SectionResources {
  texture: DynamicTexture;
  material: PBRMaterial;
}

export const BabylonCanvas = forwardRef<BabylonCanvasHandle, BabylonCanvasProps>(function BabylonCanvas({
  modelUrl,
  sections,
  activeSection: _activeSection,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const meshesRef = useRef<AbstractMesh[]>([]);
  const sectionResourcesRef = useRef<Map<SectionId, SectionResources>>(new Map());
  const solidMatRef = useRef<PBRMaterial | null>(null);
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
    sectionResourcesRef.current.clear();
    solidMatRef.current = null;
    meshesRef.current = [];

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    } as any);
    engineRef.current = engine;

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0);
    sceneRef.current = scene;

    // Camera
    const camera = new ArcRotateCamera(
      'camera', -Math.PI / 2, Math.PI / 2.5, 8,
      Vector3.Zero(), scene
    );
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 20;
    camera.wheelDeltaPercentage = 0.01;
    camera.pinchDeltaPercentage = 0.01;
    camera.attachControl(canvas, true);

    // Lighting
    const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;

    const dirLight = new DirectionalLight('dir', new Vector3(0.25, -5, -0.25), scene);
    dirLight.intensity = 3;

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

    // ── Per-section textures + materials ───────────────────────────
    // One DynamicTexture + PBRMaterial per section. Sections without a
    // mesh_name (not present in the GLB) skip material creation.
    const sectionResources = new Map<SectionId, SectionResources>();
    for (const sec of sections) {
      if (!sec.mesh_name) continue;

      const texture = new DynamicTexture(
        `${sec.id}-tex`,
        { width: TEX_SIZE, height: TEX_SIZE },
        scene,
        false
      );
      // UV flip: this GLB has UV axes pointing opposite to Babylon's
      // default. Compensates so the canvas drawing maps right-side-up.
      texture.uScale = -1; texture.uOffset = 1;
      texture.vScale = -1; texture.vOffset = 1;

      const material = new PBRMaterial(`${sec.id}-mat`, scene);
      material.albedoTexture = texture;
      material.metallic = 0;
      material.roughness = 0.85;

      sectionResources.set(sec.id, { texture, material });

      // Initial fill with the section's color
      const ctx = texture.getContext();
      ctx.fillStyle = sec.color;
      ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
      texture.update();
    }
    sectionResourcesRef.current = sectionResources;

    // Solid material (used for invisible / unassigned meshes)
    const solidMat = new PBRMaterial('solid-mat', scene);
    solidMat.albedoColor = hexToColor3('#FFFFFF');
    solidMat.metallic = 0;
    solidMat.roughness = 0.85;
    solidMatRef.current = solidMat;

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

      // Assign materials based on mesh name + section visibility.
      for (const mesh of loadedMeshes) {
        const section = sections.find(s => s.mesh_name === mesh.name);
        if (section && section.visible && sectionResources.has(section.id)) {
          mesh.material = sectionResources.get(section.id)!.material;
          mesh.isVisible = true;
        } else if (section && !section.visible) {
          mesh.material = solidMat;
          mesh.isVisible = false;
        } else {
          mesh.material = solidMat;
          mesh.isVisible = true;
        }
        shadowGen.addShadowCaster(mesh);
      }

      // Position ground below model
      ground.position.y = min.y * scaleFactor - center.y * scaleFactor - 0.05;

      camera.target = Vector3.Zero();
      camera.radius = targetSize * 3.0;

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
      sectionResourcesRef.current.clear();
      solidMatRef.current = null;
      sceneRef.current = null;
      meshesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl]);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  // Update per-section colors and visibility without rebuilding the scene.
  useEffect(() => {
    const sectionResources = sectionResourcesRef.current;
    for (const sec of sections) {
      const res = sectionResources.get(sec.id);
      if (res) {
        // Repaint the texture's clear color (next redraw will fill correctly).
        const ctx = res.texture.getContext();
        ctx.fillStyle = sec.color;
        ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
        res.texture.update();
      }
      // Toggle mesh visibility
      const mesh = meshesRef.current.find(m => m.name === sec.mesh_name);
      if (mesh) {
        mesh.isVisible = sec.visible;
        if (sec.visible && res) {
          mesh.material = res.material;
        } else {
          mesh.material = solidMatRef.current;
        }
      }
    }
    setTextureReady(v => v + 1);
  }, [sections]);

  // Load images + redraw every section texture
  useEffect(() => {
    const sectionResources = sectionResourcesRef.current;
    if (sectionResources.size === 0) return;

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

      if (cancelled) return;
      for (const sec of sections) {
        const res = sectionResources.get(sec.id);
        if (res) redrawSectionTexture(res.texture, sec.color, layers, sec.id, cache);
      }
    };

    loadAndRedraw();
    return () => { cancelled = true; };
  }, [layers, sections, textureReady]);

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
