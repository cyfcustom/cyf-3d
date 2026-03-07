import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import {
  Loader2, Plus, Trash2, Upload, Eye, EyeOff,
  ArrowLeft, Package, FolderOpen, Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_BASE = 'https://jushzjpeetegcjyikclb.supabase.co/storage/v1/object/public/models';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface Model {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  model_url: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminModelsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'models' | 'categories'>('models');

  // New category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  // New model form
  const [showModelForm, setShowModelForm] = useState(false);
  const [modelForm, setModelForm] = useState({
    name: '',
    category_id: '',
    description: '',
  });
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [catRes, modRes] = await Promise.all([
      supabase.from('product_categories').select('*').order('sort_order'),
      supabase.from('product_models').select('*').order('sort_order'),
    ]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    if (modRes.data) setModels(modRes.data as Model[]);
    setLoading(false);
  };

  // --- Category CRUD ---
  const addCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    const slug = slugify(newCatName);
    const { error } = await supabase.from('product_categories').insert({
      name: newCatName.trim(),
      slug,
      icon: newCatIcon || '',
      sort_order: categories.length + 1,
    });
    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      toast.success('Categoria creada');
      setNewCatName('');
      setNewCatIcon('');
      loadData();
    }
    setAddingCat(false);
  };

  const toggleCategory = async (cat: Category) => {
    await supabase
      .from('product_categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id);
    loadData();
  };

  const deleteCategory = async (cat: Category) => {
    const catModels = models.filter(m => m.category_id === cat.id);
    if (catModels.length > 0) {
      toast.error(`No se puede eliminar: tiene ${catModels.length} modelo(s)`);
      return;
    }
    await supabase.from('product_categories').delete().eq('id', cat.id);
    toast.success('Categoria eliminada');
    loadData();
  };

  // --- Model CRUD ---
  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from('models').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'application/octet-stream',
    });
    if (error) {
      toast.error('Upload error: ' + error.message);
      return null;
    }
    return `${STORAGE_BASE}/${path}`;
  };

  const addModel = async () => {
    if (!modelForm.name.trim() || !modelForm.category_id || !modelFile) {
      toast.error('Nombre, categoria y modelo 3D son requeridos');
      return;
    }

    setUploading(true);
    const slug = slugify(modelForm.name);

    // Upload .glb
    const modelPath = `${slug}.glb`;
    const modelUrl = await uploadFile(modelFile, modelPath);
    if (!modelUrl) { setUploading(false); return; }

    // Upload thumbnail (optional)
    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const thumbPath = `thumbnails/${slug}.${thumbnailFile.name.split('.').pop()}`;
      thumbnailUrl = await uploadFile(thumbnailFile, thumbPath);
    }

    const { error } = await supabase.from('product_models').insert({
      name: modelForm.name.trim(),
      slug,
      category_id: modelForm.category_id,
      description: modelForm.description.trim(),
      model_url: modelUrl,
      thumbnail_url: thumbnailUrl,
      sort_order: models.length + 1,
    });

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      toast.success('Modelo creado');
      setModelForm({ name: '', category_id: '', description: '' });
      setModelFile(null);
      setThumbnailFile(null);
      setShowModelForm(false);
      loadData();
    }
    setUploading(false);
  };

  const toggleModel = async (model: Model) => {
    await supabase
      .from('product_models')
      .update({ is_active: !model.is_active })
      .eq('id', model.id);
    loadData();
  };

  const deleteModel = async (model: Model) => {
    await supabase.from('product_models').delete().eq('id', model.id);
    toast.success('Modelo eliminado');
    loadData();
  };

  const updateThumbnail = async (model: Model) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const thumbPath = `thumbnails/${model.slug}.${file.name.split('.').pop()}`;
      const url = await uploadFile(file, thumbPath);
      if (url) {
        await supabase.from('product_models').update({ thumbnail_url: url }).eq('id', model.id);
        toast.success('Thumbnail actualizado');
        loadData();
      }
    };
    input.click();
  };

  const getCategoryName = (id: string) =>
    categories.find(c => c.id === id)?.name || 'Sin categoria';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold">Modelos 3D</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Gestiona el catalogo de productos para el configurador
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Categorias</p>
          <p className="text-3xl font-extrabold">{categories.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Modelos</p>
          <p className="text-3xl font-extrabold">{models.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Activos</p>
          <p className="text-3xl font-extrabold text-emerald-500">{models.filter(m => m.is_active).length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'models' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-accent'
          }`}
        >
          <Package size={14} className="inline mr-2" />
          Modelos ({models.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'categories' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-accent'
          }`}
        >
          <FolderOpen size={14} className="inline mr-2" />
          Categorias ({categories.length})
        </button>
      </div>

      {activeTab === 'categories' ? (
        /* --- Categories Tab --- */
        <div className="space-y-4">
          {/* Add category */}
          <div className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nombre</label>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ej: Gorras"
              />
            </div>
            <div className="w-20">
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Icono</label>
              <Input
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="🧢"
                className="text-center"
              />
            </div>
            <Button onClick={addCategory} disabled={addingCat || !newCatName.trim()}>
              {addingCat ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              <span className="ml-1">Agregar</span>
            </Button>
          </div>

          {/* Category list */}
          {categories.map((cat) => {
            const modelCount = models.filter(m => m.category_id === cat.id).length;
            return (
              <div key={cat.id} className={`bg-card border rounded-2xl p-4 flex items-center gap-4 ${
                !cat.is_active ? 'opacity-50 border-border/50' : 'border-border'
              }`}>
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{modelCount} modelo(s) · /{cat.slug}</p>
                </div>
                <button
                  onClick={() => toggleCategory(cat)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={cat.is_active ? 'Desactivar' : 'Activar'}
                >
                  {cat.is_active ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} className="text-muted-foreground" />}
                </button>
                <button
                  onClick={() => deleteCategory(cat)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* --- Models Tab --- */
        <div className="space-y-4">
          {/* Add model button / form */}
          {!showModelForm ? (
            <Button onClick={() => setShowModelForm(true)} className="w-full py-6 rounded-2xl">
              <Plus size={18} className="mr-2" />
              Agregar modelo 3D
            </Button>
          ) : (
            <div className="bg-card border border-primary/30 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg">Nuevo modelo</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nombre *</label>
                  <Input
                    value={modelForm.name}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                    placeholder="Franela Oversize"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Categoria *</label>
                  <select
                    value={modelForm.category_id}
                    onChange={(e) => setModelForm({ ...modelForm, category_id: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.filter(c => c.is_active).map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Descripcion</label>
                <Input
                  value={modelForm.description}
                  onChange={(e) => setModelForm({ ...modelForm, description: e.target.value })}
                  placeholder="Corte holgado, ideal para sublimacion..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Model file */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Modelo 3D (.glb) *</label>
                  <input
                    ref={modelInputRef}
                    type="file"
                    accept=".glb,.gltf"
                    onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <button
                    onClick={() => modelInputRef.current?.click()}
                    className={`w-full p-4 rounded-xl border-2 border-dashed text-sm font-semibold transition-all ${
                      modelFile ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Upload size={20} className="mx-auto mb-1" />
                    {modelFile ? modelFile.name : 'Subir archivo .glb'}
                  </button>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Thumbnail (imagen)</label>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <button
                    onClick={() => thumbInputRef.current?.click()}
                    className={`w-full p-4 rounded-xl border-2 border-dashed text-sm font-semibold transition-all ${
                      thumbnailFile ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <ImageIcon size={20} className="mx-auto mb-1" />
                    {thumbnailFile ? thumbnailFile.name : 'Subir imagen (opcional)'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={addModel} disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus size={16} className="mr-2" />}
                  {uploading ? 'Subiendo...' : 'Crear modelo'}
                </Button>
                <Button variant="outline" onClick={() => { setShowModelForm(false); setModelFile(null); setThumbnailFile(null); }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Models list */}
          {models.map((model) => (
            <div key={model.id} className={`bg-card border rounded-2xl p-4 flex items-center gap-4 ${
              !model.is_active ? 'opacity-50 border-border/50' : 'border-border'
            }`}>
              {/* Thumbnail */}
              <button
                onClick={() => updateThumbnail(model)}
                className="w-16 h-16 rounded-xl bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all"
                title="Cambiar thumbnail"
              >
                {model.thumbnail_url ? (
                  <img src={model.thumbnail_url} alt={model.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} className="text-muted-foreground/40" />
                )}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{model.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getCategoryName(model.category_id)} · {model.slug}
                </p>
                {model.description && (
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{model.description}</p>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => toggleModel(model)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={model.is_active ? 'Desactivar' : 'Activar'}
              >
                {model.is_active ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} className="text-muted-foreground" />}
              </button>
              <button
                onClick={() => deleteModel(model)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          ))}

          {models.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No hay modelos todavia</p>
              <p className="text-sm">Agrega tu primer modelo 3D</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
