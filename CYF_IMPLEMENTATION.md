# CYF Customs - Landing & Configurador 3D

Sistema completo de personalización de productos con estado de carga, modal de éxito, toasts y adaptación móvil.

## 🎨 Características Implementadas

### ✅ Modal de Éxito
- **Ubicación**: Aparece después de hacer clic en "Finalizar y Pedir"
- **Estilo**: Ventana emergente centrada con fondo blanco, bordes redondeados (24px) y sombra suave
- **Contenido**:
  - Icono de check verde animado
  - Efecto confetti (desktop)
  - Preview del diseño 3D
  - Resumen del producto (Tipo, Talla, Color)
  - Botón CTA amarillo (#FFD600) "Enviar Pedido a WhatsApp 📲"
  - Texto secundario explicativo

### ⏳ Estado de Carga
- **Contexto**: Mientras se sube imagen o genera screenshot 3D
- **Diseño**: Overlay blanco con opacidad 90%
- **Animación**: Spinner amarillo animado + barra de progreso
- **Mensajes dinámicos**:
  - "Renderizando tu obra maestra..."
  - "Aplicando tinta digital..."
  - "Preparando tu diseño..."
  - "Creando magia..."

### 📱 Adaptación Móvil
- **Layout Responsive**: 
  - **Móvil** (< 1024px): Stack vertical - Canvas 3D (50% superior) + Panel de Herramientas (50% inferior)
  - **Desktop** (≥ 1024px): Split view horizontal - Canvas (70% izquierda) + Panel (30% derecha)
- **Optimizaciones móviles**:
  - Botones grandes y fáciles de tocar
  - Espaciado reducido para aprovechar espacio
  - Botón "Finalizar" sticky en la parte inferior
  - Textos e iconos escalados apropiadamente

### 🔔 Sistema de Toasts
- **Diseño**: Pill flotante negra (#0F172A) con texto blanco
- **Posición**: Top-center (adaptable a mobile)
- **Ejemplos**:
  - ✅ "Imagen subida correctamente"
  - 🗑️ "Capa eliminada"

## 🗂️ Arquitectura con Jotai

### Store Global (`/src/app/store/atoms.ts`)
- `layersAtom`: Array de capas (imágenes subidas)
- `selectedColorAtom`: Color base seleccionado
- `selectedColorNameAtom`: Nombre del color
- `productConfigAtom`: Configuración del producto (tipo, talla, color)
- `loadingStateAtom`: Estado de carga (isLoading, message)
- `showSuccessModalAtom`: Visibilidad del modal de éxito
- `designPreviewAtom`: Preview del diseño final

## 🚀 Rutas Disponibles

- `/` - Landing Page principal
- `/configurador` - Configurador 3D (Desktop/Mobile responsive)
- `/mobile-demo` - Demo del configurador dentro de un frame de iPhone 14

## 🎯 Flujo de Usuario

1. Usuario llega al Landing Page (`/`)
2. Hace clic en "Personalizar" en cualquier producto
3. Navega al Configurador (`/configurador`)
4. Selecciona color base, sube imagen, ajusta capas
5. Hace clic en "Finalizar y Pedir"
6. **Loading State** aparece (2 segundos)
7. **Modal de Éxito** se muestra con preview
8. Usuario hace clic en "Enviar Pedido a WhatsApp"
9. Se abre WhatsApp con mensaje pre-formateado

## 🎨 Paleta de Colores

- **Primary Text**: #0F172A (Deep Slate Blue)
- **Amarillo CYF**: #FFD600
- **Naranja Vibrante**: #FF6B35
- **Azul Eléctrico**: #00B4D8
- **Fondo Claro**: #F8F9FA
- **Verde Éxito**: #10B981
- **Rojo Peligro**: #DC2626

## 📱 Tipografía

- **Familia**: Urbanist (Google Fonts)
- **Pesos utilizados**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

## 🛠️ Tecnologías

- React 18
- TypeScript
- Tailwind CSS v4
- Jotai (State Management)
- Motion (Framer Motion) - Animaciones
- Sonner - Toast notifications
- React Router Dom v7
- Lucide React - Iconos

## 📝 Notas de Desarrollo

- Los estados de carga simulan delays con `setTimeout` (1.5s - 2s)
- El preview del diseño usa una imagen mock (en producción, sería un screenshot del canvas 3D)
- El número de WhatsApp es placeholder: `584121234567`
- Todos los componentes están optimizados para touch interactions en mobile
