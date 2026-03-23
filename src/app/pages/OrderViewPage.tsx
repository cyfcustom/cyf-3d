import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package, Clock, CheckCircle, XCircle, ArrowLeft,
  Truck, Star, AlertCircle, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchOrderById } from '../lib/api/ordersApi';
import { fetchProofsForOrder } from '../lib/api/paymentProofsApi';
import {
  subscribeToOrderChanges,
  unsubscribeFromChannel,
} from '../lib/api/realtimeSubscriptions';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { PaymentUploadZone } from '../components/PaymentUploadZone';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import type { Order, OrderStatus } from '../lib/api/ordersApi';
import type { PaymentProof } from '../lib/api/paymentProofsApi';

// ─── Status config ─────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  description: string;
  badgeClass: string;
  Icon: React.ElementType;
  step: number; // 1-6 for the stepper
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  // New statuses
  pending_payment: {
    label: 'Esperando pago',
    description: 'Realiza tu transferencia y sube el comprobante.',
    badgeClass: 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30',
    Icon: Clock, step: 1,
  },
  payment_proof_submitted: {
    label: 'Comprobante enviado',
    description: 'Estamos verificando tu pago. Te notificaremos pronto.',
    badgeClass: 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30',
    Icon: RefreshCw, step: 2,
  },
  payment_verified: {
    label: 'Pago verificado',
    description: 'Tu pago fue confirmado. El pedido entra a producción.',
    badgeClass: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
    Icon: CheckCircle, step: 3,
  },
  in_production: {
    label: 'En producción',
    description: 'Tu pedido está siendo elaborado.',
    badgeClass: 'border-violet-300 text-violet-700 bg-violet-50 dark:bg-violet-950/30',
    Icon: Package, step: 4,
  },
  shipped: {
    label: 'Enviado',
    description: 'Tu pedido fue despachado.',
    badgeClass: 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30',
    Icon: Truck, step: 5,
  },
  delivered: {
    label: 'Entregado',
    description: '¡Tu pedido fue entregado con éxito!',
    badgeClass: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
    Icon: Star, step: 6,
  },
  proof_rejected: {
    label: 'Comprobante rechazado',
    description: 'El comprobante no pudo ser verificado. Sube uno nuevo.',
    badgeClass: 'border-destructive/40 text-destructive bg-destructive/10',
    Icon: AlertCircle, step: 1,
  },
  cancelled: {
    label: 'Cancelado',
    description: 'Este pedido fue cancelado.',
    badgeClass: 'border-muted-foreground/30 text-muted-foreground bg-muted/50',
    Icon: XCircle, step: 0,
  },
  // Legacy statuses (backward compat with configurator flow)
  pending: {
    label: 'Pendiente',
    description: 'Pendiente de confirmación por WhatsApp.',
    badgeClass: 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30',
    Icon: Clock, step: 1,
  },
  confirmed: {
    label: 'Confirmado',
    description: 'Tu pedido fue confirmado.',
    badgeClass: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
    Icon: CheckCircle, step: 3,
  },
  completed: {
    label: 'Completado',
    description: '¡Pedido completado!',
    badgeClass: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
    Icon: Star, step: 6,
  },
  expired: {
    label: 'Expirado',
    description: 'Este pedido ha expirado.',
    badgeClass: 'border-muted-foreground/30 text-muted-foreground bg-muted/50',
    Icon: XCircle, step: 0,
  },
};

const FALLBACK_STATUS: StatusConfig = {
  label: 'Pendiente',
  description: '',
  badgeClass: 'border-amber-300 text-amber-700 bg-amber-50',
  Icon: Clock, step: 1,
};

// ─── Progress stepper ──────────────────────────────────────────────────────

const STEPS = [
  { step: 1, label: 'Pago' },
  { step: 2, label: 'Verificando' },
  { step: 3, label: 'Confirmado' },
  { step: 4, label: 'Producción' },
  { step: 5, label: 'Enviado' },
  { step: 6, label: 'Entregado' },
];

