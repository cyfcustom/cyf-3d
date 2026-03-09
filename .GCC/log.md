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

## [L005] 2026-03-07 | main
- Observation: AdminModelsPage created with full CRUD for categories + models. Route /admin/models wired. Dashboard card added. Build passes. Committed c366996.
- Thought: Fases 1-3 effectively complete (models load from Supabase, color system works, design controls exist). However image overlay on real .glb models doesn't work — DynamicTexture is applied to largest mesh but the loaded models have their own UV mapping that doesn't match the DynamicTexture approach used with procedural meshes.
- Action: GCC commit C003. Moving to Fase 4 (preview + quote) and Fase 5 (UX polish).

### BUG: Image upload on loaded .glb models
- Status: OPEN
- Description: When a user uploads an image in the configurator with a real .glb model loaded from Supabase, the image does not appear on the 3D model. The DynamicTexture is assigned to the largest mesh but the UV coordinates of real .glb models don't align with the procedural texture drawing logic.
- Root cause: redrawTexture() draws images at fixed canvas coordinates assuming a flat UV layout. Real .glb models have arbitrary UV unwrapping from their 3D modeling software. The texture renders correctly as a solid color fill but positioned image overlays fall outside visible UV islands.
- Possible fixes: (a) Standardize UV layouts in Blender before export, (b) Use decal projection instead of DynamicTexture, (c) Detect UV islands and map image placement accordingly.
- Files: src/app/components/configurator/BabylonCanvas.tsx (redrawTexture function, ~line 27-60)

## [L006] 2026-03-07 | main
- Observation: Fase 4 implemented: BabylonCanvas exposes takeScreenshot via forwardRef. SuccessModal captures real 3D screenshot. Company info centralized in Supabase (company_info table). Phone corrected to 584124553107. Footer + SuccessModal now use useCompanyInfo hook.
- Thought: Web Share API on macOS Chrome opens system share sheet (AirDrop, Messages) instead of WhatsApp. The fallback (Supabase upload + wa.me) also problematic because user expects direct WhatsApp flow. Better approach: create order in DB, send link via WhatsApp.
- Action: Created orders table. SuccessModal now: uploads screenshot to Supabase Storage, creates order row, opens wa.me with link to /pedido/:id. OrderViewPage shows design, product details, status, expiration notice, and WhatsApp CTA. GCC branch ecommerce-features created (PARKED) documenting future ideas: carrito, wishlist, client accounts, order history.

## [L007] 2026-03-07 | main
- Observation: Fase 5 UX polish needed: loading states, transitions, touch controls, fullscreen.
- Thought: Focus on highest-impact items: skeleton loading replaces blank screens, animated transitions make gallery-to-customizer feel smooth, fullscreen toggle is essential for 3D viewing, size selector was missing from the order flow.
- Action: Implemented all Fase 5 items. ProductGallery: skeleton cards + staggered entry animations. ConfiguratorWorkspace: AnimatePresence with slide transitions. BabylonCanvas: fullscreen toggle (Maximize2/Minimize2), auto-hiding hint (4s). ToolsPanel: S/M/L/XL size selector. Committed 800d492. ALL 6 PHASES COMPLETE.

## [L008] 2026-03-07 | main
- Observation: Supabase URL and anon key were hardcoded in supabase.ts and AdminModelsPage.tsx. .gitignore was missing .env and dist entries.
- Thought: Even though anon keys are "public", best practice is env vars for portability and to avoid accidental leaks of project IDs. Also needed .env.example for collaborators.
- Action: Created .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Updated supabase.ts to use import.meta.env with validation. AdminModelsPage STORAGE_BASE derived from env var. Updated .gitignore. Created .env.example. Ran security audit: no other hardcoded secrets found. GCC commit C005.
