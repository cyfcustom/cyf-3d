import { supabase } from '@/app/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending_payment'
  | 'payment_proof_submitted'
  | 'payment_verified'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'proof_rejected'
  | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  status: OrderStatus;
  subtotal_usd: number;
  subtotal_bs: number | null;
  exchange_rate_snapshot: Record<string, unknown> | null;
  delivery_address: Record<string, unknown> | null;
  delivery_notes: string | null;
  admin_notes: string | null;
  // legacy single-item fields (configurator flow)
  product_name: string | null;
  product_color: string | null;
  product_size: string | null;
  screenshot_url: string | null;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  saved_design_id: string | null;
  product_name: string;
  product_image_url: string | null;
  print_technique: string | null;
  size: string | null;
  color: string | null;
  custom_notes: string | null;
  quantity: number;
  unit_price_usd: number;
  total_price_usd: number;
  created_at: string | null;
}

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string | null;
}

export interface CreateOrderPayload {
  user_id?: string | null;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  subtotal_usd?: number;
  exchange_rate_snapshot?: Record<string, unknown>;
  delivery_address?: Record<string, unknown>;
  delivery_notes?: string;
  // legacy configurator fields
  product_name?: string;
  product_color?: string;
  product_size?: string;
  screenshot_url?: string;
  expires_at?: string;
}

export interface CreateOrderItemPayload {
  product_id?: string;
  saved_design_id?: string;
  product_name: string;
  product_image_url?: string;
  print_technique?: string;
  size?: string;
  color?: string;
  custom_notes?: string;
  quantity: number;
  unit_price_usd: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.warn('[OrdersAPI] fetchOrderById error:', error.message);
    return null;
  }
  return data as Order;
}

export async function fetchMyOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[OrdersAPI] fetchMyOrders error:', error.message);
    return [];
  }
  return (data ?? []) as Order[];
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[OrdersAPI] fetchOrderItems error:', error.message);
    return [];
  }
  return (data ?? []) as OrderItem[];
}

export async function fetchOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[OrdersAPI] fetchOrderStatusHistory error:', error.message);
    return [];
  }
  return (data ?? []) as OrderStatusHistoryEntry[];
}

// Admin: all orders with optional status filter
export async function fetchAllOrders(
  status?: OrderStatus,
  page = 0,
  pageSize = 20
): Promise<{ data: Order[]; count: number }> {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as Order[], count: count ?? 0 };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function createOrderWithItems(
  orderPayload: CreateOrderPayload,
  items: CreateOrderItemPayload[]
): Promise<{ order: Order; items: OrderItem[] }> {
  const order = await createOrder(orderPayload);

  if (items.length === 0) return { order, items: [] };

  const itemRows = items.map((item) => ({ ...item, order_id: order.id }));
  const { data: createdItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(itemRows)
    .select();

  if (itemsError) {
    // COR-1: rollback — delete the orphaned order to avoid leaking guest PII
    await supabase.from('orders').delete().eq('id', order.id).catch(() => {});
    throw itemsError;
  }

  return { order, items: (createdItems ?? []) as OrderItem[] };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status, ...(note ? { admin_notes: note } : {}) })
    .eq('id', orderId);

  if (error) throw error;
}

export async function cancelOrder(orderId: string): Promise<void> {
  return updateOrderStatus(orderId, 'cancelled');
}
