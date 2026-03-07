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

### Fase 0 - Fundamentos [IN PROGRESS]
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

## Active Branches
(none)
