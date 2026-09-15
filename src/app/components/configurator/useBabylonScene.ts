import { useEffect, useRef, useState } from 'react';
import {
  Engine, Scene, ArcRotateCamera, HemisphericLight, DirectionalLight,
  Vector3, Color3, Color4, Mesh, ShadowGenerator, Tools,
  AbstractMesh, SceneLoader, PBRMaterial, DynamicTexture,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { ShadowOnlyMaterial } from '@babylonjs/materials';
import { Layer } from '../../../store/atoms';
import type { Section, SectionId } from '../../../types/sections';
import { redrawSectionTexture, TEX_SIZE } from './redrawSectionTexture';

interface UseBabylonSceneOpts {
  /** Trigger re-render of the section textures. */
  textureReady: number;
  /** GLB URL (cached for re-init on URL change). */
  modelUrl: string;
  /** Sections the model declares (mesh_name, color, visible, etc.). */
  sections: Section[];
  /** All layers to draw onto each section's texture. */
  layers: Layer[];
  /** Map<layerId, HTMLImageElement> cache for canvas drawImage. */
  imagesCache: Map<string, HTMLImageElement>;
}

interface SectionResources {
  texture: DynamicTexture;
  material: PBRMaterial;
}

/**
 * Owns the entire Babylon scene lifecycle for the configurator:
 *  - Engine + Scene + camera + lights + shadow generator + ground
 *  - GLB mesh loading and mesh-name → material assignment per section
 *  - One DynamicTexture + PBRMaterial per section that has a mesh_name
 *  - The render loop, resize handling, and disposal on unmount
 *
 * Re-initialises only when modelUrl changes. Color/visibility/layer
 * updates are applied via separate effects inside this hook.
 *
 * Returns the engine + scene refs so the React component can take
 * screenshots.
 */
export function useBabylonScene(opts: UseBabylonSceneOpts) {
  const { textureReady, modelUrl, sections, layers, imagesCache } = opts;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const meshesRef = useRef<AbstractMesh[]>([]);
  const sectionResourcesRef = useRef<Map<SectionId, SectionResources>>(new Map());
  const solidMatRef = useRef<PBRMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper kept inline so it can close over the texture refs.
  const hexToColor3 = (hex: string): Color3 => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return new Color3(r, g, b);
  };

  // Init scene + load GLB — runs once per modelUrl change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (engineRef.current) {
      engineRef.current.dispose();
    }
    sectionResourcesRef.current = new Map();
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

    // Camera — initial radius is set later based on mesh bounds.
    const camera = new ArcRotateCamera(
      'camera', -Math.PI / 2, Math.PI / 2.5, 8,
      Vector3.Zero(), scene
    );
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 20;
    camera.wheelDeltaPercentage = 0.01;
    camera.pinchDeltaPercentage = 0.01;
    camera.attachControl(canvas, true);

    // Lighting — hemisphere fill + key directional light for shadows.
    const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;

    const dirLight = new DirectionalLight('dir', new Vector3(0.25, -5, -0.25), scene);
    dirLight.intensity = 3;

    const shadowGen = new ShadowGenerator(1024, dirLight);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 32;

    // Shadow-only ground plane (transparent material).
    const ground = Mesh.CreateGround('shadowGround', 10, 10, 1, scene);
    const shadowMat = new ShadowOnlyMaterial('shadowMat', scene);
    shadowMat.activeLight = dirLight;
    ground.material = shadowMat;
    ground.receiveShadows = true;
    ground.position.y = -2;

    // ── Per-section textures + materials ──────────────────────────
    // One DynamicTexture + PBRMaterial per section. Sections without a
    // mesh_name (not present in this GLB) skip material creation so the
    // corresponding mesh falls back to solidMat.
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

    // ── Load GLB ─────────────────────────────────────────────────
    const lastSlash = modelUrl.lastIndexOf('/');
    const modelBase = modelUrl.substring(0, lastSlash + 1);
    const modelFilename = modelUrl.substring(lastSlash + 1);
    setLoading(true);

    SceneLoader.ImportMeshAsync('', modelBase, modelFilename, scene).then(result => {
      const loadedMeshes = result.meshes.filter(m => m.getTotalVertices() > 0);
      meshesRef.current = loadedMeshes;

      if (loadedMeshes.length === 0) {
        setLoading(false);
        return;
      }

      // Normalize model to a target size in scene units.
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

      // Position ground below model.
      ground.position.y = min.y * scaleFactor - center.y * scaleFactor - 0.05;

      camera.target = Vector3.Zero();
      camera.radius = targetSize * 3.0;

      setLoading(false);
    }).catch(err => {
      console.error('Failed to load model:', err);
      setLoading(false);
    });

    engine.runRenderLoop(() => scene.render());

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      sectionResourcesRef.current = new Map();
      solidMatRef.current = null;
      sceneRef.current = null;
      meshesRef.current = [];
    };
  }, [modelUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update per-section colors + visibility without rebuilding the scene.
  useEffect(() => {
    const sectionResources = sectionResourcesRef.current;
    const solidMat = solidMatRef.current;
    if (!solidMat) return;

    for (const sec of sections) {
      // Apply visibility + material assignment.
      const mesh = meshesRef.current.find(m => m.name === sec.mesh_name);
      if (mesh) {
        mesh.isVisible = sec.visible;
        if (sec.visible && sectionResources.has(sec.id)) {
          mesh.material = sectionResources.get(sec.id)!.material;
        } else {
          mesh.material = solidMat;
        }
      }
      // Repaint the texture's clear color (next redraw will fill correctly).
      const res = sectionResources.get(sec.id);
      if (res) {
        const ctx = res.texture.getContext();
        ctx.fillStyle = sec.color;
        ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
        res.texture.update();
      }
    }
  }, [sections, textureReady]);

  // Load images + redraw every section texture whenever layers change.
  useEffect(() => {
    const sectionResources = sectionResourcesRef.current;
    if (sectionResources.size === 0) return;

    let cancelled = false;

    const loadAndRedraw = async () => {
      const newLayers = layers.filter(l => !imagesCache.has(l.id));
      if (newLayers.length > 0) {
        await Promise.all(newLayers.map(l => new Promise<void>(resolve => {
          const img = new Image();
          img.onload = () => {
            if (!cancelled) imagesCache.set(l.id, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = l.thumbnail;
        })));
      }

      const activeIds = new Set(layers.map(l => l.id));
      for (const id of imagesCache.keys()) {
        if (!activeIds.has(id)) imagesCache.delete(id);
      }

      if (cancelled) return;
      for (const sec of sections) {
        const res = sectionResources.get(sec.id);
        if (res) redrawSectionTexture(res.texture, sec.color, layers, sec.id, imagesCache);
      }
    };

    loadAndRedraw();
    return () => { cancelled = true; };
  }, [layers, sections, textureReady, imagesCache]);

  /** Take a screenshot at the current camera state. */
  const takeScreenshot = async (): Promise<string | null> => {
    const engine = engineRef.current;
    const scene = sceneRef.current;
    if (!engine || !scene) return null;
    scene.render();
    return new Promise<string | null>(resolve => {
      Tools.CreateScreenshotUsingRenderTarget(engine, scene.activeCamera!, { width: 800, height: 800 }, data => {
        resolve(data);
      });
    });
  };

  return {
    canvasRef,
    engineRef,
    sceneRef,
    meshesRef,
    takeScreenshot,
    loading,
  };
}