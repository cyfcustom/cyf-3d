# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CYF Customs** is a "Phygital" (Physical + Digital) customization studio web application for Mérida, Venezuela. It combines a landing page, a 3D product configurator, and a suite of pricing calculators for various printing services.

**Brand Mission**: "Amor para ayudar" (Love to help) - democratizing professional design tools for everyone with accessible pricing and empathetic service.

## Development Commands

- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle
- `npm i` - Install dependencies

Note: The project uses npm but has a bun.lock file present.

## Tech Stack

- **Build Tool**: Vite 6.3.5
- **Framework**: React 18.3.1
- **Language**: TypeScript (strict mode disabled)
- **Routing**: React Router Dom v7
- **State Management**: Jotai (atomic state management)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives + custom components
- **Animations**: Motion (Framer Motion)
- **Notifications**: Sonner (toast notifications)
- **Backend**: Supabase (PostgreSQL database)
- **Icons**: Lucide React, Material UI Icons

## Architecture

### Application Structure

The app has three main sections accessible via routes:

1. **Landing Page** (`/`) - Product showcase with brand identity
2. **3D Configurator** (`/configurador`) - Interactive product customization workspace
3. **Calculator Suite** (`/calculadoras`) - Pricing calculators for printing services
4. **Mobile Demo** (`/mobile-demo`) - iPhone frame demo of configurator

### State Management (Jotai)

Global state is managed via atoms in `/src/app/store/atoms.ts`:

- `layersAtom` - User-uploaded images/layers for customization
- `selectedColorAtom` / `selectedColorNameAtom` - Base product color
- `productConfigAtom` - Current product configuration (type, size, color)
- `loadingStateAtom` - Loading state with messages
- `showSuccessModalAtom` - Success modal visibility
- `designPreviewAtom` - Final design preview for WhatsApp

**Key Pattern**: State is atomized rather than using a single store. Components import and use only the atoms they need.

### Import Aliases

Use `@/` alias for imports from `src/`:
```typescript
import { supabase } from '@/app/lib/supabase';
import { ProductConfig } from '@/app/types/supabase';
```

### Component Organization

```
src/app/
├── components/
│   ├── ui/              # Radix-based UI primitives (buttons, dialogs, etc.)
│   ├── calculator/      # Calculator modules (etiquetas, vinil, sublimacion, etc.)
│   ├── configurator/    # 3D configurator components
│   ├── figma/          # Figma-generated components
│   └── faq/            # FAQ components
├── pages/              # Route-level page components
├── hooks/              # Custom React hooks (calculator logic)
├── lib/                # Utilities (supabase client, money formatting)
├── store/              # Jotai atoms
└── types/              # TypeScript types (auto-generated from Supabase)
```

### Calculator Architecture

Each calculator module (papeleria, sublimacion, vinil, etiquetas, empaques, esferas, envios, dtf) follows this pattern:

- Custom hook in `/src/app/hooks/` (e.g., `usePapeleriaCalculator.ts`) handles logic
- Components in `/src/app/components/calculator/[module]/` for UI
- **Local Storage**: All calculators save state to localStorage for persistence
- **Supabase Integration**: Rates fetched from `calculator_rates` table

### Supabase Setup

- Client configured in `/src/app/lib/supabase.ts`
- Database types auto-generated in `/src/app/types/supabase.ts`
- Tables: `products`, `calculator_rates`, `calculator_rates_history`
- **Important**: Supabase URL and anon key are hardcoded (public credentials)

## Design System

### Color Palette

Defined in CYF brand manifesto (organic/boutique aesthetic):

- **Primary Text**: `#0F172A` (Deep Slate Blue)
- **CYF Yellow**: `#FFD600` (Primary CTA color)
- **Vibrant Orange**: `#FF6B35`
- **Electric Blue**: `#00B4D8`
- **Light Background**: `#F8F9FA`
- **Success Green**: `#10B981`
- **Danger Red**: `#DC2626`

**Brand Colors** (from manifesto): Olive, Rose, Beige (calm, natural, warm)

### Typography

- **Font**: Urbanist (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

## Key Features

### 3D Configurator Workflow

1. User navigates to `/configurador`
2. Selects base color and product type (tshirt, mug, baby-body, thermo)
3. Uploads images, adjusts layers (rotation, scale)
4. Clicks "Finalizar y Pedir" button
5. Loading overlay appears (2s delay simulation)
6. Success modal shows with design preview
7. "Enviar Pedido a WhatsApp" button opens WhatsApp with pre-formatted message

**Responsive Design**:
- Mobile (<1024px): Vertical stack - Canvas top 50%, Tools bottom 50%
- Desktop (≥1024px): Horizontal split - Canvas left 70%, Tools right 30%

### Calculator Modules

Each calculator provides real-time pricing for specific services:

- **Papelería**: Business cards, flyers, etc.
- **Sublimación**: Heat transfer printing
- **Vinil**: Vinyl cutting/printing
- **Etiquetas**: Stickers/labels
- **DTF**: Direct-to-film transfers
- **Empaques**: Packaging materials
- **Esferas**: Spherical products
- **Envíos**: Shipping cost calculator

All calculators use `localStorage` for state persistence across sessions.

## Important Notes

- **TypeScript**: `strict: false` in tsconfig - be mindful of type safety
- **Theme**: Dark/light mode support via `next-themes` (stored in `cyf-customs-theme`)
- **Toasts**: Positioned `top-center`, use Sonner for notifications
- **WhatsApp Integration**: Phone number placeholder is `584121234567` (update for production)
- **Loading States**: Simulated delays (1.5-2s) - replace with real async operations
- **Design Preview**: Uses mock image - should be replaced with actual 3D canvas screenshot

## Brand Voice & UX

Per the brand manifesto, maintain:

- **Tone**: Cercano pero experto (Close but expert), optimistic, transparent
- **No corporate jargon**: Avoid "we are leaders" - use "let us help you create"
- **Empathy First**: Products represent memories, dreams, identity
- **Visual Feel**: Like entering a modern design boutique, not a noisy workshop
