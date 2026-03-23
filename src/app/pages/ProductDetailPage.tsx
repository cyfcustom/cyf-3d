import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import {
  Clock,
  Minus,
  Plus,
  Palette,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { cartAtom, type CartItem } from '../store/atoms';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../components/ui/utils';

type Product = Database['public']['Tables']['products']['Row'];

// ─── Availability label map ────────────────────────────────────────────────

const AVAIL_LABEL: Record<string, string> = {
  available: 'Disponible',
  made_to_order: 'Pedido especial',
  out_of_stock: 'Agotado',
};

const AVAIL_CLASS: Record<string, string> = {
  available: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
  made_to_order: 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30',
  out_of_stock: 'border-muted-foreground/30 text-muted-foreground bg-muted/50',
};

// ─── Technique pill ────────────────────────────────────────────────────────

function TechniquePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

// ─── Quantity stepper ──────────────────────────────────────────────────────

interface StepperProps {
  value: number;
  min: number;
  max?: number;
  onChange: (v: number) => void;
}

function QuantityStepper({ value, min, max = 999, onChange }: StepperProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Reducir cantidad"
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="w-14 h-9 text-center text-sm font-bold border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Aumentar cantidad"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// ─── Image carousel ────────────────────────────────────────────────────────

function ProductCarousel({ images, name }: { images: string[]; name: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-muted select-none">
      {/* Slides */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] aspect-square">
              <img
                src={src}
                alt={`${name} - imagen ${i + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Arrows — only if more than one image */}
      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow hover:bg-background transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow hover:bg-background transition-colors"
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  i === selectedIndex ? 'bg-white w-4' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Skeleton className="h-5 w-32 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-36" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cart, setCart] = useAtom(cartAtom);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Fetch product
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setProduct(data);
          setQuantity(data.min_order_qty ?? 1);
        }
        setLoading(false);
      });
  }, [id]);

  const isUnavailable = product?.availability === 'out_of_stock';

  // Add to cart
  function handleAddToCart() {
    if (!product || isUnavailable) return;

    const existing = cart.find((i) => i.productId === product.id);

    if (existing) {
      setCart(
        cart.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      const item: CartItem = {
        productId: product.id,
        productName: product.name,
        productImageUrl: product.image_url,
        unitPriceUsd: product.base_price,
        quantity,
        printTechnique: product.print_techniques?.[0] ?? null,
        size: null,
        color: null,
        minOrderQty: product.min_order_qty ?? 1,
      };
      setCart([...cart, item]);
    }

    toast.success(`${product.name} agregado al carrito`, {
      description: `${quantity} unidad${quantity > 1 ? 'es' : ''} · $${(product.base_price * quantity).toFixed(2)}`,
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-background font-urbanist text-foreground">
      <DetailSkeleton />
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen bg-background font-urbanist text-foreground flex flex-col items-center justify-center gap-4 px-4">
      <Package size={48} className="text-muted-foreground" />
      <h1 className="text-2xl font-bold">Producto no encontrado</h1>
      <p className="text-muted-foreground text-center">
        Este producto no existe o fue removido del catálogo.
      </p>
      <Link
        to="/#productos"
        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Ver catálogo
      </Link>
    </div>
  );

  const images = [product.image_url ?? '/placeholder.jpg'];
  const minQty = product.min_order_qty ?? 1;
  const subtotal = product.base_price * quantity;
  const availLabel = AVAIL_LABEL[product.availability ?? 'available'];
  const availClass = AVAIL_CLASS[product.availability ?? 'available'];

  return (
    <div className="min-h-screen bg-background font-urbanist text-foreground pb-28 lg:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* Left — image carousel */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ProductCarousel images={images} name={product.name} />
          </div>

          {/* Right — details + actions */}
          <div className="flex flex-col gap-5">

            {/* Name + availability */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
                <Badge variant="outline" className={cn('shrink-0 mt-1', availClass)}>
                  {availLabel}
                </Badge>
              </div>

              {product.category && (
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  {product.category}
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Techniques */}
            {product.print_techniques && product.print_techniques.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Técnicas disponibles
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.print_techniques.map((t) => (
                    <TechniquePill key={t} label={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Lead time */}
            {product.availability === 'made_to_order' && product.lead_time_days && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <Clock size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Tiempo de producción estimado:{' '}
                  <span className="font-bold">{product.lead_time_days} días hábiles</span>
                </p>
              </div>
            )}

            {/* Divider */}
            <hr className="border-border" />

            {/* Price */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Precio por unidad
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--vibrant-orange)' }}>
                  ${product.base_price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
            </div>

            {/* Quantity */}
            {!isUnavailable && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Cantidad
                  {minQty > 1 && (
                    <span className="ml-2 normal-case text-amber-600 dark:text-amber-400">
                      (mínimo {minQty})
                    </span>
                  )}
                </p>
                <QuantityStepper value={quantity} min={minQty} onChange={setQuantity} />
                {quantity > 1 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Subtotal:{' '}
                    <span className="font-bold text-foreground">${subtotal.toFixed(2)} USD</span>
                  </p>
                )}
              </div>
            )}

            {/* Desktop CTAs */}
            <div className="hidden lg:flex flex-col gap-3">
              {product.is_customizable ? (
                <>
                  <button
                    onClick={() => navigate('/configurator')}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: 'var(--electric-blue)' }}
                  >
                    <Palette size={18} />
                    Personalizar en 3D
                  </button>
                  {!isUnavailable && (
                    <button
                      onClick={handleAddToCart}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm border border-border bg-background hover:bg-muted transition-colors"
                    >
                      <ShoppingCart size={16} />
                      Agregar sin personalizar · ${subtotal.toFixed(2)}
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isUnavailable}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: isUnavailable ? undefined : 'var(--vibrant-orange)' }}
                >
                  <ShoppingCart size={18} />
                  {isUnavailable ? 'No disponible' : `Agregar al carrito · $${subtotal.toFixed(2)}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 flex items-center gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex gap-2 flex-1">
          {product.is_customizable && (
            <button
              onClick={() => navigate('/configurator')}
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--electric-blue)' }}
            >
              <Palette size={16} />
              Personalizar
            </button>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isUnavailable}
            className={cn(
              'flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]',
              product.is_customizable ? 'w-12' : 'flex-1'
            )}
            style={{ backgroundColor: isUnavailable ? undefined : 'var(--vibrant-orange)' }}
            aria-label="Agregar al carrito"
          >
            <ShoppingCart size={16} />
            {!product.is_customizable && (
              <span>{isUnavailable ? 'Agotado' : 'Agregar al carrito'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
