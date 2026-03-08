# Configurador 3D con Babylon.js - CYF Customs

## Objective
Reemplazar el configurador 2D actual (imagen estatica + CSS flip) con un visualizador 3D real usando Babylon.js. Permitir a los clientes personalizar 7 tipos de productos con colores, imagenes/logos, y obtener cotizacion automatica.

## Products
- Franela regular
- Franela oversize
- Gorra
- Panoleta
- Body bebe
- Taza
- Termo

## Phases

### Fase 0 - Fundamentos [COMPLETE - 5729a8a]
- Instalar Babylon.js
- Crear BabylonCanvas.tsx que reemplace Canvas3D.tsx
- Cargar modelo .glb de prueba con iluminacion y ArcRotateCamera
- Rotacion/zoom real con mouse/touch

### Fase 1 - Modelos 3D de productos
- Obtener/crear modelos .glb para los 7 productos
- ProductModelLoader para cargar modelos por tipo
- UV mapping correcto para aplicar texturas

### Fase 2 - Sistema de colores
- PBRMaterial con albedoColor dinamico
- Selector de parte (body/sleeves/collar) cambia zonas reales del mesh

### Fase 3 - Aplicar diseno del usuario
- DynamicTexture para textura compuesta (base + layers del usuario)
- Controles de posicion/escala/rotacion del diseno sobre UV
- Soporte multi-layer (integrar con layersAtom existente)

### Fase 4 - Preview a Cotizacion
- Screenshot del canvas 3D (engine.createScreenshot)
- Mapeo producto -> calculadora correcta
- Boton "Cotizar" pre-llena calculadora
- WhatsApp con screenshot + cotizacion

### Fase 5 - Pulido UX
- Loading skeleton, transiciones, touch gestures
- Thumbnail selector de productos
- Fullscreen real, LOD para moviles

## Milestones
- [M001] 2026-03-07 - Plan completo definido y guardado en GCC
- [M002] 2026-03-07 - Fase 0 completada: Babylon.js integrado, lazy loading, procedural meshes (5729a8a)
- [M003] 2026-03-07 - Fases 1-3 combinadas: modelos .glb desde Supabase, catálogo con categorías, galería de productos, admin CRUD, sistema de colores mejorado, controles de diseño (c366996)
- [M004] 2026-03-07 - Fase 4: screenshot real 3D, sistema de pedidos (orders table), company_info centralizada, OrderViewPage publica, WhatsApp con link de pedido

## Active Branches
- **ecommerce-features** (PARKED) — Carrito, lista de deseos, historial de pedidos, registro de clientes. Documentado para sprint futuro.
