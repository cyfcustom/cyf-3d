import { useEffect, useState } from 'react';
import { Palette, Sparkles, Clock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

type Product = Database['public']['Tables']['products']['Row'];
type Availability = Product['availability'];

// ─── Availability config ───────────────────────────────────────────────────

const AVAILABILITY_CONFIG: Record<
  Availability,
  { label: string; className: string; show: boolean } | null
> = {
  available: null, // sin badge — estado por defecto, sin ruido visual
  made_to_order: {
    label: 'Pedido especial',
    className: 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30',
    show: true,
  },
  out_of_stock: {
    label: 'Agotado',
    className: 'border-muted-foreground/30 text-muted-foreground bg-muted/50',
    show: true,
  },
  discontinued: { label: '', className: '', show: false },
};

// ─── Skeleton card ─────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg">
      <Skeleton className="aspect-square w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Product card ──────────────────────────────────────────────────────────

function ProductCard({ product, onCustomize }: { product: Product; onCustomize: () => void }) {
  const availConfig = AVAILABILITY_CONFIG[product.availability ?? 'available'];

  // Ocultar productos discontinuados
  if (availConfig !== undefined && !availConfig?.show && availConfig !== null) return null;

  const isUnavailable = product.availability === 'out_of_stock';
  const isMadeToOrder = product.availability === 'made_to_order';

  return (
    <div
      className={`group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border ${isUnavailable ? 'opacity-75' : ''}`}
    >
      {/* Image — clickeable al detalle */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image_url || ''}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Availability badge — top-left */}
          {availConfig && availConfig.show && (
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className={`text-xs font-semibold ${availConfig.className}`}>
                {availConfig.label}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-6">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xl mb-1 font-bold text-foreground hover:underline underline-offset-2">
            {product.name}
          </h3>
        </Link>
        <p className="mb-3 text-sm text-muted-foreground font-medium line-clamp-2">
          {product.description}
        </p>

        {/* Lead time for made-to-order */}
        {isMadeToOrder && product.lead_time_days && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-700 dark:text-amber-400">
            <Clock size={12} />
            <span>Tiempo de producción: {product.lead_time_days} días</span>
          </div>
        )}

        {/* Min order qty warning */}
        {(product.min_order_qty ?? 1) > 1 && (
          <p className="mb-3 text-xs text-muted-foreground font-medium">
            Pedido mínimo: <span className="font-bold text-foreground">{product.min_order_qty} unidades</span>
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: 'var(--vibrant-orange)' }}>
            Desde ${product.base_price.toFixed(2)}
          </span>

          <button
            onClick={isUnavailable ? undefined : onCustomize}
            disabled={isUnavailable}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ backgroundColor: 'var(--electric-blue)' }}
          >
            <Palette size={18} />
            {isUnavailable ? 'Agotado' : 'Personalizar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function ProductGrid() {
  const navigate = useNavigate();
  const { t } = useTranslation('landing');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('availability', 'discontinued')
          .order('name');

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleCustomize = () => navigate('/configurator');

  return (
    <section id="productos" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 font-bold text-foreground">
            {t('products.title')}
            <span style={{ color: 'var(--vibrant-orange)' }}>{t('products.titleHighlight')}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground font-medium">
            {t('products.description')}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard key={product.id} product={product} onCustomize={handleCustomize} />
              ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full">
            <Sparkles className="text-white" size={20} />
            <span className="text-white font-bold">{t('products.freeShipping')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
