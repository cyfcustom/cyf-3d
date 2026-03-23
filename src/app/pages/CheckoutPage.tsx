import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ShoppingBag, ChevronDown, Loader2 } from 'lucide-react';
import { cartAtom, cartTotalAtom, cartCountAtom } from '../store/atoms';
import { createOrderWithItems } from '../lib/api/ordersApi';
import { Input } from '../components/ui/input';
import { cn } from '../components/ui/utils';

// ─── Zod schema ────────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  name: z.string().min(2, 'Ingresa tu nombre completo'),
  phone: z.string().min(7, 'Ingresa un número de teléfono válido'),
  email: z.union([z.string().email('Email inválido'), z.literal('')]).optional(),
  delivery_address: z.string().optional(),
  delivery_notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ─── Field wrapper ─────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Order summary ─────────────────────────────────────────────────────────

function OrderSummary({ collapsed }: { collapsed?: boolean }) {
  const cart = useAtomValue(cartAtom);
  const total = useAtomValue(cartTotalAtom);
  const count = useAtomValue(cartCountAtom);

  if (collapsed) {
    return (
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{count} artículo{count !== 1 ? 's' : ''}</span>
        <span className="font-bold text-foreground">${total.toFixed(2)} USD</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {cart.map((item) => (
        <div key={item.productId} className="flex gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
            {item.productImageUrl && (
              <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{item.productName}</p>
            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
          </div>
          <span className="text-sm font-bold shrink-0">
            ${(item.unitPriceUsd * item.quantity).toFixed(2)}
          </span>
        </div>
      ))}

      <div className="border-t border-border pt-3 mt-1">
        <div className="flex justify-between font-bold text-base">
          <span>Total estimado</span>
          <span style={{ color: 'var(--vibrant-orange)' }}>${total.toFixed(2)} USD</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          El precio final puede variar según el tipo de cambio al momento del pago.
        </p>
      </div>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-foreground border-b border-border pb-2 mb-4">
      {children}
    </h2>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useAtom(cartAtom);
  const total = useAtomValue(cartTotalAtom);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background font-urbanist text-foreground flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag size={48} className="text-muted-foreground" />
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <Link
          to="/#productos"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  async function onSubmit(values: CheckoutFormValues) {
    setSubmitting(true);
    try {
      const { order } = await createOrderWithItems(
        {
          guest_name: values.name,
          guest_phone: values.phone,
          guest_email: values.email || undefined,
          subtotal_usd: total,
          delivery_address: values.delivery_address
            ? { address: values.delivery_address }
            : undefined,
          delivery_notes: values.delivery_notes || undefined,
        },
        cart.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          product_image_url: item.productImageUrl ?? undefined,
          print_technique: item.printTechnique ?? undefined,
          size: item.size ?? undefined,
          color: item.color ?? undefined,
          quantity: item.quantity,
          unit_price_usd: item.unitPriceUsd,
        }))
      );

      // Clear cart only after successful insert
      setCart([]);
      navigate(`/order/${order.id}`);
    } catch (err) {
      console.error('[Checkout] Error creating order:', err);
      toast.error('No se pudo crear el pedido', {
        description: 'Intenta de nuevo o contáctanos por WhatsApp.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-urbanist text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">

          {/* ── Left: form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">

            {/* Mobile: collapsible order summary */}
            <div className="lg:hidden rounded-xl border border-border bg-card p-4">
              <button
                type="button"
                onClick={() => setSummaryOpen((v) => !v)}
                className="flex items-center justify-between w-full text-sm font-semibold text-foreground"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag size={15} />
                  Resumen del pedido
                </span>
                <ChevronDown
                  size={16}
                  className={cn('transition-transform text-muted-foreground', summaryOpen && 'rotate-180')}
                />
              </button>
              {summaryOpen && (
                <div className="mt-4 pt-4 border-t border-border">
                  <OrderSummary />
                </div>
              )}
              {!summaryOpen && (
                <div className="mt-3">
                  <OrderSummary collapsed />
                </div>
              )}
            </div>

            {/* Contact info */}
            <div>
              <SectionTitle>Información de contacto</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre completo" required error={errors.name?.message}>
                  <Input
                    {...register('name')}
                    placeholder="Ej. María García"
                    aria-invalid={!!errors.name}
                    className="h-11"
                  />
                </Field>

                <Field label="WhatsApp / Teléfono" required error={errors.phone?.message}>
                  <Input
                    {...register('phone')}
                    type="tel"
                    placeholder="Ej. +58 414 123 4567"
                    aria-invalid={!!errors.phone}
                    className="h-11"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Correo electrónico" error={errors.email?.message}>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="opcional"
                      aria-invalid={!!errors.email}
                      className="h-11"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div>
              <SectionTitle>Entrega</SectionTitle>
              <div className="flex flex-col gap-4">
                <Field label="Dirección de entrega" error={errors.delivery_address?.message}>
                  <Input
                    {...register('delivery_address')}
                    placeholder="Calle, sector, ciudad (opcional si retirarás en local)"
                    className="h-11"
                  />
                </Field>

                <Field label="Notas adicionales" error={errors.delivery_notes?.message}>
                  <textarea
                    {...register('delivery_notes')}
                    rows={3}
                    placeholder="Instrucciones especiales, referencias, etc."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none"
                  />
                </Field>
              </div>
            </div>

            {/* Payment info note */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                ¿Cómo funciona el pago?
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Después de confirmar tu pedido te mostraremos los datos de pago (Zelle, Pago Móvil, transferencia).
                Podrás subir tu comprobante directamente desde la página del pedido.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--vibrant-orange)' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creando pedido…
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Confirmar pedido · ${total.toFixed(2)} USD
                </>
              )}
            </button>
          </form>

          {/* ── Right: sticky summary (desktop only) ── */}
          <div className="hidden lg:block sticky top-20">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
                <ShoppingBag size={16} />
                Resumen del pedido
              </h2>
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
