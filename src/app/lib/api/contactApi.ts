import { supabase } from '../supabase';

// ─── Types ─────────────────────────────────────────────────────────────────

export type ChannelType =
  | 'whatsapp' | 'email' | 'instagram' | 'facebook'
  | 'tiktok'   | 'telegram' | 'phone'  | 'twitter'
  | 'website'  | 'other';

export interface ContactChannel {
  id: string;
  type: ChannelType;
  label: string;
  value: string;
  active: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ContactFormSubmission {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  read: boolean;
  admin_notes: string | null;
  created_at: string;
}

export interface SubmitContactPayload {
  name: string;
  email?: string;
  phone?: string;
  message: string;
}

// ─── Link builder ──────────────────────────────────────────────────────────

export function buildChannelHref(channel: ContactChannel): string {
  const v = channel.value.trim();
  switch (channel.type) {
    case 'whatsapp':
      return `https://wa.me/${v.replace(/\D/g, '')}`;
    case 'email':
      return `mailto:${v}`;
    case 'phone':
      return `tel:${v.replace(/\s/g, '')}`;
    case 'telegram':
      if (v.startsWith('http')) return v;
      return `https://t.me/${v.replace(/^@/, '')}`;
    default:
      return v.startsWith('http') ? v : `https://${v}`;
  }
}

// ─── Public queries ────────────────────────────────────────────────────────

/** Returns only active channels, ordered by sort_order (for /contact page). */
export async function fetchActiveChannels(): Promise<ContactChannel[]> {
  const { data, error } = await supabase
    .from('contact_channels')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ContactChannel[];
}

/** Submit a contact form message (anyone, no auth required). */
export async function submitContactForm(payload: SubmitContactPayload): Promise<void> {
  const { error } = await supabase
    .from('contact_form_submissions')
    .insert({
      name:    payload.name,
      email:   payload.email   || null,
      phone:   payload.phone   || null,
      message: payload.message,
    });

  if (error) throw error;
}

// ─── Admin queries ─────────────────────────────────────────────────────────

/** Returns all channels (active + inactive), ordered by sort_order. */
export async function fetchAllChannels(): Promise<ContactChannel[]> {
  const { data, error } = await supabase
    .from('contact_channels')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ContactChannel[];
}

export async function createChannel(
  payload: Pick<ContactChannel, 'type' | 'label' | 'value' | 'active' | 'sort_order'>
): Promise<ContactChannel> {
  const { data, error } = await supabase
    .from('contact_channels')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as ContactChannel;
}

export async function updateChannel(
  id: string,
  patch: Partial<Pick<ContactChannel, 'type' | 'label' | 'value' | 'active' | 'sort_order'>>
): Promise<void> {
  const { error } = await supabase
    .from('contact_channels')
    .update(patch)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteChannel(id: string): Promise<void> {
  const { error } = await supabase
    .from('contact_channels')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/** Move a channel one position up or down in sort_order. */
export async function moveChannel(
  channels: ContactChannel[],
  id: string,
  direction: 'up' | 'down'
): Promise<void> {
  const idx = channels.findIndex((c) => c.id === id);
  if (idx < 0) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= channels.length) return;

  const a = channels[idx];
  const b = channels[swapIdx];

  await Promise.all([
    updateChannel(a.id, { sort_order: b.sort_order }),
    updateChannel(b.id, { sort_order: a.sort_order }),
  ]);
}

// ─── Submissions (admin) ───────────────────────────────────────────────────

export async function fetchFormSubmissions(): Promise<ContactFormSubmission[]> {
  const { data, error } = await supabase
    .from('contact_form_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ContactFormSubmission[];
}

export async function markSubmissionRead(
  id: string,
  adminNotes?: string
): Promise<void> {
  const { error } = await supabase
    .from('contact_form_submissions')
    .update({ read: true, ...(adminNotes !== undefined && { admin_notes: adminNotes }) })
    .eq('id', id);

  if (error) throw error;
}

export async function countUnreadSubmissions(): Promise<number> {
  const { count, error } = await supabase
    .from('contact_form_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('read', false);

  if (error) return 0;
  return count ?? 0;
}
