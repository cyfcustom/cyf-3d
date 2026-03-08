# Branch: ecommerce-features

## Purpose
Evolucionar el sistema de pedidos del configurador 3D hacia un e-commerce completo con carrito, lista de deseos, historial de pedidos, y gestion de clientes registrados.

## Parent Branch
main

## Created
2026-03-07

## Key Hypotheses
- Los clientes de CYF Customs se beneficiarian de tener cuentas donde guardar sus pedidos y disenos
- Un sistema de carrito permitiria pedidos multiples en una sola transaccion
- La lista de deseos aumentaria engagement y retorno de clientes
- La auto-expiracion de 24h para pedidos no confirmados mantiene la base de datos limpia

## Planned Features

### 1. Registro de Clientes
- Auth con Supabase (email/password, magic link, Google OAuth)
- Perfil de cliente: nombre, telefono, direccion de envio
- Dashboard personal del cliente

### 2. Carrito de Pedidos
- Agregar multiples productos personalizados al carrito
- Cada item guarda: modelo, color, talla, screenshot, capas/diseno
- Resumen de carrito con subtotales
- Enviar carrito completo por WhatsApp o checkout

### 3. Lista de Deseos
- Guardar productos como favoritos sin personalizar
- Guardar disenos en progreso para completar despues
- Compartir lista de deseos por link

### 4. Historial de Pedidos (para clientes registrados)
- Ver pedidos anteriores con status (pending, confirmed, completed)
- Re-ordenar pedidos anteriores con un click
- Tracking basico de estado del pedido

### 5. Gestion de Pedidos (Admin)
- Dashboard de pedidos entrantes con filtros por status
- Confirmar/rechazar pedidos
- Notas internas por pedido
- Notificaciones (email o WhatsApp) al cambiar status

### 6. Reglas de Negocio
- Pedidos no confirmados expiran en 24h (auto-cleanup via cron o edge function)
- Pedidos confirmados se mantienen indefinidamente
- Clientes no registrados: pedidos efimeros (solo link)
- Clientes registrados: pedidos persisten en su historial

## Database Tables Needed
- `customers` (extends auth.users with profile data)
- `cart_items` (product_model_id, config JSON, screenshot_url, customer_id)
- `wishlist_items` (product_model_id, customer_id)
- `orders` (ya existe - agregar customer_id, shipping info)
- `order_status_history` (order_id, from_status, to_status, changed_by, notes)

## Status
PARKED - Ideas documentadas para sprint futuro. El MVP actual (ordenes con link + WhatsApp) esta funcionando.
