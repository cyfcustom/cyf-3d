import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { VinilModule } from '../components/calculator/vinil/VinilModule';
import { SublimModule } from '../components/calculator/sublimacion/SublimModule';
import { EsferasModule } from '../components/calculator/esferas/EsferasModule';
import { DtfModule } from '../components/calculator/dtf/DtfModule';
import { PapeleriaModule } from '../components/calculator/papeleria/PapeleriaModule';
import { EtiquetasModule } from '../components/calculator/etiquetas/EtiquetasModule';
import { EmpaquesModule } from '../components/calculator/empaques/EmpaquesModule';
import { EnviosModule } from '../components/calculator/envios/EnviosModule';
import { ConversorModule } from '../components/calculator/conversor/ConversorModule';
import { PersonalizableModule } from '../components/calculator/personalizado/PersonalizableModule';
import { FAQModule } from '../components/faq/FAQModule';
import { ResumenGeneralModule } from '../components/calculator/resumen/ResumenGeneralModule';
import { SummaryProvider } from '../components/calculator/resumen/summaryContext';
import { Button } from '../components/ui/button';

const sections = [
  { id: 'bienvenida', label: 'Bienvenida' },
  { id: 'vinil', label: 'Vinil' },
  { id: 'sublimacion', label: 'Sublimación' },
  { id: 'esferas', label: 'Esferas navideñas' },
  { id: 'dtf', label: 'DTF terceros' },
  { id: 'papeleria', label: 'Papelería' },
  { id: 'etiquetas', label: 'Etiquetas' },
  { id: 'empaques', label: 'Empaques' },
  { id: 'envios', label: 'Envíos' },
  { id: 'conversor', label: 'Conversor de unidades' },
  { id: 'personalizado', label: 'Producto personalizable' },
  { id: 'faq', label: 'Preguntas frecuentes' },
  { id: 'resumen', label: 'Resumen general' },
];

export function CalculatorSuitePage() {
  const [active, setActive] = useState<(typeof sections)[number]['id']>('bienvenida');
  const [open, setOpen] = useState(false);
  const current = sections.find((s) => s.id === active);
  const activate = (id: (typeof sections)[number]['id']) => {
    setActive(id);
    setOpen(false);
  };

  return (
    <SummaryProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
          {/* Sidebar */}
          <aside className={`w-64 shrink-0 hidden lg:block`}>
            <div className="sticky top-24 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Calculadoras CYF Customs</h3>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => activate(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition text-sm font-medium ${
                      active === s.id ? 'bg-muted font-semibold' : 'hover:bg-muted'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex-1 space-y-8">
            {/* Mobile toggle */}
            <div className="lg:hidden flex justify-between items-center mb-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">Suite CYF Customs</p>
                <h1 className="text-2xl font-bold">{current?.label ?? 'Calculadoras de gastos'}</h1>
              </div>
              <Button variant="outline" onClick={() => setOpen((v) => !v)}>
                {open ? 'Cerrar menú' : 'Menú'}
              </Button>
            </div>

            {open && (
              <div className="lg:hidden border border-border rounded-xl p-3 space-y-1 mb-4 bg-card">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => activate(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition text-sm font-medium ${
                      active === s.id ? 'bg-muted font-semibold' : 'hover:bg-muted'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {active === 'bienvenida' && (
              <section className="space-y-3 bg-card border border-border rounded-2xl p-6 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-primary font-semibold">Bienvenido</p>
                <h1 className="text-3xl font-bold">Calculadoras de gastos CYF Customs</h1>
                <p className="text-muted-foreground text-sm">Migración modular desde el HTML legado. Usa el menú para navegar entre módulos.</p>
              </section>
            )}

            {active === 'vinil' && (
              <section className="space-y-4">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 1</p>
                <h2 className="text-2xl font-bold">Vinil</h2>
                <VinilModule />
              </section>
            )}

            {active === 'sublimacion' && (
              <section className="space-y-4">
                <SublimModule />
              </section>
            )}

            {active === 'esferas' && (
              <section className="space-y-4">
                <EsferasModule />
              </section>
            )}

            {active === 'dtf' && (
              <section className="space-y-4">
                <DtfModule />
              </section>
            )}

            {active === 'papeleria' && (
              <section className="space-y-4">
                <PapeleriaModule />
              </section>
            )}

            {active === 'etiquetas' && (
              <section className="space-y-4">
                <EtiquetasModule />
              </section>
            )}

            {active === 'empaques' && (
              <section className="space-y-4">
                <EmpaquesModule />
              </section>
            )}

            {active === 'envios' && (
              <section className="space-y-4">
                <EnviosModule />
              </section>
            )}

            {active === 'conversor' && (
              <section className="space-y-4">
                <ConversorModule />
              </section>
            )}

            {active === 'personalizado' && (
              <section className="space-y-4">
                <PersonalizableModule />
              </section>
            )}

            {active === 'faq' && (
              <section className="space-y-4">
                <FAQModule />
              </section>
            )}

            {active === 'resumen' && (
              <section className="space-y-4">
                <ResumenGeneralModule />
              </section>
            )}
          </div>
        </div>
      </main>

        <Footer />
      </div>
    </SummaryProvider>
  );
}
