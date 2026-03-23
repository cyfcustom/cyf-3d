import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, PackageOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchMyOrders, type Order } from '../lib/api/ordersApi';
import { STATUS_LABEL, STATUS_CLASS } from '../lib/orderStatusConfig';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

// ─── Order card ────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const label = STATUS_LABEL[order.status] ?? order.status;
  const cls   = STATUS_CLASS[order.status] ?? STATUS_CLASS.pending;
  const date  = new Date(order.created_at ?? '').toLocaleDateString('es-VE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <Link
      to={`/order/${order.id}`}
      className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <ShoppingBag size={20} className="text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-foreground truncate">
            {order.product_name ?? `Pedido #${order.order_number ?? order.id.slice(0, 8).toUpperCase()}`}
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // COR-6: use live Supabase session — never read from localStorage atom
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id;
      if (!userId) { setLoading(false); return; }

      fetchMyOrders(userId).then((data) => {
        setOrders(data);
        setLoading(false);
      });
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag size={18} className="text-foreground" />
        <h1 className="text-base font-bold text-foreground">Mis pedidos</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <PackageOpen size={48} className="text-muted-foreground/40" />
          <div>
            <p className="font-semibold text-foreground">Aún no tienes pedidos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tus pedidos aparecerán aquí cuando realices una compra.
            </p>
          </div>
          <Link
            to="/#productos"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ver productos
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
