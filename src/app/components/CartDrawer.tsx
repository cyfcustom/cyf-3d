import { useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, PackageOpen } from 'lucide-react';
import { cartAtom, cartOpenAtom, cartCountAtom, cartTotalAtom, type CartItem } from '../store/atoms';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from './ui/sheet';

// ─── Cart line item ────────────────────────────────────────────────────────

function CartLineItem({ item }: { item: CartItem }) {
  const [cart, setCart] = useAtom(cartAtom);

  function updateQty(delta: number) {
    const next = item.quantity + delta;
    if (next < item.minOrderQty) return remove();
    setCart(cart.map((i) => i.productId === item.productId ? { ...i, quantity: next } : i));
  }

  function remove() {
    setCart(cart.filter((i) => i.productId !== item.productId));
  }

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
        {item.productImageUrl ? (
          <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingCart size={20} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{item.productName}</p>
        {item.printTechnique && (
          <p className="text-xs text-muted-foreground capitalize mt-0.5">{item.printTechnique}</p>
        )}
        {(item.size || item.color) && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {[item.size, item.color].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Qty stepper */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateQty(-1)}
              className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
              aria-label={`Reducir cantidad de ${item.productName}`}
            >
              <Minus size={11} />
            </button>
            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQty(1)}
              className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
              aria-label={`Aumentar cantidad de ${item.productName}`}
            >
              <Plus size={11} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">
              ${(item.unitPriceUsd * item.quantity).toFixed(2)}
            </span>
            <button
              onClick={remove}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label={`Eliminar ${item.productName} del carrito`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────

function EmptyCart({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6 py-12 text-center">
      <PackageOpen size={48} className="text-muted-foreground/40" />
      <div>
        <p className="font-semibold text-foreground">Tu carrito está vacío</p>
        <p className="text-sm text-muted-foreground mt-1">Agrega productos para comenzar</p>
      </div>
      <button
        onClick={() => { onClose(); navigate('/#productos'); }}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Ver productos
      </button>
    </div>
  );
}

// ─── Cart Drawer ───────────────────────────────────────────────────────────

export function CartDrawer() {
  const [open, setOpen] = useAtom(cartOpenAtom);
  const [cart, setCart] = useAtom(cartAtom);
  const count = useAtomValue(cartCountAtom);
  const total = useAtomValue(cartTotalAtom);
  const navigate = useNavigate();

  function handleCheckout() {
    setOpen(false);
    navigate('/checkout');
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base font-bold">
              <ShoppingCart size={18} />
              Carrito
              {count > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                  {count}
                </span>
              )}
            </SheetTitle>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Vaciar
              </button>
            )}
          </div>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {cart.length === 0 ? (
            <EmptyCart onClose={() => setOpen(false)} />
          ) : (
            <div>
              {cart.map((item) => (
                <CartLineItem key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer — only when cart has items */}
        {cart.length > 0 && (
          <SheetFooter className="px-5 py-4 border-t border-border bg-muted/30 gap-0">
            {/* Totals */}
            <div className="flex flex-col gap-1.5 mb-4 w-full">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{count} artículo{count !== 1 ? 's' : ''}</span>
                <span>${total.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between font-bold text-foreground text-base">
                <span>Total estimado</span>
                <span>${total.toFixed(2)} USD</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                El precio final puede variar según el tipo de cambio.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleCheckout}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--vibrant-orange)' }}
            >
              Continuar al pedido
              <ArrowRight size={18} />
            </button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
