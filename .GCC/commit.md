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

## [C003] 2026-03-07
- Branch: main
- Purpose: Fase 1-3 combined - Real models, color system, design application + product catalog
- Previous: Fase 0 complete (C002). Procedural meshes working, lazy loading confirmed.
- Contribution:
  - BabylonCanvas: replaced procedural meshes with SceneLoader.ImportMeshAsync for .glb from Supabase Storage. Auto-normalization (bounding box center + scale). DynamicTexture on largest mesh for image overlay. PBRMaterial with albedoColor for secondary meshes.
  - ToolsPanel: 7 preset colors + custom color picker (conic-gradient input). Side toggle (front/back). Per-layer scale slider (0.1-2.5), X/Y position sliders. Upload area shows active side.
  - Layer atoms: added x, y, side properties for image placement on 3D models.
  - ProductGallery (new): categorized product browser with emoji tab icons, thumbnail grid, step 1 of configurator flow.
  - ConfiguratorWorkspace: 2-step flow (gallery → customizer). "Cambiar producto" back button. Passes model_url to BabylonCanvas.
  - useProductCatalog hook: loads product_categories + product_models from Supabase, filters active-only categories.
  - AdminModelsPage (new): full CRUD admin for categories (add/toggle/delete) and models (upload .glb + thumbnail to Supabase Storage, toggle active, delete).
  - Route /admin/models added to App.tsx with ProtectedRoute.
  - AdminDashboard: added "Modelos 3D" card with Package icon.
  - Supabase: product_categories + product_models tables, models storage bucket (public read, admin upload), 6 categories + 3 models seeded.
  - i18n: added cards.models translations in es/admin.json.
  - Git commit: c366996.
- Files touched: BabylonCanvas.tsx, ToolsPanel.tsx, ConfiguratorWorkspace.tsx, ProductGallery.tsx (new), useProductCatalog.ts (new), AdminModelsPage.tsx (new), AdminDashboard.tsx, App.tsx, atoms.ts, admin.json
- Known bugs:
  - Image upload on loaded .glb models not working (DynamicTexture applied to largest mesh but images don't render on real models)
  - Back-face image mirror on procedural box meshes (less relevant now with real .glb models)

## [C004] 2026-03-07
- Branch: main
- Purpose: Fase 4 - Preview to Quote + Order System
- Previous: Fases 1-3 complete (C003). Models load, colors work, admin CRUD done.
- Contribution:
  - BabylonCanvas: added forwardRef + useImperativeHandle exposing takeScreenshot() via Tools.CreateScreenshotUsingRenderTarget (800x800).
  - ConfiguratorWorkspace: passes canvasRef and modelName/onTakeScreenshot to ToolsPanel.
  - ToolsPanel: handleFinishOrder now captures real 3D screenshot instead of mock image.
  - company_info table: centralized business contact data in Supabase. Phone corrected to 584124553107. useCompanyInfo hook with caching + offline fallback.
  - Footer: all contact info (phone, email, Instagram, Facebook) now from company_info table.
  - orders table: stores pedidos with product_name, color, size, screenshot_url, status, expires_at (24h).
  - order-screenshots storage bucket: public upload for order screenshots.
  - SuccessModal: creates order in DB, uploads screenshot to Supabase Storage, opens wa.me with link to /pedido/:id.
  - OrderViewPage (new): public page showing order details, screenshot, product info, status badge, expiration notice, WhatsApp CTA.
  - Route /pedido/:id added to App.tsx (public, no auth required).
  - GCC branch ecommerce-features created (PARKED) for future: carrito, wishlist, client accounts.
- Files touched: BabylonCanvas.tsx, ConfiguratorWorkspace.tsx, ToolsPanel.tsx, SuccessModal.tsx, Footer.tsx, App.tsx, OrderViewPage.tsx (new), useCompanyInfo.ts (new)
- Supabase: company_info table + orders table + order-screenshots bucket

## [C005] 2026-03-07
- Branch: main
- Purpose: Fase 5 - UX Polish + Security hardening
- Previous: Fase 4 complete (C004). Orders, screenshots, WhatsApp flow working.
- Contribution:
  - ProductGallery: skeleton loading cards + staggered entry animations with motion/react.
  - ConfiguratorWorkspace: AnimatePresence with slide transitions between gallery and customizer.
  - BabylonCanvas: fullscreen toggle button (Maximize2/Minimize2), auto-hiding controls hint (4s timer).
  - ToolsPanel: size selector (S/M/L/XL) between color picker and upload area, updates productConfig atom.
  - theme.css: added fadeInUp keyframe animation.
  - Environment variables: moved Supabase URL + anon key from hardcoded strings to .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). supabase.ts uses import.meta.env with runtime validation. AdminModelsPage STORAGE_BASE derived from env var.
  - .gitignore: added .env, .env.local, .env.*.local, dist.
  - .env.example: created for collaborator reference (no real values).
  - Security audit: verified no other hardcoded secrets in codebase. MFA secrets in MFASetupDialog are runtime-generated, not static.
  - Git commits: 800d492 (UX polish), 321069f (GCC update).
- Files touched: ProductGallery.tsx, ConfiguratorWorkspace.tsx, BabylonCanvas.tsx, ToolsPanel.tsx, theme.css, supabase.ts, AdminModelsPage.tsx, .gitignore, .env (new), .env.example (new)
