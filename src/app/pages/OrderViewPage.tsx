import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

interface Order {
  id: string;
  product_name: string;
  product_color: string;
  product_size: string;
  screenshot_url: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: '#FFD600', icon: Clock },
  confirmed: { label: 'Confirmado', color: '#10B981', icon: CheckCircle },
  completed: { label: 'Completado', color: '#10B981', icon: CheckCircle },
  expired: { label: 'Expirado', color: '#6B7280', icon: XCircle },
  cancelled: { label: 'Cancelado', color: '#DC2626', icon: XCircle },
};

export function OrderViewPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { info } = useCompanyInfo();

  useEffect(() => {
    if (!id) return;

    supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          // Check if expired
          const isExpired = data.status === 'pending' && new Date(data.expires_at) < new Date();
          if (isExpired) {
            data.status = 'expired';
          }
          setOrder(data as Order);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <XCircle size={64} className="mx-auto text-muted-foreground/40" />
          <h1 className="text-2xl font-extrabold text-foreground">Pedido no encontrado</h1>
          <p className="text-muted-foreground font-medium">
            Este pedido no existe o ya ha expirado.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold transition-all hover:scale-105"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = status.icon;
  const createdDate = new Date(order.created_at).toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-background font-urbanist">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#FFD600] rounded-xl flex items-center justify-center">
                <img src="/CYF CUSTOM_isotipo circular negro.png" alt="CYF" className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-foreground">CYF Customs</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
              <StatusIcon size={14} />
              {status.label}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
              Pedido de {order.product_name}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Creado el {createdDate}
            </p>
          </div>

          {/* Screenshot */}
          {order.screenshot_url && (
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border bg-muted/30">
              <img
                src={order.screenshot_url}
                alt={`Diseño - ${order.product_name}`}
                className="w-full h-auto max-h-[500px] object-contain bg-muted/50"
              />
            </div>
          )}

          {/* Product Details */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Package size={20} />
              Detalles del producto
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Producto</p>
                <p className="text-sm font-bold text-foreground">{order.product_name}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Talla</p>
                <p className="text-sm font-bold text-foreground">{order.product_size}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Color</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border border-border"
                    style={{ backgroundColor: order.product_color }}
                  />
                  <p className="text-sm font-bold text-foreground">{order.product_color}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expiration notice for pending orders */}
          {order.status === 'pending' && (
            <div className="bg-[#FFD600]/10 border border-[#FFD600]/30 rounded-2xl p-4 flex items-start gap-3">
              <Clock size={20} className="text-[#FFD600] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">Pedido pendiente de confirmación</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  Este pedido expira automáticamente en 24 horas si no es confirmado.
                  Escríbenos por WhatsApp para confirmar.
                </p>
              </div>
            </div>
          )}

          {/* CTA */}
          <a
            href={`https://wa.me/${info.phone}?text=${encodeURIComponent(`Hola, quiero confirmar mi pedido: ${window.location.href}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
          >
            <span className="text-lg">Confirmar por WhatsApp</span>
            <span className="text-xl">💬</span>
          </a>
        </div>
      </main>
    </div>
  );
}
