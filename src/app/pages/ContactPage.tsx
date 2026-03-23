import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Mail, Phone, Globe, MessageCircle, Send, Music2,
  Instagram, Facebook, Twitter, Link2, ArrowLeft,
  ExternalLink, Loader2, CheckCircle2,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  fetchActiveChannels, submitContactForm,
  buildChannelHref, type ContactChannel, type ChannelType,
} from '../lib/api/contactApi';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { cn } from '../components/ui/utils';

// ─── Channel meta (icon + brand color) ────────────────────────────────────

const CHANNEL_META: Record<ChannelType, { icon: React.ElementType; color: string }> = {
  whatsapp:  { icon: MessageCircle, color: '#25D366' },
  email:     { icon: Mail,          color: '#6366f1' },
  instagram: { icon: Instagram,     color: '#E1306C' },
  facebook:  { icon: Facebook,      color: '#1877F2' },
  tiktok:    { icon: Music2,        color: '#010101' },
  telegram:  { icon: Send,          color: '#26A5E4' },
  phone:     { icon: Phone,         color: '#22c55e' },
  twitter:   { icon: Twitter,       color: '#000000' },
  website:   { icon: Globe,         color: '#6366f1' },
  other:     { icon: Link2,         color: '#64748b' },
};

// ─── Channel button ────────────────────────────────────────────────────────

function ChannelButton({ channel }: { channel: ContactChannel }) {
  const meta = CHANNEL_META[channel.type as ChannelType] ?? CHANNEL_META.other;
  const Icon = meta.icon;
  const href = buildChannelHref(channel);
  const isExternal = !href.startsWith('mailto:') && !href.startsWith('tel:');

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={isExternal ? `${channel.label} (abre en nueva pestaña)` : channel.label}
      className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
    >
      {/* Colored icon badge */}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
        style={{ backgroundColor: meta.color }}
      >
        <Icon size={18} className="text-white" aria-hidden="true" />
      </div>

      {/* Label */}
      <span className="flex-1 text-sm font-bold text-foreground" aria-hidden="true">
        {channel.label}
      </span>

      {/* External indicator */}
      <ExternalLink
        size={14}
        aria-hidden="true"
        className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0"
      />
    </a>
  );
}

// ─── Contact form ──────────────────────────────────────────────────────────

const formSchema = z.object({
  name:    z.string().min(2, 'Ingresa tu nombre'),
  contact: z.string().min(5, 'Ingresa tu correo o teléfono'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type FormValues = z.infer<typeof formSchema>;

function ContactForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  async function onSubmit(values: FormValues) {
    try {
      // Detect if contact field is email or phone
      const isEmail = values.contact.includes('@');
      await submitContactForm({
        name:    values.name,
        email:   isEmail ? values.contact : undefined,
        phone:   isEmail ? undefined : values.contact,
        message: values.message,
      });
      setSent(true);
      reset();
    } catch {
      toast.error('No se pudo enviar el mensaje. Inténtalo de nuevo.');
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 size={40} className="text-emerald-500" />
        <p className="font-bold text-foreground">¡Mensaje enviado!</p>
        <p className="text-sm text-muted-foreground">
          Nos pondremos en contacto contigo pronto.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-sm text-primary underline underline-offset-2 mt-1"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">
          Nombre <span className="text-destructive">*</span>
        </label>
        <Input
          {...register('name')}
          placeholder="Tu nombre"
          className="h-11"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">
          Correo o WhatsApp <span className="text-destructive">*</span>
        </label>
        <Input
          {...register('contact')}
          placeholder="correo@ejemplo.com  o  +58 414 000 0000"
          className="h-11"
          aria-invalid={!!errors.contact}
        />
        {errors.contact && <p className="text-xs text-destructive">{errors.contact.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">
          Mensaje <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={4}
          placeholder="¿En qué podemos ayudarte?"
          aria-invalid={!!errors.message}
          className={cn(
            'w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring resize-none',
            errors.message && 'border-destructive'
          )}
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> Enviando…</>
        ) : (
          'Enviar mensaje'
        )}
      </button>
    </form>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export function ContactPage() {
  const { info } = useCompanyInfo();
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveChannels()
      .then(setChannels)
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background font-urbanist text-foreground">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-lg mx-auto">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a la tienda
        </Link>
        <ThemeToggle />
      </div>

      {/* Main card */}
      <div className="max-w-sm mx-auto px-4 pb-16">

        {/* Brand header */}
        <div className="flex flex-col items-center text-center py-8 gap-3">
          <div className="w-20 h-20 bg-[#FFD600] rounded-2xl flex items-center justify-center shadow-lg">
            <img
              src="/CYF CUSTOM_isotipo circular negro.png"
              alt="CYF Custom"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">{info.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{info.slogan}</p>
          </div>
        </div>

        {/* Channels */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[68px] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {channels.map((ch) => (
              <ChannelButton key={ch.id} channel={ch} />
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            O escríbenos
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Contact form */}
        <ContactForm />
      </div>
    </div>
  );
}
