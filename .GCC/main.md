# Configurador 3D con Babylon.js - CYF Custom

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

### Fase 5 - Pulido UX [COMPLETE - 800d492]
- Loading skeleton, transiciones, touch gestures
- Thumbnail selector de productos
- Fullscreen real, LOD para moviles

## Milestones
- [M001] 2026-03-07 - Plan completo definido y guardado en GCC
- [M002] 2026-03-07 - Fase 0 completada: Babylon.js integrado, lazy loading, procedural meshes (5729a8a)
- [M003] 2026-03-07 - Fases 1-3 combinadas: modelos .glb desde Supabase, catálogo con categorías, galería de productos, admin CRUD, sistema de colores mejorado, controles de diseño (c366996)
- [M004] 2026-03-07 - Fase 4: screenshot real 3D, sistema de pedidos (orders table), company_info centralizada, OrderViewPage publica, WhatsApp con link de pedido
- [M005] 2026-03-07 - Fase 5: UX polish - skeleton loading, animated transitions, fullscreen toggle, auto-hide hint, size selector (800d492)

## Ecommerce — Fase 1 [COMPLETE - 2026-03-22]

### Scope
Capa de datos para ecommerce minimalista sin pagos integrados. Flujo LatAm: comprobante de pago manual (Zelle / Pago Móvil / transferencia).

### Decisiones clave
- No se crean ramas git — trabajo directo en main (producto pre-alpha, un solo desarrollador)
- No se integran pasarelas de pago — solo UI de datos de pago + upload de comprobante
- Cart: local-first con `atomWithStorage` (Fases 2+)
- Guest checkout soportado desde el schema

### Archivos creados
- `supabase/migrations/002_ecommerce_orders.sql` — migración completa
- `src/app/lib/api/ordersApi.ts` — CRUD de órdenes
- `src/app/lib/api/paymentProofsApi.ts` — upload + revisión de comprobantes
- `src/app/types/supabase.ts` — tipos actualizados (orders, order_items, order_status_history, payment_proofs, products extendido)

### Schema agregado
| Tabla | Descripción |
|-------|-------------|
| `orders` | Órdenes con soporte guest + legacy fields del configurador |
| `order_items` | Items por orden con snapshot de precio |
| `order_status_history` | Audit trail automático via trigger |
| `payment_proofs` | Metadatos de comprobantes (Storage bucket: `payment-proofs`) |
| `products` (extendido) | + availability, min_order_qty, lead_time_days, print_techniques, tags |

### Estados de orden
`pending_payment → payment_proof_submitted → payment_verified → in_production → shipped → delivered`
Side-states: `proof_rejected`, `cancelled`

### Pendiente (manual en Supabase dashboard)
- Crear bucket `payment-proofs` (private, 10MB limit, MIME: jpg/png/webp/pdf)
- Aplicar RLS policies del bucket (documentadas al final de la migración SQL)

### Próximas fases
- **Fase 2** — `cartAtom` + badge de disponibilidad en ProductGrid
- **Fase 3** — Página de detalle de producto `/product/:id`
- **Fase 4** — Cart drawer + formulario de checkout
- **Fase 5** — Pantalla de upload de comprobante post-orden
- **Fase 6** — Tracking de pedido (cliente) con Realtime
- **Fase 7** — Admin de pedidos

## Ecommerce — Fases 2–7 [COMPLETE - 2026-03-23 | c19f671]
- ProductGrid con availability badges + skeleton loading
- ProductDetailPage con Embla carousel, quantity stepper, add-to-cart
- CartDrawer (Sheet), CheckoutPage (react-hook-form + zod)
- MyOrdersPage, OrderViewPage con Realtime + PaymentUploadZone
- AdminOrdersPage + AdminOrderDetailPage (proof viewer, status transitions)
- Rutas todas en inglés: `/order/:id`, `/my-orders`, `/product/:id`, `/checkout`

## Layout System [COMPLETE - 2026-03-23 | 0cca8d0]
- AdminLayout: sidebar desktop (w-56) + bottom-nav mobile + Sheet drawer
- ConsumerLayout: wrapper Navbar + CartDrawer para rutas consumer
- CartDrawer movido de global App a ConsumerLayout scope

## Contact Page [COMPLETE - 2026-03-23 | e04fcbb]
- `/contact` — Linktree-style standalone page con brand header, botones
  de canal con ícono/color de marca, formulario de contacto
- AdminContactPage (`/admin/config/contact`): tabs Canales + Mensajes
- contactApi: fetchActiveChannels, submitContactForm, CRUD admin, buildChannelHref
- Migración 003: contact_channels + contact_form_submissions, RLS, seed desde company_info
- Botón Contact en Navbar ahora es `<Link to="/contact">`

## Active Branches (GCC)
- **main** — Activo. Ecommerce completo + layout system + contact page integrados.
