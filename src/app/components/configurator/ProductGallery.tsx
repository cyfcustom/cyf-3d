import { useState } from 'react';
import { Package, ChevronRight } from 'lucide-react';
import { useProductCatalog, ProductModel } from '../../hooks/useProductCatalog';

interface ProductGalleryProps {
  onSelectModel: (model: ProductModel) => void;
}

export function ProductGallery({ onSelectModel }: ProductGalleryProps) {
  const { categories, loading, getModelsByCategory } = useProductCatalog();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Auto-select first category when loaded
  if (!activeCategory && categories.length > 0) {
    setActiveCategory(categories[0].id);
  }

  const currentModels = activeCategory ? getModelsByCategory(activeCategory) : [];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-6 lg:px-12 pt-8 pb-4">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">
          Elige tu producto
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Selecciona el producto que quieres personalizar
        </p>
      </div>

      {/* Category tabs */}
      <div className="px-6 lg:px-12 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 pb-8">
        {currentModels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Package size={48} className="mb-4 opacity-50" />
            <p className="font-semibold">No hay modelos en esta categoria</p>
            <p className="text-sm">Pronto agregaremos nuevos productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentModels.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelectModel(model)}
                className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-muted/50 flex items-center justify-center p-4">
                  {model.thumbnail_url ? (
                    <img
                      src={model.thumbnail_url}
                      alt={model.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Package size={40} className="mx-auto mb-2 opacity-40" />
                      <span className="text-xs font-medium">3D</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {model.name}
                  </h3>
                  {model.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {model.description}
                    </p>
                  )}
                </div>

                {/* Hover arrow */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={16} className="text-primary" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
