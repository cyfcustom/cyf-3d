/**
 * Single source of truth for order status display labels and CSS classes.
 * Import from here — do NOT define STATUS_LABEL / STATUS_CLASS locally in pages.
 *
 * Fixes PERF-4 / QUAL-3: prevents silent divergence between
 * MyOrdersPage, AdminOrdersPage, AdminOrderDetailPage, OrderViewPage.
 */

export const STATUS_LABEL: Record<string, string> = {
  // ── Active flow ───────────────────────────────────
  pending_payment:          'Esperando pago',
  payment_proof_submitted:  'Comprobante enviado',
  payment_verified:         'Pago verificado',
  in_production:            'En producción',
  shipped:                  'Enviado',
  delivered:                'Entregado',
  proof_rejected:           'Comprobante rechazado',
  cancelled:                'Cancelado',
  // ── Legacy (configurator flow) ────────────────────
  pending:                  'Pendiente',
  confirmed:                'Confirmado',
  completed:                'Completado',
  expired:                  'Expirado',
};

export const STATUS_CLASS: Record<string, string> = {
  pending_payment:          'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30',
  payment_proof_submitted:  'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30',
  payment_verified:         'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
  in_production:            'border-violet-300 text-violet-700 bg-violet-50 dark:bg-violet-950/30',
  shipped:                  'border-sky-300 text-sky-700 bg-sky-50 dark:bg-sky-950/30',
  delivered:                'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
  proof_rejected:           'border-destructive/40 text-destructive bg-destructive/10',
  cancelled:                'border-muted-foreground/30 text-muted-foreground bg-muted/50',
  // Legacy
  pending:                  'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30',
  confirmed:                'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
  completed:                'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
  expired:                  'border-muted-foreground/30 text-muted-foreground bg-muted/50',
};
