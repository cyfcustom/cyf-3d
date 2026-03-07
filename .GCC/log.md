# OTA Log - main

## [L001] 2026-03-07 | main
- Observation: Current Canvas3D.tsx is purely 2D - static image with CSS rotateY for front/back toggle. No actual 3D rendering. Rotate/zoom buttons are decorative.
- Thought: Need full replacement with Babylon.js. Keep ToolsPanel and Jotai state management, replace only the canvas component.
- Action: Created GCC structure, committed 6-phase plan. Starting Fase 0.

## [L002] 2026-03-07 | main
- Observation: Babylon.js v8 installed. Procedural meshes (tshirt, mug) render correctly with PBR material. Color changes work via albedoColor. ArcRotateCamera provides real orbit/zoom.
- Thought: MobileDemo.tsx was statically importing ConfiguratorWorkspace, defeating lazy loading. Fixed both routes to use React.lazy(). Bundle split confirmed: index=933KB, configurator=6MB.
- Action: Fase 0 complete. Committed 5729a8a. Next: Fase 1 (real .glb models) or Fase 2 (color zones).

## [L003] 2026-03-07 | main
- Observation: DynamicTexture + faceUV implemented. Image upload works on front side correctly. Color picker (7 presets + custom), smaller circles, side toggle, scale/position sliders all functional.
- Thought: Back face image appears mirrored. Tried canvas ctx.scale(-1,1) flip but combined with faceUV(1,0,0.5,1) it double-flips. Removed canvas flip but still incorrect. Root cause: the interplay between box face 0 UV winding and the faceUV Vector4 needs deeper investigation.
- Action: Logged as known bug. Moving forward with plan. Will fix back-face mirror issue later.

### BUG: Back-face image mirror
- Status: OPEN
- Description: When a layer is set to side='back', the image appears horizontally mirrored on the back face of the t-shirt box mesh.
- Root cause: faceUV for face 0 (back, z-) and the natural UV winding of the back face create a mirror effect. Neither faceUV flip alone nor canvas flip alone resolves it. May need to test: (a) swapping faceUV to (0.5,0,1,1) with canvas flip, (b) using two separate planes instead of a box, (c) custom UV remapping on the mesh vertices.
- Files: src/app/components/configurator/BabylonCanvas.tsx lines ~100-110 (faceUV) and ~50-60 (redrawBodyTexture)

## [L004] 2026-03-07 | main
- Observation: Implemented product catalog with Supabase. Created product_categories + product_models tables. Uploaded 3 .glb models to Supabase Storage (models bucket). Built ProductGallery component and 2-step configurator flow (select product -> customize).
- Thought: BabylonCanvas now accepts modelUrl prop directly from selected ProductModel, instead of productType mapping. Removed hardcoded MODEL_FILES map. Categories only show if they have active models. Back-face mirror bug still open (now less relevant since using loaded .glb models with their own UV mapping).
- Action: Migration applied: create_product_catalog. Seeded 6 categories + 3 models. Removed local .glb files from public/models/. Gallery + catalog hook created.
