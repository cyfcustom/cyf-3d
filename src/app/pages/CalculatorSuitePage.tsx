import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { VinylModule } from '../components/calculator/vinyl/VinylModule';
import { SublimationModule } from '../components/calculator/sublimation/SublimationModule';
import { SpheresModule } from '../components/calculator/spheres/SpheresModule';
import { DtfModule } from '../components/calculator/dtf/DtfModule';
import { StationeryModule } from '../components/calculator/stationery/StationeryModule';
import { LabelsModule } from '../components/calculator/labels/LabelsModule';
import { PackagingModule } from '../components/calculator/packaging/PackagingModule';
import { ShippingModule } from '../components/calculator/shipping/ShippingModule';
import { ConverterModule } from '../components/calculator/converter/ConverterModule';
import { CustomizableModule } from '../components/calculator/customizable/CustomizableModule';
import { FAQModule } from '../components/faq/FAQModule';
import { SummaryModule } from '../components/calculator/summary/SummaryModule';
import { SummaryProvider } from '../components/calculator/summary/summaryContext';
import { CalculatorConfigProvider } from '../providers/CalculatorConfigProvider';
import { Button } from '../components/ui/button';
import { CalculatorDashboard } from '../components/calculator/CalculatorDashboard';
import { Home } from 'lucide-react';

const sectionDefs = [
  { id: 'dashboard', labelKey: 'common:nav.home', prefix: '\u{1F3E0} ', icon: Home },
  { id: 'vinyl', labelKey: 'calculator:modules.vinyl.name' },
  { id: 'sublimation', labelKey: 'calculator:modules.sublimation.name' },
  { id: 'spheres', labelKey: 'calculator:modules.spheres.name' },
  { id: 'dtf', labelKey: 'calculator:modules.dtf.name' },
  { id: 'stationery', labelKey: 'calculator:modules.stationery.name' },
  { id: 'labels', labelKey: 'calculator:modules.labels.name' },
  { id: 'packaging', labelKey: 'calculator:modules.packaging.name' },
  { id: 'shipping', labelKey: 'calculator:modules.shipping.name' },
  { id: 'converter', labelKey: 'calculator:modules.converter.name' },
  { id: 'customizable', labelKey: 'calculator:modules.custom.name' },
  { id: 'faq', labelKey: 'calculator:modules.faq.name' },
  { id: 'summary', labelKey: 'calculator:modules.summary.name' },
] as const;

export function CalculatorSuitePage() {
  const { t } = useTranslation(['calculator', 'common']);
  const sections = sectionDefs.map((s) => ({
    ...s,
    label: ('prefix' in s ? s.prefix : '') + t(s.labelKey),
  }));
  const [active, setActive] = useState<(typeof sectionDefs)[number]['id']>('dashboard');
  const [open, setOpen] = useState(false);
  const current = sections.find((s) => s.id === active);
  const activate = (id: (typeof sections)[number]['id']) => {
    setActive(id);
    setOpen(false);
  };

  return (
    <CalculatorConfigProvider>
    <SummaryProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
          {/* Sidebar */}
          <aside className={`w-64 shrink-0 hidden lg:block`}>
            <div className="sticky top-24 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground px-3">{t('calculator:suite.title')}</h3>
              <nav className="space-y-1">
                {sections.map((s, idx) => (
                  <div key={s.id}>
                    <button
                      onClick={() => activate(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 ${
                        active === s.id
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {s.label}
                    </button>
                    {idx === 0 && <div className="my-3 border-t border-border" />}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex-1 space-y-8">
            {/* Mobile toggle */}
            <div className="lg:hidden flex justify-between items-center mb-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('calculator:suite.subtitle')}</p>
                <h1 className="text-2xl font-bold">{current?.label ?? t('calculator:suite.expenses')}</h1>
              </div>
              <Button variant="outline" onClick={() => setOpen((v) => !v)}>
                {open ? t('common:nav.closeMenu') : t('common:nav.menu')}
              </Button>
            </div>

            {open && (
              <div className="lg:hidden border border-border rounded-xl p-3 space-y-1 mb-4 bg-card">
                {sections.map((s, idx) => (
                  <div key={s.id}>
                    <button
                      onClick={() => activate(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-sm font-medium ${
                        active === s.id
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {s.label}
                    </button>
                    {idx === 0 && <div className="my-2 border-t border-border" />}
                  </div>
                ))}
              </div>
            )}

            {active === 'dashboard' && (
              <CalculatorDashboard onSelectCalculator={activate} />
            )}

            {active === 'vinyl' && (
              <section className="space-y-4">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('calculator:modules.vinyl.moduleLabel')}</p>
                <h2 className="text-2xl font-bold">{t('calculator:modules.vinyl.name')}</h2>
                <VinylModule />
              </section>
            )}

            {active === 'sublimation' && (
              <section className="space-y-4">
                <SublimationModule />
              </section>
            )}

            {active === 'spheres' && (
              <section className="space-y-4">
                <SpheresModule />
              </section>
            )}

            {active === 'dtf' && (
              <section className="space-y-4">
                <DtfModule />
              </section>
            )}

            {active === 'stationery' && (
              <section className="space-y-4">
                <StationeryModule />
              </section>
            )}

            {active === 'labels' && (
              <section className="space-y-4">
                <LabelsModule />
              </section>
            )}

            {active === 'packaging' && (
              <section className="space-y-4">
                <PackagingModule />
              </section>
            )}

            {active === 'shipping' && (
              <section className="space-y-4">
                <ShippingModule />
              </section>
            )}

            {active === 'converter' && (
              <section className="space-y-4">
                <ConverterModule />
              </section>
            )}

            {active === 'customizable' && (
              <section className="space-y-4">
                <CustomizableModule />
              </section>
            )}

            {active === 'faq' && (
              <section className="space-y-4">
                <FAQModule />
              </section>
            )}

            {active === 'summary' && (
              <section className="space-y-4">
                <SummaryModule />
              </section>
            )}
          </div>
        </div>
      </main>

        <Footer />
      </div>
    </SummaryProvider>
    </CalculatorConfigProvider>
  );
}
