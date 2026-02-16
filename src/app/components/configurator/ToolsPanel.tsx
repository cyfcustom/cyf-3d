import { Upload, X, RotateCw, Maximize2, Cloud } from 'lucide-react';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  layersAtom,
  selectedColorAtom,
  selectedColorNameAtom,
  productConfigAtom,
  loadingStateAtom,
  showSuccessModalAtom,
  designPreviewAtom,
  Layer,
} from '../../store/atoms';

interface ToolsPanelProps {
  onColorChange: (color: string) => void;
  selectedColor: string;
}

const COLOR_KEYS = [
  { key: 'white', value: '#FFFFFF' },
  { key: 'black', value: '#000000' },
  { key: 'blue', value: '#0F172A' },
  { key: 'red', value: '#DC2626' },
  { key: 'gray', value: '#6B7280' },
  { key: 'green', value: '#16A34A' },
  { key: 'yellow', value: '#FFD600' },
  { key: 'pink', value: '#EC4899' },
];

export function ToolsPanel({ onColorChange, selectedColor }: ToolsPanelProps) {
  const { t } = useTranslation('configurator');
  const [activePart, setActivePart] = useState<'body' | 'sleeves' | 'collar'>('body');
  const [layers, setLayers] = useAtom(layersAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [, setLoadingState] = useAtom(loadingStateAtom);
  const [, setShowSuccessModal] = useAtom(showSuccessModalAtom);
  const [, setDesignPreview] = useAtom(designPreviewAtom);
  const [, setSelectedColorName] = useAtom(selectedColorNameAtom);
  const [productConfig, setProductConfig] = useAtom(productConfigAtom);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Show loading
    setLoadingState({
      isLoading: true,
      message: t('upload.uploading'),
    });

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const reader = new FileReader();

    reader.onload = (e) => {
      const newLayer: Layer = {
        id: Date.now().toString(),
        name: file.name,
        thumbnail: e.target?.result as string,
        rotation: 0,
        scale: 1,
      };
      setLayers([...layers, newLayer]);

      // Hide loading
      setLoadingState({
        isLoading: false,
        message: '',
      });

      // Show success toast
      toast.success(`✅ ${t('upload.success')}`, {
        duration: 3000,
        style: {
          background: '#0F172A',
          color: 'white',
          fontWeight: 600,
          borderRadius: '24px',
          padding: '16px 24px',
        },
      });
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(layer => layer.id !== id));
    toast(`🗑️ ${t('upload.layerRemoved')}`, {
      duration: 2000,
      style: {
        background: '#0F172A',
        color: 'white',
        fontWeight: 600,
        borderRadius: '24px',
        padding: '16px 24px',
      },
    });
  };

  const handleColorChange = (color: string, colorName: string) => {
    onColorChange(color);
    setSelectedColorName(colorName);
    setProductConfig({
      ...productConfig,
      baseColor: color,
      baseColorName: colorName,
    });
  };

  const handleFinishOrder = async () => {
    // Show loading while generating preview
    setLoadingState({
      isLoading: true,
      message: t('upload.rendering'),
    });

    // Simulate screenshot generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Set a mock preview (in real app, this would be a canvas screenshot)
    const mockPreview = 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjBtb2NrdXB8ZW58MXx8fHwxNzY2OTMxMzM2fDA&ixlib=rb-4.1.0&q=80&w=1080';
    setDesignPreview(mockPreview);

    // Hide loading
    setLoadingState({
      isLoading: false,
      message: '',
    });

    // Show success modal
    setShowSuccessModal(true);
  };

  return (
    <div
      className="h-full bg-card flex flex-col border-l border-border"
      style={{
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.06)',
        padding: '24px 20px' // Reduced padding for mobile
      }}
    >
      {/* Header */}
      <div className="mb-4 lg:mb-8">
        <h2 className="text-xl lg:text-2xl mb-2 font-bold text-foreground">
          {t('toolsPanel.title')}
        </h2>
        <div className="text-2xl lg:text-3xl font-extrabold text-foreground">
          $15.00
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 lg:space-y-8 pr-2">
        {/* Part Selector */}
        <div>
          <h3 className="text-xs lg:text-sm mb-2 lg:mb-3 font-semibold text-muted-foreground uppercase">
            {t('toolsPanel.selectPart')}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setActivePart('body')}
              className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-xl transition-all text-sm lg:text-base font-semibold ${
                activePart === 'body'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
            >
              {t('parts.body')}
            </button>
            <button
              onClick={() => setActivePart('sleeves')}
              className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-xl transition-all text-sm lg:text-base font-semibold ${
                activePart === 'sleeves'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
            >
              {t('parts.sleeves')}
            </button>
            <button
              onClick={() => setActivePart('collar')}
              className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-xl transition-all text-sm lg:text-base font-semibold ${
                activePart === 'collar'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
            >
              {t('parts.collar')}
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <h3 className="text-xs lg:text-sm mb-2 lg:mb-3 font-semibold text-muted-foreground uppercase">
            {t('toolsPanel.baseColor')}
          </h3>
          <div className="grid grid-cols-4 gap-2 lg:gap-3">
            {COLOR_KEYS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value, t(`colors.${color.key}`))}
                className={`relative aspect-square rounded-full transition-all hover:scale-110 active:scale-95 ${
                  color.value === '#FFFFFF' ? 'border-2 border-border' : ''
                }`}
                style={{
                  backgroundColor: color.value,
                  boxShadow: selectedColor === color.value ? `0 0 0 3px var(--primary)` : '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title={t(`colors.${color.key}`)}
              />
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div>
          <h3 className="text-xs lg:text-sm mb-2 lg:mb-3 font-semibold text-muted-foreground uppercase">
            {t('toolsPanel.designLogo')}
          </h3>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-2xl p-6 lg:p-8 text-center cursor-pointer transition-all border-2 border-dashed ${
              isDragging ? 'border-primary bg-accent' : 'border-border bg-card'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="pointer-events-none">
              <Cloud size={40} className="mx-auto mb-3 lg:mb-4 lg:w-12 lg:h-12 text-muted-foreground" />
              <p className="mb-1 text-sm lg:text-base font-semibold text-foreground">
                {t('upload.title')}
              </p>
              <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                {t('upload.hint')}
              </p>
            </div>
          </div>

          {/* Layers List */}
          {layers.length > 0 && (
            <div className="mt-3 lg:mt-4 space-y-2">
              <h4 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
                {t('toolsPanel.layers')}
              </h4>
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-muted rounded-xl"
                >
                  <img
                    src={layer.thumbnail}
                    alt={layer.name}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm truncate font-semibold text-foreground">
                      {layer.name}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="p-1.5 lg:p-2 hover:bg-accent active:bg-accent/80 rounded-lg transition-colors"
                      title={t('toolsPanel.rotate')}
                    >
                      <RotateCw size={14} className="lg:w-4 lg:h-4 text-foreground" />
                    </button>
                    <button
                      className="p-1.5 lg:p-2 hover:bg-accent active:bg-accent/80 rounded-lg transition-colors"
                      title={t('toolsPanel.scale')}
                    >
                      <Maximize2 size={14} className="lg:w-4 lg:h-4 text-foreground" />
                    </button>
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="p-1.5 lg:p-2 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors"
                      title={t('toolsPanel.delete')}
                    >
                      <X size={14} className="lg:w-4 lg:h-4" style={{ color: '#DC2626' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA - Sticky on mobile */}
      <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-border sticky bottom-0 bg-card lg:static">
        <button
          className="w-full py-4 lg:py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 lg:hover:scale-105 shadow-lg touch-manipulation font-bold"
          style={{
            backgroundColor: '#FFD600',
            color: '#000000',
          }}
          onClick={handleFinishOrder}
        >
          <span className="text-base lg:text-lg">{t('toolsPanel.finishOrder')}</span>
          <span className="text-xl lg:text-2xl">📲</span>
        </button>
        <p className="text-xs text-center mt-2 lg:mt-3 text-muted-foreground font-medium">
          {t('toolsPanel.whatsAppNote')}
        </p>
      </div>
    </div>
  );
}
