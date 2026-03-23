import { useRef, useState, useCallback } from 'react';
import { Upload, Camera, FileCheck2, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPaymentProof } from '../lib/api/paymentProofsApi';
import { cn } from './ui/utils';

const MAX_MB = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';

interface Props {
  orderId: string;
  onSuccess: () => void;
  /** Show rejection note if admin rejected a previous proof */
  rejectionNote?: string | null;
}

interface FilePreview {
  name: string;
  size: number;
  type: string;
  objectUrl: string | null; // null for PDF
}

export function PaymentUploadZone({ orderId, onSuccess, rejectionNote }: Props) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function pickFile(file: File) {
    setUploadError(null);
    if (file.size > MAX_BYTES) {
      setUploadError(`El archivo es demasiado grande. Máximo ${MAX_MB}MB.`);
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setUploadError('Tipo no permitido. Usa JPG, PNG, WEBP o PDF.');
      return;
    }
    const objectUrl = file.type !== 'application/pdf' ? URL.createObjectURL(file) : null;
    setPreview({ name: file.name, size: file.size, type: file.type, objectUrl });
    setSelectedFile(file);
  }

  function clearSelection() {
    if (preview?.objectUrl) URL.revokeObjectURL(preview.objectUrl);
    setPreview(null);
    setSelectedFile(null);
    setUploadError(null);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
  }, []);

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadPaymentProof({ orderId, file: selectedFile });
      toast.success('Comprobante enviado', {
        description: 'Lo revisaremos y confirmaremos tu pago en breve.',
      });
      clearSelection();
      onSuccess();
    } catch (err: any) {
      const msg = err?.message ?? 'Error al subir el comprobante.';
      setUploadError(msg);
      toast.error('No se pudo subir el comprobante', { description: msg });
    } finally {
      setUploading(false);
    }
  }

  const fmtSize = (b: number) =>
    b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="flex flex-col gap-4">
      {/* Rejection note */}
      {rejectionNote && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">Comprobante rechazado</p>
            <p className="text-sm text-destructive/80 mt-0.5">{rejectionNote}</p>
            <p className="text-sm text-muted-foreground mt-1">Por favor sube un nuevo comprobante.</p>
          </div>
        </div>
      )}

      {!preview ? (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none',
              dragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border">
              <Upload size={22} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {dragging ? 'Suelta aquí' : 'Arrastra tu comprobante'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG, WEBP o PDF · máx. {MAX_MB}MB
              </p>
            </div>
            <span className="text-xs font-semibold text-primary underline underline-offset-2">
              o haz clic para seleccionar
            </span>
          </div>

          {/* Camera button (shows on mobile, useful for taking photo directly) */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border bg-background hover:bg-muted text-sm font-semibold text-foreground transition-colors"
          >
            <Camera size={16} />
            Tomar foto del comprobante
          </button>

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_ACCEPT}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); e.target.value = ''; }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); e.target.value = ''; }}
          />
        </>
      ) : (
        /* Preview */
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Image preview */}
          {preview.objectUrl ? (
            <div className="relative bg-muted max-h-64 overflow-hidden">
              <img
                src={preview.objectUrl}
                alt="Vista previa del comprobante"
                className="w-full h-full object-contain max-h-64"
              />
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border hover:bg-background transition-colors"
                aria-label="Cambiar archivo"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            /* PDF preview */
            <div className="flex items-center gap-3 p-4 bg-muted/30">
              <FileCheck2 size={32} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{preview.name}</p>
                <p className="text-xs text-muted-foreground">PDF · {fmtSize(preview.size)}</p>
              </div>
              <button
                onClick={clearSelection}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                aria-label="Cambiar archivo"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* File info + upload button */}
          <div className="p-4 flex items-center justify-between gap-3 border-t border-border">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{preview.name}</p>
              <p className="text-xs text-muted-foreground">{fmtSize(preview.size)}</p>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shrink-0 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--vibrant-orange)' }}
            >
              {uploading ? (
                <><Loader2 size={15} className="animate-spin" />Subiendo…</>
              ) : (
                <><Upload size={15} />Enviar</>
              )}
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle size={14} />
          {uploadError}
        </p>
      )}
    </div>
  );
}
