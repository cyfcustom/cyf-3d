import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function LegacyCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4 text-sm text-muted-foreground">
            Suite de calculadoras original (embed legado). Si no carga, abre directamente /legacy-suite.html.
          </div>
          <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            <iframe
              title="Suite de Calculadoras"
              src="/legacy-suite.html"
              className="w-full"
              style={{ minHeight: '80vh', border: 'none' }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
