import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

export interface ProductModel {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  model_url: string;
  description: string;
  sort_order: number;
}

export function useProductCatalog() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [models, setModels] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);

      const [catRes, modRes] = await Promise.all([
        supabase
          .from('product_categories')
          .select('id, name, slug, icon, sort_order')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('product_models')
          .select('id, category_id, name, slug, thumbnail_url, model_url, description, sort_order')
          .eq('is_active', true)
          .order('sort_order'),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (modRes.data) setModels(modRes.data);
      setLoading(false);
    };

    fetchCatalog();
  }, []);

  // Only return categories that have at least one model
  const activeCategories = categories.filter(
    cat => models.some(m => m.category_id === cat.id)
  );

  const getModelsByCategory = (categoryId: string) =>
    models.filter(m => m.category_id === categoryId);

  return { categories: activeCategories, models, loading, getModelsByCategory };
}
