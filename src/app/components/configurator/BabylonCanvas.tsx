import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, Color3, Color4, MeshBuilder, PBRMaterial, Mesh } from '@babylonjs/core';

interface BabylonCanvasProps {
  selectedColor: string;
  productType: string;
}

function hexToColor3(hex: string): Color3 {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new Color3(r, g, b);
}

function createMug(scene: Scene): Mesh {
  // Outer cylinder (body)
  const outer = MeshBuilder.CreateCylinder('mug-body', {
    height: 2.4,
    diameter: 1.6,
    tessellation: 48,
  }, scene);

  // Inner cylinder (hollow inside)
  const inner = MeshBuilder.CreateCylinder('mug-inner', {
    height: 2.3,
    diameter: 1.4,
    tessellation: 48,
  }, scene);
  inner.position.y = 0.05;

  // Bottom disc
  const bottom = MeshBuilder.CreateDisc('mug-bottom', {
    radius: 0.7,
    tessellation: 48,
  }, scene);
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = -1.2;

  // Handle - torus
  const handle = MeshBuilder.CreateTorus('mug-handle', {
    diameter: 1.0,
    thickness: 0.15,
    tessellation: 32,
  }, scene);
  handle.scaling = new Vector3(0.7, 1, 0.4);
  handle.position.x = 0.95;
  handle.position.y = 0.1;

  // Merge into single mesh
  const mug = Mesh.MergeMeshes(
    [outer, inner, bottom, handle],
    true, true, undefined, false, true
  );

  if (mug) {
    mug.name = 'mug';
    mug.position.y = 0;
  }

  return mug!;
}

function createTShirt(scene: Scene): Mesh {
  // Simplified t-shirt: flat box representing the body + sleeves
  const body = MeshBuilder.CreateBox('tshirt-body', {
    width: 2.0,
    height: 2.8,
    depth: 0.15,
  }, scene);

  // Left sleeve
  const leftSleeve = MeshBuilder.CreateBox('tshirt-left-sleeve', {
    width: 0.8,
    height: 0.7,
    depth: 0.12,
  }, scene);
  leftSleeve.position.x = -1.3;
  leftSleeve.position.y = 0.9;
  leftSleeve.rotation.z = 0.4;

  // Right sleeve
  const rightSleeve = MeshBuilder.CreateBox('tshirt-right-sleeve', {
    width: 0.8,
    height: 0.7,
    depth: 0.12,
  }, scene);
  rightSleeve.position.x = 1.3;
  rightSleeve.position.y = 0.9;
  rightSleeve.rotation.z = -0.4;

  // Collar (small torus)
  const collar = MeshBuilder.CreateTorus('tshirt-collar', {
    diameter: 0.7,
    thickness: 0.08,
    tessellation: 24,
  }, scene);
  collar.position.y = 1.4;
  collar.scaling = new Vector3(1, 0.3, 0.5);

  const tshirt = Mesh.MergeMeshes(
    [body, leftSleeve, rightSleeve, collar],
    true, true, undefined, false, true
  );

  if (tshirt) {
    tshirt.name = 'tshirt';
  }

  return tshirt!;
}

function createProductMesh(scene: Scene, productType: string): Mesh {
  switch (productType) {
    case 'mug':
      return createMug(scene);
    case 'tshirt':
    default:
      return createTShirt(scene);
  }
}

export function BabylonCanvas({ selectedColor, productType }: BabylonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const materialRef = useRef<PBRMaterial | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const { t } = useTranslation('configurator');

  const initScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Engine
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });
    engineRef.current = engine;

    // Scene
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0); // Transparent background
    sceneRef.current = scene;

    // Camera
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,  // alpha (horizontal rotation)
      Math.PI / 2.5,  // beta (vertical angle)
      5,              // radius (distance)
      Vector3.Zero(),
      scene
    );
    camera.lowerRadiusLimit = 2.5;
    camera.upperRadiusLimit = 10;
    camera.wheelDeltaPercentage = 0.01;
    camera.pinchDeltaPercentage = 0.01;
    camera.attachControl(canvas, true);

    // Lights
    const light1 = new HemisphericLight('light-top', new Vector3(0, 1, 0), scene);
    light1.intensity = 0.9;

    const light2 = new HemisphericLight('light-front', new Vector3(0, 0, 1), scene);
    light2.intensity = 0.5;

    // Material
    const material = new PBRMaterial('product-material', scene);
    material.albedoColor = hexToColor3(selectedColor);
    material.metallic = 0.0;
    material.roughness = 0.6;
    materialRef.current = material;

    // Create product mesh
    const mesh = createProductMesh(scene, productType);
    mesh.material = material;
    meshRef.current = mesh;

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Resize handler
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, [productType]); // Only re-init when product type changes

  // Init scene on mount
  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  // Update color without re-creating the scene
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.albedoColor = hexToColor3(selectedColor);
    }
  }, [selectedColor]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-muted/30">
      <canvas
        ref={canvasRef}
        className="w-full h-full outline-none"
        style={{ touchAction: 'none' }}
      />

      {/* Product type indicator */}
      <div className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-card/90 backdrop-blur-sm shadow-md border border-border">
        <span className="text-sm font-semibold text-foreground">
          {t('canvas.viewLabel', { view: productType === 'mug' ? 'Taza' : 'Franela' })}
        </span>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border">
        <span className="text-xs text-muted-foreground font-medium">
          {t('canvas.rotate', { defaultValue: 'Arrastra para rotar | Scroll para zoom' })}
        </span>
      </div>
    </div>
  );
}
