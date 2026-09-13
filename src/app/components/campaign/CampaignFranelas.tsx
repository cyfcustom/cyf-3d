import { useState } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { Minus, Plus, Send, ShoppingCart, Sparkles } from 'lucide-react';
import { Database } from '../../types/supabase';
import { cartAtom, type CartItem } from '../../store/atoms';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

export type Product = Database['public']['Tables']['products']['Row'];

/** Franelas se venden S hasta XL (promesa de la campaña). */
export const FRANELA_SIZES = ['S', 'M', 'L', 'XL'] as const;

export const SEOUL_RED = '#E31B23';
export const SEOUL_BLUE = '#004EA2';
export const SEOUL_YELLOW = '#FFD700';
export const SEOUL_DARK = '#0A1F3D';

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop';

// ─── Small building blocks ─────────────────────────────────────────────────

export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: SEOUL_RED }}>
      {children}
    </p>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-3xl font-bold md:text-4xl" style={{ color: SEOUL_BLUE }}>
      {children}
    </h2>
  );
}

/** Quantity stepper — mismo patrón que ProductDetailPage. */
interface StepperProps {
  value: number;
  min: number;
  onChange: (v: number) => void;
}

export function QuantityStepper({ value, min, onChange }: StepperProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Reducir cantidad"
      >
        <Minus size={14} />
      </button>
      <span className="w-10 h-8 flex items-center justify-center text-sm font-bold border border-border rounded-lg bg-background">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
        aria-label="Aumentar cantidad"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// ─── Franela card (pre-orden por tanda) ────────────────────────────────────

export function FranelaCard({ product }: { product: Product }) {
  const [cart, setCart] = useAtom(cartAtom);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const minQty = product.min_order_qty ?? 1;
  const unavailable = product.availability === 'out_of_stock';

  function handleAddToCart() {
    if (unavailable) return;
    if (!size) {
      toast.error('Elige una talla', {
        description: 'Las franelas de campaña van de la talla S hasta la XL.',
      });
      return;
    }

    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      productImageUrl: product.image_url,
      unitPriceUsd: product.base_price,
      quantity,
      printTechnique: product.print_techniques?.[0] ?? null,
      size,
      color: null,
      minOrderQty: minQty,
    };

    const hasSizeLine = cart.some((i) => i.productId === product.id && i.size === size);
    const final: CartItem[] = hasSizeLine
      ? cart.map((i) =>
          i.productId === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      : [...cart, item];

    setCart(final);
    toast.success(`${product.name} (talla ${size}) agregado al carrito`, {
      description: `${quantity} unidad${quantity > 1 ? 'es' : ''} · $${(product.base_price * quantity).toFixed(2)} USD`,
    });
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">👕</div>
        )}
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white shadow"
          style={{ backgroundColor: SEOUL_RED }}
        >
          <Sparkles size={12} /> Pre-orden por tanda
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-bold" style={{ color: SEOUL_BLUE }}>
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {product.description ?? 'Franela de calidad. Cada franela aporta directo a nuestra meta.'}
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold" style={{ color: SEOUL_RED }}>
            ${product.base_price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">USD / unidad</span>
        </div>

        {/* Size */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Talla {unavailable && <span className="normal-case text-gray-400">· agotada</span>}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FRANELA_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                disabled={unavailable}
                className={cn(
                  'min-w-9 px-2.5 py-1.5 rounded-lg text-sm font-bold border transition-colors',
                  size === s
                    ? 'text-white border-transparent'
                    : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400',
                  unavailable && 'opacity-40 cursor-not-allowed'
                )}
                style={size === s ? { backgroundColor: SEOUL_BLUE } : undefined}
                aria-pressed={size === s}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <QuantityStepper value={quantity} min={minQty} onChange={setQuantity} />
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={unavailable}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: SEOUL_RED }}
          >
            <ShoppingCart size={16} />
            {unavailable ? 'Agotada' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Empty / opening-soon state ────────────────────────────────────────────

export function FranelaEmptyState({ onContact }: { onContact: () => void }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-1">
        <img
          src={PLACEHOLDER_IMAGE}
          alt="Franela Juntos a Seúl"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      <div className="flex flex-col items-start justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2 lg:p-10">
        <Badge
          className="border-transparent px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: SEOUL_BLUE }}
        >
          Abriendo tanda de producción
        </Badge>
        <h3 className="text-2xl font-bold" style={{ color: SEOUL_BLUE }}>
          Los diseños de esta tanda llegan muy pronto
        </h3>
        <p className="max-w-xl leading-relaxed text-gray-600">
          Estamos cerrando la primera tanda de franelas con diseños de santos y JMJ. Cada franela
          aporta directo a nuestra meta de la campaña. Déjanos tu pedido por WhatsApp y te avisamos
          apenas abramos la pre-orden.
        </p>
        <button
          type="button"
          onClick={onContact}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: SEOUL_RED }}
        >
          <Send size={16} />
          Avisarme cuando abra la pre-orden
        </button>
      </div>
    </div>
  );
}