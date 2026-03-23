import { supabase } from '@/app/lib/supabase';
import { updateOrderStatus } from './ordersApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProofReviewStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentProof {
  id: string;
  order_id: string;
  storage_path: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  review_status: ProofReviewStatus;
  rejection_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface UploadProofPayload {
  orderId: string;
  file: File;
}

const BUCKET = 'payment-proofs';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// ─── Validation ───────────────────────────────────────────────────────────────

function validateFile(file: File): void {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`El archivo es demasiado grande. Máximo permitido: 10MB.`);
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido. Usa JPG, PNG, WEBP o PDF.`);
  }
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadPaymentProof({
  orderId,
  file,
}: UploadProofPayload): Promise<PaymentProof> {
  validateFile(file);

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `${orderId}/${filename}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Insert metadata row
  const { data, error: dbError } = await supabase
    .from('payment_proofs')
    .insert({
      order_id: orderId,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id ?? null,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  // Advance order status
  await updateOrderStatus(orderId, 'payment_proof_submitted');

  return data as PaymentProof;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchProofsForOrder(orderId: string): Promise<PaymentProof[]> {
  const { data, error } = await supabase
    .from('payment_proofs')
    .select('*')
    .eq('order_id', orderId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.warn('[PaymentProofsAPI] fetchProofsForOrder error:', error.message);
    return [];
  }
  return (data ?? []) as PaymentProof[];
}

// Returns a short-lived signed URL (60s) for admin to view the proof
export async function getProofSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60);

  if (error) {
    console.warn('[PaymentProofsAPI] getProofSignedUrl error:', error.message);
    return null;
  }
  return data.signedUrl;
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

export async function approveProof(proofId: string, orderId: string): Promise<void> {
  const { error } = await supabase
    .from('payment_proofs')
    .update({
      review_status: 'approved',
      reviewed_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', proofId);

  if (error) throw error;

  await updateOrderStatus(orderId, 'payment_verified');
}

export async function rejectProof(
  proofId: string,
  orderId: string,
  rejectionNote: string
): Promise<void> {
  const { error } = await supabase
    .from('payment_proofs')
    .update({
      review_status: 'rejected',
      rejection_note: rejectionNote,
      reviewed_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', proofId);

  if (error) throw error;

  await updateOrderStatus(orderId, 'proof_rejected', rejectionNote);
}
