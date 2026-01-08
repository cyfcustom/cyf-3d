import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ProductGrid } from '../components/ProductGrid';
import { Footer } from '../components/Footer';
import { MobileDemoButton } from '../components/MobileDemoButton';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <ProductGrid />
      <Footer />
      <MobileDemoButton />
    </div>
  );
}