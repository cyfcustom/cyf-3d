# Commit History - main

## [C001] 2026-03-07
- Branch: main
- Purpose: Configurador 3D con Babylon.js
- Previous: (initial)
- Contribution: Defined complete 6-phase plan for replacing 2D configurator with Babylon.js 3D viewer. Analyzed current codebase: Canvas3D.tsx is a static image with CSS flip, ToolsPanel.tsx manages layers/colors/upload via Jotai atoms, ConfiguratorHeader.tsx is navigation. Products: franela, franela oversize, gorra, panoleta, body bebe, taza, termo. Plan covers: Babylon.js setup, 3D models, color system, design application, calculator integration, UX polish.

## [C002] 2026-03-07
- Branch: main
- Purpose: Fase 0 - Babylon.js foundation
- Previous: Plan defined in C001
- Contribution: Installed @babylonjs/core, @babylonjs/loaders, @babylonjs/materials v8.54.1. Created BabylonCanvas.tsx with Engine, Scene, ArcRotateCamera (orbit controls), dual HemisphericLight, PBRMaterial with dynamic albedoColor. Built procedural meshes for tshirt (body+sleeves+collar) and mug (cylinder+handle+torus). Replaced Canvas3D in ConfiguratorWorkspace.tsx. Added React.lazy() + Suspense for /configurator route in App.tsx and MobileDemo.tsx to code-split Babylon.js (~6MB) from landing page (~933KB). Created public/models/ directory for future .glb files. Git commit: 5729a8a.
- Files touched: BabylonCanvas.tsx (new), ConfiguratorWorkspace.tsx, App.tsx, MobileDemo.tsx, package.json, package-lock.json
