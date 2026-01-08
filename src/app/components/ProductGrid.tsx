import { Palette, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRODUCTS = [
  {
    id: 1,
    name: 'Franelas',
    description: 'Personaliza tu franela con diseños únicos',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    price: 'Desde $12.00',
  },
  {
    id: 2,
    name: 'Tazas',
    description: 'Tazas personalizadas para cada ocasión',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
    price: 'Desde $8.00',
  },
  {
    id: 3,
    name: 'Bodys de Bebé',
    description: 'Diseños adorables para los más pequeños',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
    price: 'Desde $10.00',
  },
  {
    id: 4,
    name: 'Termos',
    description: 'Mantén tus bebidas a la temperatura perfecta',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    price: 'Desde $15.00',
  },
];

export function ProductGrid() {
  const navigate = useNavigate();

  const handleCustomize = () => {
    navigate('/configurador');
  };

  return (
    <section id="productos" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl mb-4 font-bold text-foreground"
          >
            Elige tu <span style={{ color: 'var(--vibrant-orange)' }}>base</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground font-medium">
            Selecciona el producto que quieres personalizar y comienza a crear tu diseño único
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border"
            >
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl mb-2 font-bold text-foreground">
                  {product.name}
                </h3>
                <p className="mb-4 text-muted-foreground font-medium">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold" style={{ color: 'var(--vibrant-orange)' }}>
                    {product.price}
                  </span>
                  <button
                    onClick={handleCustomize}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--electric-blue)' }}
                  >
                    <Palette size={18} />
                    Personalizar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full">
            <Sparkles className="text-white" size={20} />
            <span className="text-white font-bold">
              ¡Envío gratis en pedidos mayores a $50!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}