import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Mail, Phone, Globe, MessageCircle, Send, Music2,
  Instagram, Facebook, Twitter, Link2, Plus, Trash2,
  ChevronUp, ChevronDown, Pencil, X, Check, Loader2,
  Inbox, Eye,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { cn } from '../../components/ui/utils';
import {
  fetchAllChannels, createChannel, updateChannel, deleteChannel,
  moveChannel, fetchFormSubmissions, markSubmissionRead,
  type ContactChannel, type ChannelType, type ContactFormSubmission,
} from '../../lib/api/contactApi';

// ─── Channel meta ──────────────────────────────────────────────────────────

const CHANNEL_META: Record<ChannelType, { icon: React.ElementType; color: string; label: string; placeholder: string }> = {
  whatsapp:  { icon: MessageCircle, color: '#25D366', label: 'WhatsApp',          placeholder: '584xxxxxxxxxx' },
  email:     { icon: Mail,          color: '#6366f1', label: 'Email',             placeholder: 'contacto@ejemplo.com' },
  instagram: { icon: Instagram,     color: '#E1306C', label: 'Instagram',         placeholder: 'https://instagram.com/usuario' },
  facebook:  { icon: Facebook,      color: '#1877F2', label: 'Facebook',          placeholder: 'https://facebook.com/pagina' },
  tiktok:    { icon: Music2,        color: '#010101', label: 'TikTok',            placeholder: 'https://tiktok.com/@usuario' },
  telegram:  { icon: Send,          color: '#26A5E4', label: 'Telegram',          placeholder: '@usuario o número' },
  phone:     { icon: Phone,         color: '#22c55e', label: 'Teléfono',          placeholder: '+58 414 0000000' },
  twitter:   { icon: Twitter,       color: '#000000', label: 'Twitter / X',       placeholder: 'https://twitter.com/usuario' },
  website:   { icon: Globe,         color: '#6366f1', label: 'Sitio web',         placeholder: 'https://www.ejemplo.com' },
  other:     { icon: Link2,         color: '#64748b', label: 'Otro enlace',       placeholder: 'https://enlace.com' },
};

const CHANNEL_TYPES = Object.keys(CHANNEL_META) as ChannelType[];

// ─── Channel inline editor ─────────────────────────────────────────────────

interface ChannelFormState {
  type: ChannelType;
  label: string;
  value: string;
  active: boolean;
}

const EMPTY_FORM: ChannelFormState = {
  type: 'whatsapp', label: '', value: '', active: true,
};

function ChannelForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: ChannelFormState;
  onSave: (s: ChannelFormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ChannelFormState>(initial ?? EMPTY_FORM);
  const meta = CHANNEL_META[form.type];

  return (
    <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => {
              const t = e.target.value as ChannelType;
              setForm({ ...form, type: t, label: CHANNEL_META[t].label });
            }}
            className="h-9 px-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CHANNEL_TYPES.map((t) => (
              <option key={t} value={t}>{CHANNEL_META[t].label}</option>
            ))}
          </select>
        </div>

        {/* Label */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Etiqueta visible</label>
          <Input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder={meta.label}
            className="h-9 text-sm"
          />
        </div>
      </div>

      {/* Value */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-muted-foreground">Valor (teléfono, URL, email…)</label>
        <Input
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          placeholder={meta.placeholder}
          className="h-9 text-sm"
        />
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="w-4 h-4 rounded accent-primary"
        />
        <span className="text-sm font-medium text-foreground">Visible al público</span>
      </label>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.label || !form.value}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 transition-opacity"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Channels tab ──────────────────────────────────────────────────────────

function ChannelsTab() {
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setChannels(await fetchAllChannels());
    } catch {
      toast.error('Error cargando canales');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSaveNew(form: ChannelFormState) {
    setSaving(true);
    try {
      await createChannel({ ...form, sort_order: channels.length + 1 });
      await load();
      setAddingNew(false);
      toast.success('Canal agregado');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(id: string, form: ChannelFormState) {
    setSaving(true);
    try {
      await updateChannel(id, form);
      await load();
      setEditingId(null);
      toast.success('Canal actualizado');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(ch: ContactChannel) {
    try {
      await updateChannel(ch.id, { active: !ch.active });
      setChannels((prev) => prev.map((c) => c.id === ch.id ? { ...c, active: !c.active } : c));
    } catch {
      toast.error('Error actualizando');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este canal?')) return;
    try {
      await deleteChannel(id);
      setChannels((prev) => prev.filter((c) => c.id !== id));
      toast.success('Canal eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  }

  async function handleMove(id: string, dir: 'up' | 'down') {
    try {
      await moveChannel(channels, id, dir);
      await load();
    } catch {
      toast.error('Error al reordenar');
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{channels.length} canal{channels.length !== 1 ? 'es' : ''} configurado{channels.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setAddingNew(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> Agregar canal
        </button>
      </div>

      {addingNew && (
        <ChannelForm saving={saving} onSave={handleSaveNew} onCancel={() => setAddingNew(false)} />
      )}

      <div className="space-y-2">
        {channels.map((ch, idx) => {
          const meta = CHANNEL_META[ch.type as ChannelType] ?? CHANNEL_META.other;
          const Icon = meta.icon;

          return (
            <div key={ch.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {editingId === ch.id ? (
                <div className="p-3">
                  <ChannelForm
                    initial={{ type: ch.type as ChannelType, label: ch.label, value: ch.value, active: ch.active }}
                    saving={saving}
                    onSave={(form) => handleSaveEdit(ch.id, form)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: meta.color }}>
                    <Icon size={15} className="text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{ch.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{ch.value}</p>
                  </div>

                  {/* A11Y-8: active toggle as accessible switch button */}
                  <button
                    role="switch"
                    aria-checked={ch.active}
                    onClick={() => handleToggleActive(ch)}
                    className={cn(
                      'shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-bold transition-colors select-none',
                      ch.active
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100'
                        : 'border-muted-foreground/30 text-muted-foreground bg-muted/50 hover:bg-muted',
                    )}
                  >
                    {ch.active ? 'Activo' : 'Oculto'}
                  </button>

                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => handleMove(ch.id, 'up')} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => handleMove(ch.id, 'down')} disabled={idx === channels.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Edit / Delete */}
                  <button onClick={() => { setEditingId(ch.id); setAddingNew(false); }} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(ch.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {channels.length === 0 && !addingNew && (
        <div className="text-center py-12 text-muted-foreground">
          <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-sm">No hay canales configurados</p>
        </div>
      )}
    </div>
  );
}

// ─── Submissions tab ───────────────────────────────────────────────────────

function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<ContactFormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    try {
      setSubmissions(await fetchFormSubmissions());
    } catch {
      toast.error('Error cargando mensajes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleMarkRead(id: string) {
    try {
      await markSubmissionRead(id);
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, read: true } : s));
    } catch {
      toast.error('Error actualizando');
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  const unread = submissions.filter((s) => !s.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{submissions.length} mensaje{submissions.length !== 1 ? 's' : ''}</p>
        {unread > 0 && (
          <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
            {unread} sin leer
          </Badge>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-sm">No hay mensajes aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((s) => {
            const date = new Date(s.created_at).toLocaleDateString('es-VE', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            const isExpanded = expandedId === s.id;

            return (
              <div
                key={s.id}
                className={cn(
                  'rounded-xl border bg-card overflow-hidden transition-colors',
                  s.read ? 'border-border' : 'border-primary/40 bg-primary/5',
                )}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  {!s.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email ?? s.phone ?? '—'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{s.message}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground shrink-0">{date}</p>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{s.message}</p>
                    {!s.read && (
                      <button
                        onClick={() => handleMarkRead(s.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <Eye size={12} /> Marcar como leído
                      </button>
                    )}
                    {s.admin_notes && (
                      <p className="text-xs text-muted-foreground italic">Nota: {s.admin_notes}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

type TabId = 'channels' | 'submissions';

export function AdminContactPage() {
  const [tab, setTab] = useState<TabId>('channels');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Contacto</h2>
        <p className="text-muted-foreground font-medium mt-2">
          Configura los canales de contacto y revisa los mensajes recibidos.
        </p>
      </div>

      {/* A11Y-5: tab bar with ARIA roles */}
      <div role="tablist" className="flex gap-1 border-b border-border">
        {([['channels', 'Canales'], ['submissions', 'Mensajes']] as [TabId, string][]).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`tabpanel-${id}`}
            id={`tab-${id}`}
            onClick={() => setTab(id)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px',
              tab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'channels' && (
        <div role="tabpanel" id="tabpanel-channels" aria-labelledby="tab-channels">
          <ChannelsTab />
        </div>
      )}
      {tab === 'submissions' && (
        <div role="tabpanel" id="tabpanel-submissions" aria-labelledby="tab-submissions">
          <SubmissionsTab />
        </div>
      )}
    </div>
  );
}
