import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { ShoppingBag, ChevronRight, PackageOpen } from 'lucide-react';
import { authUserAtom } from '../store/atoms';
import { fetchMyOrders, type Order } from '../lib/api/ordersApi';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

// ─── Status display map ────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Esperando pago',
  payment_proof_submitted: 'Comprobante enviado',
  payment_verified: 'Pago verificado',
  in_production: 'En producción',
  shipped: 'Enviado',
  delivered: 'Entregado',
  proof_rejected: 'Comprobante rechazado',
  cancelled: 'Cancelado',
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  completed: 'Completado',
};

const STATUS_CLASS: Record<string, string> = {
  pending_payment: 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30',
  payment_proof_submitted: 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30',
  payment_verified: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
  in_production: 'border-violet-300 text-violet-700 bg-violet-50 dark:bg-violet-950/30',
  shipped: 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30',
  delivered: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
  proof_rejected: 'border-destructive/40 text-destructive bg-destructive/10',
  cancelled: 'border-muted-foreground/30 text-muted-foreground bg-muted/50',
  pending: 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30',
  confirmed: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
  completed: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
};

// ─── Order card ────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const label = STATUS_LABEL[order.status] ?? order.status;
  const cls = STATUS_CLASS[order.status] ?? STATUS_CLASS.pending;
  const date = new Date(order.created_at ?? '').toLocaleDateString('es-VE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <Link
      to={`/order/${order.id}`}
      className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <ShoppingBag size={20} className="text-muted-foreground" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-foreground truncate">
            {order.product_name ?? `Order #${order.order_number ?? order.id.slice(0, 8).toUpperCase()}`}
          </p>
          <Badge variant="outline" className={`text-[10px] font-bold shrink-0 ${cls}`}>
            {label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-xs text-muted-foreground">{date}</p>
          {order.subtotal_usd > 0 && (
            <p className="text-xs font-semibold text-foreground">${order.subtotal_usd.toFixed(2)} USD</p>
          )}
        </div>
      </div>

      <ChevronRight size={16} className="text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card">
      <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function MyOrdersPage() {
  const authUser = useAtomValue(authUserAtom);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.id) { setLoading(false); return; }
    fetchMyOrders(authUser.id).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [authUser?.id]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag size={18} className="text-foreground" />
        <h1 className="text-base font-bold text-foreground">My orders</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <PackageOpen size={48} className="text-muted-foreground/40" />
          <div>
            <p className="font-semibold text-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your orders will appear here once you place one.
            </p>
          </div>
          <Link
            to="/#productos"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}