function OrderStepper({ currentStep }: { currentStep: number }) {
  if (currentStep === 0) return null;
  return (
    <div
      className="flex items-center gap-0 w-full"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={6}
      aria-label="Progreso del pedido"
    >
      {STEPS.map((s, i) => {
        const done = s.step < currentStep;
        const active = s.step === currentStep;
        return (
          <div key={s.step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                done ? 'bg-emerald-500 border-emerald-500 text-white'
                : active ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30 bg-muted text-muted-foreground/50'
              }`}>
                {done ? '✓' : s.step}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight ${
                active ? 'text-foreground font-bold' : done ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/50'
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mt-[-12px] transition-all ${
                done ? 'bg-emerald-400' : 'bg-border'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Payment info card ─────────────────────────────────────────────────────

// UX-2: accept dynamic payment fields from company info instead of hardcoding
function PaymentInfoCard({
  phone,
  zelleEmail,
  bankRif,
}: {
  phone: string;
  zelleEmail: string;
  bankRif: string;
}) {
  const cleanPhone = phone.replace(/\D/g, '');
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground">Datos de pago</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zelle</p>
          <p className="text-sm font-semibold text-foreground">{zelleEmail}</p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pago Móvil</p>
          <p className="text-sm font-semibold text-foreground">0414-{cleanPhone.slice(-7)}</p>
          <p className="text-xs text-muted-foreground">Banco: Banesco · {bankRif}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Realiza la transferencia y sube la foto o PDF de tu comprobante abajo.
      </p>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function OrderViewPage() {
  const { id } = useParams<{ id: string }>();
  const { info } = useCompanyInfo();

  const [order, setOrder] = useState<Order | null>(null);
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    const data = await fetchOrderById(id);
    if (!data) { setNotFound(true); setLoading(false); return; }
    setOrder(data);
    setLoading(false);
  }, [id]);

  const loadProofs = useCallback(async () => {
    if (!id) return;
    const data = await fetchProofsForOrder(id);
    setProofs(data);
  }, [id]);

  // Initial load
  useEffect(() => {
    loadOrder();
    loadProofs();
  }, [loadOrder, loadProofs]);

  // Realtime — update order status live
  useEffect(() => {
    if (!id) return;
    // COR-5: only fire toast when status actually changes (not on every UPDATE event)
    const channel = subscribeToOrderChanges(id, (updated) => {
      setOrder((prev) => {
        if (!prev) return prev;
        const newStatus = updated.status as string;
        if (newStatus && newStatus !== prev.status) {
          const cfg = STATUS_CONFIG[newStatus];
          if (cfg) toast.info(`Estado actualizado: ${cfg.label}`);
        }
        return { ...prev, ...updated } as Order;
      });
    });
    return () => { unsubscribeFromChannel(channel); };
  }, [id]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background font-urbanist">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-background font-urbanist flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <XCircle size={64} className="mx-auto text-muted-foreground/40" />
          <h1 className="text-2xl font-extrabold text-foreground">Pedido no encontrado</h1>
          <p className="text-muted-foreground">Este pedido no existe o ya expiró.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] ?? FALLBACK_STATUS;
  const StatusIcon = cfg.Icon;
  const showPayment = order.status === 'pending_payment' || order.status === 'proof_rejected';
  const showUpload = showPayment;
  const showLegacyWhatsApp = order.status === 'pending';

  const lastRejectionNote = proofs.find((p) => p.review_status === 'rejected')?.rejection_note ?? null;

  const createdDate = new Date(order.created_at ?? '').toLocaleDateString('es-VE', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-background font-urbanist text-foreground">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#FFD600] rounded-xl flex items-center justify-center">
              <img src="/CYF CUSTOM_isotipo circular negro.png" alt="CYF" className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-foreground">CYF Custom</span>
          </Link>
          <Badge variant="outline" className={`text-xs font-bold flex items-center gap-1.5 ${cfg.badgeClass}`}>
            <StatusIcon size={12} />
            {cfg.label}
          </Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Title */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Pedido #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
          </p>
          <h1 className="text-2xl font-extrabold text-foreground">
            {order.product_name ?? 'Tu pedido'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{createdDate}</p>
        </div>

        {/* Progress stepper */}
        {cfg.step > 0 && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <OrderStepper currentStep={cfg.step} />
            <p className="text-sm text-muted-foreground text-center mt-4">{cfg.description}</p>
          </div>
        )}

        {/* Screenshot (configurator flow) */}
        {order.screenshot_url && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
            <img
              src={order.screenshot_url}
              alt="Vista previa del diseño"
              className="w-full h-auto max-h-80 object-contain bg-muted/40"
            />
          </div>
        )}

        {/* Product details */}
        {(order.product_name || order.product_size || order.product_color) && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Package size={16} />
              Detalles del producto
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {order.product_name && (
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Producto</p>
                  <p className="text-sm font-bold text-foreground">{order.product_name}</p>
                </div>
              )}
              {order.product_size && (
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Talla</p>
                  <p className="text-sm font-bold text-foreground">{order.product_size}</p>
                </div>
              )}
              {order.product_color && (
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Color</p>
                  <p className="text-sm font-bold text-foreground">{order.product_color}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment info + upload zone */}
        {showPayment && (
          <div className="space-y-4">
            <PaymentInfoCard
              phone={info.phone}
              zelleEmail={info.zelle_email}
              bankRif={info.bank_rif}
            />

            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Subir comprobante de pago</h3>
              <PaymentUploadZone
                orderId={order.id}
                rejectionNote={order.status === 'proof_rejected' ? lastRejectionNote : null}
                onSuccess={() => {
                  loadOrder();
                  loadProofs();
                }}
              />
            </div>
          </div>
        )}

        {/* Proof submitted confirmation */}
        {order.status === 'payment_proof_submitted' && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <RefreshCw size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
            <div>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Verificando tu comprobante</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
                Recibirás una notificación cuando confirmemos tu pago. Normalmente tarda menos de 1 hora.
              </p>
            </div>
          </div>
        )}

        {/* Legacy pending — WhatsApp CTA */}
        {showLegacyWhatsApp && (
          <a
            href={`https://wa.me/${info.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, quiero confirmar mi pedido: ${window.location.href}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#25D366' }}
          >
            <span>Confirmar por WhatsApp</span>
            <span className="text-xl">💬</span>
          </a>
        )}

        {/* WhatsApp fallback — always available */}
        <a
          href={`https://wa.me/${info.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi pedido: ${window.location.href}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border bg-background hover:bg-muted text-sm font-semibold text-foreground transition-colors"
        >
          <span>💬</span>
          Consultar por WhatsApp
        </a>
      </main>
    </div>
  );
}
