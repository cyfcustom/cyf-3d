import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  Palette,
  Send,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  FranelaCard,
  FranelaEmptyState,
  SectionTag,
  SectionTitle,
  SEOUL_RED,
  SEOUL_BLUE,
  SEOUL_YELLOW,
  SEOUL_DARK,
  PLACEHOLDER_IMAGE,
  type Product,
} from '../components/campaign/CampaignFranelas';
import { CampaignViewer } from '../components/campaign/CampaignViewer';
import { cn } from '../components/ui/utils';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

// ─── Campaign identity ────────────────────────────────────────────────────
// Fuente: juntos-a-seul/seul-fuzzy-adventure (SponsorshipCards + constants)

const CAMPAIGN_EMAIL = 'consultas@juntosaseul.com';
const CAMPAIGN_INSTAGRAM = '@juntosaseul_ve';

// ─── Main page ─────────────────────────────────────────────────────────────

export function JuntosASeulPage() {
  const { info } = useCompanyInfo();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchFranelas() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('availability', 'discontinued')
          .contains('tags', ['juntos-a-seul'])
          .order('name');

        if (error) throw error;
        if (!cancelled) setProducts(data ?? []);
      } catch (err) {
        // tags puede no existir aún si las migraciones no fueron aplicadas al
        // remoto: la página degrada al estado "abriendo tanda".
        console.warn('[JuntosASeul] error cargando franelas:', err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFranelas();
    return () => {
      cancelled = true;
    };
  }, []);

  const whatsappHref = useMemo(() => {
    const message = encodeURIComponent(
      '¡Hola! 👋 Quiero coordinar una franela personalizada para la campaña Juntos a Seúl (JMJ 2027).'
    );
    return `https://wa.me/${info.phone}?text=${message}`;
  }, [info.phone]);

  const designOptions = useMemo(() => {
    const opts = products.map((p) => ({
      id: p.id,
      name: p.name,
      url: p.image_url || PLACEHOLDER_IMAGE,
    }));
    return opts.length > 0
      ? opts
      : [{ id: '__proximamente__', name: 'Diseño Juntos a Seúl', url: PLACEHOLDER_IMAGE }];
  }, [products]);

  const activeDesign = designOptions.find((d) => d.id === activeDesignId) ?? designOptions[0];

  const steps = [
    {
      icon: CheckCircle2,
      title: 'Elige tu diseño y talla',
      text: 'Diseños de santos y JMJ en tallas S hasta XL, por unidad.',
    },
    {
      icon: ShoppingCart,
      title: 'Haz tu pre-orden',
      text: 'Agrega al carrito y confirma tus datos de entrega.',
    },
    {
      icon: CreditCard,
      title: 'Paga y sube tu comprobante',
      text: 'Zelle, pago móvil o transferencia. El comprobante se sube desde tu página de pedido.',
    },
    {
      icon: Truck,
      title: 'Producimos por tanda',
      text: 'Agrupamos pre-órdenes por tanda y entregamos en Venezuela.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-urbanist text-gray-900">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${SEOUL_DARK} 0%, ${SEOUL_BLUE} 68%, #0066CC 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20"
          style={{ backgroundColor: SEOUL_YELLOW }}
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full opacity-15"
          style={{ backgroundColor: SEOUL_RED }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white ring-1 ring-white/30"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            >
              Pro-fondos Juntos a Seúl
              <span className="normal-case text-white/80">· Peregrinación JMJ 2027</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Franelas <span style={{ color: SEOUL_YELLOW }}>Juntos a Seúl</span>
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
              Tu santo favorito en una franela de calidad. Pre-orden por tanda para la próxima
              producción.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={loading ? '#como-funciona' : '#disenos'}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: SEOUL_RED, color: '#fff' }}
              >
                Ver pre-orden
                <ArrowRight size={18} />
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-white ring-1 ring-white/40 transition-colors hover:bg-white/10"
              >
                ¿Cómo funciona?
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} /> Entrega en Venezuela
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={15} /> Cada franela aporta a la meta
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={15} /> Mercancía oficial
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ───────────────────────────────────────────── */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTag>Pre-orden por tanda</SectionTag>
        <SectionTitle>¿Cómo funciona?</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${SEOUL_BLUE}14` }}
                >
                  <step.icon size={22} style={{ color: SEOUL_BLUE }} />
                </div>
                <span className="text-sm font-bold" style={{ color: SEOUL_RED }}>
                  0{i + 1}
                </span>
              </div>
              <h3 className="mb-1 text-base font-bold" style={{ color: SEOUL_BLUE }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Visor 3D ───────────────────────────────────────────────── */}
      <section id="visor-3d" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTag>Visor 3D interactivo</SectionTag>
          <SectionTitle>Tu franela en 3D</SectionTitle>
          <p className="mb-10 max-w-2xl text-gray-600">
            Explora la franela blanca de la campaña. Elige un diseño y míralo en el pecho; el logo{' '}
            <strong>Juntos a Seúl</strong> siempre va en la espalda como mercancía oficial.
          </p>

          <CampaignViewer
            designUrl={activeDesign.url}
            designName={activeDesign.name}
            className="mx-auto aspect-square w-full max-w-[640px]"
          />

          <div className="mx-auto mt-8 flex max-w-[780px] flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Elige el diseño del pecho
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {designOptions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDesignId(d.id)}
                  className={cn(
                    'group w-40 shrink-0 overflow-hidden rounded-2xl border-2 bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                    activeDesign.id === d.id ? 'shadow-md' : 'border-gray-200'
                  )}
                  style={
                    activeDesign.id === d.id ? { borderColor: SEOUL_BLUE } : undefined
                  }
                  aria-pressed={activeDesign.id === d.id}
                >
                  <img
                    src={d.url}
                    alt={d.name}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="block truncate px-3 py-2 text-xs font-bold text-gray-700">
                    {d.name}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Girando la franela verás el logo <strong>Juntos a Seúl</strong> en la espalda, bajo
              el cuello.
            </p>
          </div>
        </div>
      </section>

      {/* ── Diseños disponibles ─────────────────────────────────────── */}
      <section id="disenos" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionTag>Pre-orden por unidad</SectionTag>
              <SectionTitle>Diseños disponibles</SectionTitle>
              <p className="max-w-2xl text-gray-600">
                Tallas S hasta XL. Elige tu talla, agrega al carrito y confirma tu pre-orden:
                producimos por tanda y entregamos en Venezuela.
              </p>
            </div>
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
            >
              <ShoppingCart size={16} />
              Ir al carrito
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <FranelaCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <FranelaEmptyState onContact={() => window.open(whatsappHref, '_blank')} />
          )}
        </div>
      </section>

      {/* ── Diseño personalizado ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
          style={{ background: `linear-gradient(135deg, ${SEOUL_BLUE} 0%, ${SEOUL_DARK} 100%)` }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20"
            style={{ backgroundColor: SEOUL_YELLOW }}
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p
                className="mb-2 text-sm font-semibold uppercase tracking-wider"
                style={{ color: SEOUL_YELLOW }}
              >
                Diseño personalizado · Consultar
              </p>
              <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                ¿Tu santo, frase o diseño favorito?
              </h2>
              <p className="leading-relaxed text-white/85">
                Coordina tu pedido con el grupo y lo agregamos a la próxima tanda. Cuéntanos tu idea
                por WhatsApp y te damos el costo de tu diseño.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row lg:flex-col">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: SEOUL_RED, color: '#fff' }}
              >
                <Send size={18} />
                Coordinar por WhatsApp
              </a>
              <a
                href={`mailto:${CAMPAIGN_EMAIL}?subject=Franela%20personalizada%20(Juntos%20a%20Se%C3%BAl)`}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-white ring-1 ring-white/40 transition-colors hover:bg-white/10"
              >
                <Palette size={18} />
                {CAMPAIGN_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Entrega & aporte ────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTag>100% pro-fondos</SectionTag>
          <SectionTitle>Cada franela lleva un pedacito de la meta</SectionTitle>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Truck,
                title: 'Producción por tanda',
                text: 'Agrupamos las pre-órdenes y producimos por lotes para optimizar costos y entregarte un mejor precio.',
              },
              {
                icon: MapPin,
                title: 'Entrega en Venezuela',
                text: 'Envíos coordinados una vez cerrada cada tanda de producción.',
              },
              {
                icon: Users,
                title: 'Aporte directo a la meta',
                text: 'Cada franela vendida aporta directo a nuestra meta de la peregrinación a Seúl 2027.',
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-gray-200 bg-[#F8F9FA] p-6">
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${SEOUL_RED}14` }}
                >
                  <c.icon size={22} style={{ color: SEOUL_RED }} />
                </div>
                <h3 className="mb-1 text-base font-bold" style={{ color: SEOUL_BLUE }}>
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer strip ────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center text-sm text-gray-600 sm:flex-row sm:text-left sm:px-6 lg:px-8">
          <p>
            Campaña de recaudación{' '}
            <span className="font-bold" style={{ color: SEOUL_BLUE }}>
              Juntos a Seúl
            </span>{' '}
            · JMJ 2027
          </p>
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${CAMPAIGN_EMAIL}`}
              className="font-semibold hover:underline"
              style={{ color: SEOUL_BLUE }}
            >
              {CAMPAIGN_EMAIL}
            </a>
            <span className="font-semibold" style={{ color: SEOUL_RED }}>
              {CAMPAIGN_INSTAGRAM}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}