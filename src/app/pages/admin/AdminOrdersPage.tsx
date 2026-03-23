import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { fetchAllOrders, type Order, type OrderStatus } from '@/app/lib/api/ordersApi';
import { STATUS_LABEL, STATUS_CLASS } from '@/app/lib/orderStatusConfig';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

// ─── Status filter pills ────────────────────────────────────────────────────

const ALL_STATUSES: Array<{ value: OrderStatus | ''; label: string }> = [
  { value: '',                        label: 'Todos' },
  { value: 'pending_payment',         label: STATUS_LABEL.pending_payment },
  { value: 'payment_proof_submitted', label: STATUS_LABEL.payment_proof_submitted },
  { value: 'payment_verified',        label: STATUS_LABEL.payment_verified },
  { value: 'in_production',           label: STATUS_LABEL.in_production },
  { value: 'shipped',                 label: STATUS_LABEL.shipped },
  { value: 'delivered',               label: STATUS_LABEL.delivered },
  { value: 'proof_rejected',          label: STATUS_LABEL.proof_rejected },
  { value: 'cancelled',               label: STATUS_LABEL.cancelled },
];

const PAGE_SIZE = 20;

// ─── Order row ─────────────────────────────────────────────────────────────

function OrderRow({ order }: { order: Order }) {
  const cls = STATUS_CLASS[order.status] ?? STATUS_CLASS.pending;
  const label = STATUS_LABEL[order.status] ?? order.status;
  const date = new Date(order.created_at ?? '').toLocaleDateString('es-VE', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const contact = order.guest_name ?? order.guest_phone ?? '—';

  return (
    <Link
      to={`/admin/orders/${order.id}`}
      className="flex items-center gap-4 px-5 py-4 border-b border-border hover:bg-muted/30 transition-colors group"
    >
      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_160px_130px_100px] gap-1 sm:gap-4 items-center">
        {/* Order info */}
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">
            #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {order.product_name ?? 'Pedido ecommerce'} · {contact}
          </p>
        </div>
        {/* Date */}
        <p className="text-xs text-muted-foreground hidden sm:block">{date}</p>
        {/* Status */}
        <div className="hidden sm:flex">
          <Badge variant="outline" className={`text-[10px] font-bold ${cls}`}>{label}</Badge>
        </div>
        {/* Total */}
        <p className="text-sm font-bold text-foreground hidden sm:block">
          {order.subtotal_usd > 0 ? `$${order.subtotal_usd.toFixed(2)}` : '—'}
        </p>
      </div>
      {/* Mobile status */}
      <Badge variant="outline" className={`sm:hidden text-[10px] font-bold shrink-0 ${cls}`}>{label}</Badge>
      <ChevronRight size={16} className="text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  // COR-9: stable reference so useEffect deps are correct
  const load = useCallback(async (s: OrderStatus | '', p: number) => {
    setLoading(true);
    try {
      const result = await fetchAllOrders(s || undefined, p, PAGE_SIZE);
      setOrders(result.data);
      setTotal(result.count);
    } catch {
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, []); // state setters are stable

  useEffect(() => { load(statusFilter, page); }, [load, statusFilter, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <ShoppingBag size={28} />
            Pedidos
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            {total} pedido{total !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={() => load(statusFilter, page)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-semibold transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
        {ALL_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value as OrderStatus | ''); setPage(0); }}
            className={`shrink-0 snap-start px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
              statusFilter === s.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Column headers — desktop */}
        <div className="hidden sm:grid grid-cols-[1fr_160px_130px_100px_32px] gap-4 px-5 py-3 border-b border-border bg-muted/30">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pedido</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fecha</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</span>
          <span />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <ShoppingBag size={32} className="opacity-40" />
            <p className="text-sm font-medium">No hay pedidos</p>
          </div>
        ) : (
          orders.map((o) => <OrderRow key={o.id} order={o} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-lg border border-border text-sm font-semibold disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-lg border border-border text-sm font-semibold disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
