import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Clock, CheckCircle, XCircle,
  Loader2, ExternalLink, ShoppingBag, User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchOrderById, fetchOrderItems, fetchOrderStatusHistory,
  updateOrderStatus,
  type Order, type OrderItem, type OrderStatusHistoryEntry, type OrderStatus,
} from '@/app/lib/api/ordersApi';
import { STATUS_LABEL, STATUS_CLASS } from '@/app/lib/orderStatusConfig';
import {
  fetchProofsForOrder, getProofSignedUrl, approveProof, rejectProof,
  type PaymentProof,
} from '@/app/lib/api/paymentProofsApi';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';

// STATUS_LABEL and STATUS_CLASS imported from @/app/lib/orderStatusConfig

// ─── Info row ──────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">{value ?? '—'}</span>
    </div>
  );
}

// ─── Proof card ────────────────────────────────────────────────────────────

function ProofCard({
  proof,
  orderId,
  onReviewed,
}: {
  proof: PaymentProof;
  orderId: string;
  onReviewed: () => void;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    getProofSignedUrl(proof.storage_path).then((url) => {
      setSignedUrl(url);
      setLoadingUrl(false);
    });
  }, [proof.storage_path]);

  async function handleApprove() {
    setActing(true);
    try {
      await approveProof(proof.id, orderId);
      toast.success('Pago aprobado — pedido pasa a verificado');
      onReviewed();
    } catch {
      toast.error('Error al aprobar');
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!rejectNote.trim()) { toast.error('Escribe el motivo del rechazo'); return; }
    setActing(true);
    try {
      await rejectProof(proof.id, orderId, rejectNote.trim());
      toast.success('Comprobante rechazado — cliente notificado');
      setShowRejectForm(false);
      onReviewed();
    } catch {
      toast.error('Error al rechazar');
    } finally {
      setActing(false);
    }
  }

  const isPending = proof.review_status === 'pending';
  const isApproved = proof.review_status === 'approved';
  const uploadDate = new Date(proof.uploaded_at ?? '').toLocaleDateString('es-VE', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Proof image / PDF */}
      <div className="relative bg-muted min-h-40 flex items-center justify-center">
        {loadingUrl ? (
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        ) : signedUrl ? (
          proof.mime_type === 'application/pdf' ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Package size={40} className="text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{proof.file_name}</p>
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-bold text-primary underline"
              >
                <ExternalLink size={14} />
                Abrir PDF
              </a>
            </div>
          ) : (
            <img
              src={signedUrl}
              alt="Comprobante de pago"
              className="w-full max-h-72 object-contain"
            />
          )
        ) : (
          <p className="text-sm text-muted-foreground py-8">No se pudo cargar el comprobante</p>
        )}

        {/* Review status badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={
              isApproved
                ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 font-bold'
                : proof.review_status === 'rejected'
                ? 'border-destructive/40 text-destructive bg-destructive/10 font-bold'
                : 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30 font-bold'
            }
          >
            {isApproved ? '✓ Aprobado' : proof.review_status === 'rejected' ? '✗ Rechazado' : 'Pendiente revisión'}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{proof.file_name ?? 'comprobante'}</span>
          <span>{uploadDate}</span>
        </div>

        {/* Rejection note */}
        {proof.rejection_note && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-xs font-semibold text-destructive">Motivo de rechazo:</p>
            <p className="text-xs text-destructive/80 mt-0.5">{proof.rejection_note}</p>
          </div>
        )}

        {/* Actions — only for pending proofs */}
        {isPending && (
          <div className="pt-1 space-y-3">
            {!showRejectForm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={acting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {acting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Aprobar
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={acting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-60"
                >
                  <XCircle size={14} />
                  Rechazar
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Motivo del rechazo (ej. monto incorrecto, imagen ilegible)…"
                  rows={2}
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={acting}
                    className="flex-1 py-2 rounded-lg text-white font-bold text-sm bg-destructive hover:bg-destructive/90 disabled:opacity-60 transition-colors"
                  >
                    {acting ? 'Rechazando…' : 'Confirmar rechazo'}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status transition ─────────────────────────────────────────────────────

// SEC-5: typed with OrderStatus — eliminates the need for `as any` casts
const NEXT_STATUSES: Record<string, Array<{ value: OrderStatus; label: string }>> = {
  payment_verified: [{ value: 'in_production', label: 'Marcar en producción' }],
  in_production:   [{ value: 'shipped',        label: 'Marcar como enviado' }],
  shipped:         [{ value: 'delivered',       label: 'Marcar como entregado' }],
};

function StatusActions({ order, onUpdated }: { order: Order; onUpdated: () => void }) {
  const [acting, setActing] = useState(false);
  const actions = NEXT_STATUSES[order.status] ?? [];

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {actions.map((a) => (
        <button
          key={a.value}
          disabled={acting}
          onClick={async () => {
            setActing(true);
            try {
              await updateOrderStatus(order.id, a.value);
              toast.success(`Estado actualizado: ${STATUS_LABEL[a.value] ?? a.value}`);
              onUpdated();
            } catch { toast.error('Error al actualizar estado'); }
            finally { setActing(false); }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-sm bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {acting ? <Loader2 size={13} className="animate-spin" /> : null}
          {a.label}
        </button>
      ))}
      {/* Cancel — available until in_production */}
      {!['shipped', 'delivered', 'cancelled'].includes(order.status) && (
        <button
          disabled={acting}
          onClick={async () => {
            if (!confirm('¿Cancelar este pedido?')) return;
            setActing(true);
            try {
              await updateOrderStatus(order.id, 'cancelled');
              toast.success('Pedido cancelado');
              onUpdated();
            } catch { toast.error('Error al cancelar'); }
            finally { setActing(false); }
          }}
          className="px-4 py-2 rounded-xl border border-destructive/30 text-destructive font-bold text-sm hover:bg-destructive/10 transition-colors disabled:opacity-60"
        >
          Cancelar pedido
        </button>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [history, setHistory] = useState<OrderStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Full initial load
  const load = useCallback(async () => {
    if (!id) return;
    const [o, its, prs, hist] = await Promise.all([
      fetchOrderById(id),
      fetchOrderItems(id),
      fetchProofsForOrder(id),
      fetchOrderStatusHistory(id),
    ]);
    setOrder(o);
    setItems(its);
    setProofs(prs);
    setHistory(hist);
    setLoading(false);
  }, [id]);

  // PERF-2: targeted reload after proof review (order + proofs + history change)
  const reloadAfterProofReview = useCallback(async () => {
    if (!id) return;
    const [o, prs, hist] = await Promise.all([
      fetchOrderById(id),
      fetchProofsForOrder(id),
      fetchOrderStatusHistory(id),
    ]);
    if (o) setOrder(o);
    setProofs(prs);
    setHistory(hist);
  }, [id]);

  // PERF-2: targeted reload after status transition (order + history change)
  const reloadAfterStatusChange = useCallback(async () => {
    if (!id) return;
    const [o, hist] = await Promise.all([
      fetchOrderById(id),
      fetchOrderStatusHistory(id),
    ]);
    if (o) setOrder(o);
    setHistory(hist);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Pedido no encontrado.</p>
        <Link to="/admin/orders" className="text-primary text-sm underline mt-2 block">← Volver a pedidos</Link>
      </div>
    );
  }

  const cls = STATUS_CLASS[order.status] ?? STATUS_CLASS.pending;
  const label = STATUS_LABEL[order.status] ?? order.status;
  const pendingProofs = proofs.filter((p) => p.review_status === 'pending');

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + title */}
      <div>
        <Link
          to="/admin/orders"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft size={15} />
          Pedidos
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date(order.created_at ?? '').toLocaleDateString('es-VE', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <Badge variant="outline" className={`text-xs font-bold ${cls}`}>{label}</Badge>
        </div>
      </div>

      {/* Status actions */}
      <StatusActions order={order} onUpdated={reloadAfterStatusChange} />

      {/* Customer info */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
          <User size={15} />
          Cliente
        </h3>
        <InfoRow label="Nombre" value={order.guest_name} />
        <InfoRow label="Teléfono" value={order.guest_phone} />
        <InfoRow label="Email" value={order.guest_email} />
        <InfoRow label="Dirección" value={(order.delivery_address as Record<string, string> | null)?.address} />
        <InfoRow label="Notas" value={order.delivery_notes} />
        <InfoRow
          label="Total"
          value={order.subtotal_usd > 0 ? `$${order.subtotal_usd.toFixed(2)} USD` : '—'}
        />
      </div>

      {/* Order items */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <ShoppingBag size={15} />
            Productos ({items.length})
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                {item.product_image_url && (
                  <img src={item.product_image_url} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    x{item.quantity}
                    {item.size && ` · ${item.size}`}
                    {item.color && ` · ${item.color}`}
                    {item.print_technique && ` · ${item.print_technique}`}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground shrink-0">${item.total_price_usd.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment proofs */}
      {proofs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Package size={15} />
            Comprobantes de pago
            {pendingProofs.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                {pendingProofs.length} pendiente{pendingProofs.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>
          {proofs.map((p) => (
            <ProofCard key={p.id} proof={p} orderId={order.id} onReviewed={reloadAfterProofReview} />
          ))}
        </div>
      )}

      {/* Status history timeline */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <Clock size={15} />
            Historial de estados
          </h3>
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-border" />
            {history.map((h, i) => (
              <div key={h.id} className="relative mb-4 last:mb-0">
                <div className={`absolute -left-3.5 w-3 h-3 rounded-full border-2 border-background ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {STATUS_LABEL[h.to_status] ?? h.to_status}
                    </p>
                    {h.from_status && (
                      <p className="text-xs text-muted-foreground">
                        desde {STATUS_LABEL[h.from_status] ?? h.from_status}
                      </p>
                    )}
                    {h.note && <p className="text-xs text-muted-foreground mt-0.5 italic">"{h.note}"</p>}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {new Date(h.created_at ?? '').toLocaleDateString('es-VE', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
