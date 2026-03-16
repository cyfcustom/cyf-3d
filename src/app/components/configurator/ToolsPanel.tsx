import { X, Cloud, Palette } from 'lucide-react';
import { useState, useRef } from 'react';
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
  modelName?: string;
  activeSide: 'front' | 'back';
  onActiveSideChange: (side: 'front' | 'back') => void;
  onTakeScreenshot?: () => Promise<string | null>;
}

const PRESET_COLORS = [
  { key: 'white', value: '#FFFFFF' },
  { key: 'black', value: '#000000' },
  { key: 'blue', value: '#0F172A' },
  { key: 'red', value: '#DC2626' },
  { key: 'gray', value: '#6B7280' },
  { key: 'green', value: '#16A34A' },
  { key: 'yellow', value: '#FFD600' },
];

export function ToolsPanel({ onColorChange, selectedColor, modelName, activeSide, onActiveSideChange, onTakeScreenshot }: ToolsPanelProps) {
  const { t } = useTranslation('configurator');
  const [layers, setLayers] = useAtom(layersAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [customColor, setCustomColor] = useState('#EC4899');
  const [, setLoadingState] = useAtom(loadingStateAtom);
  const [, setShowSuccessModal] = useAtom(showSuccessModalAtom);
  const [, setDesignPreview] = useAtom(designPreviewAtom);
  const [, setSelectedColorName] = useAtom(selectedColorNameAtom);
  const [productConfig, setProductConfig] = useAtom(productConfigAtom);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setLoadingState({ isLoading: true, message: t('upload.uploading') });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const reader = new FileReader();
    reader.onload = (e) => {
      const newLayer: Layer = {
        id: Date.now().toString(),
        name: file.name,
        thumbnail: e.target?.result as string,
        rotation: 0,
        scale: 1,
        x: 0.5,
        y: 0.4,
        side: activeSide,
      };
      setLayers([...layers, newLayer]);
      setLoadingState({ isLoading: false, message: '' });
      toast.success(t('upload.success', { defaultValue: 'Imagen cargada' }), {
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
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(layer => layer.id !== id));
    toast(t('upload.layerRemoved', { defaultValue: 'Capa eliminada' }), {
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

  const handleCustomColor = (color: string) => {
    setCustomColor(color);
    handleColorChange(color, 'Personalizado');
  };

  const handleFinishOrder = async () => {
    setLoadingState({ isLoading: true, message: t('upload.rendering') });

    let screenshotData: string | null = null;
    if (onTakeScreenshot) {
      screenshotData = await onTakeScreenshot();
    }

    if (modelName) {
      setProductConfig(prev => ({ ...prev, type: 'tshirt', baseColor: selectedColor, baseColorName: modelName }));
    }

    setDesignPreview(screenshotData);
    setLoadingState({ isLoading: false, message: '' });
    setShowSuccessModal(true);
  };

  const isCustomActive = !PRESET_COLORS.some(c => c.value === selectedColor);

  return (
    <div
      className="h-full bg-card flex flex-col border-l border-border"
      style={{
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.06)',
        padding: '24px 20px',
      }}
    >
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <h2 className="text-xl lg:text-2xl mb-2 font-bold text-foreground">
          {t('toolsPanel.title')}
        </h2>
        <div className="text-2xl lg:text-3xl font-extrabold text-foreground">
          $15.00
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 lg:space-y-6 pr-2">

        {/* Side Selector (Front / Back) */}
        <div>
          <h3 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
            Lado del dise&ntilde;o
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => onActiveSideChange('front')}
              className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-xl transition-all text-sm lg:text-base font-semibold ${
                activeSide === 'front'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
            >
              Frente
            </button>
            <button
              onClick={() => onActiveSideChange('back')}
              className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-xl transition-all text-sm lg:text-base font-semibold ${
                activeSide === 'back'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
            >
              Atr&aacute;s
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <h3 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
            {t('toolsPanel.baseColor')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value, t(`colors.${color.key}`))}
                className={`w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95 ${
                  color.value === '#FFFFFF' ? 'border-2 border-border' : ''
                }`}
                style={{
                  backgroundColor: color.value,
                  boxShadow: selectedColor === color.value
                    ? '0 0 0 3px var(--primary)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                }}
                title={t(`colors.${color.key}`)}
              />
            ))}

            {/* Custom color picker */}
            <div className="relative">
              <button
                onClick={() => colorInputRef.current?.click()}
                className="w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                style={{
                  background: isCustomActive
                    ? customColor
                    : 'conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                  boxShadow: isCustomActive
                    ? '0 0 0 3px var(--primary)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                }}
                title="Color personalizado"
              >
                {!isCustomActive && (
                  <Palette size={16} className="text-white drop-shadow-md" />
                )}
              </button>
              <input
                ref={colorInputRef}
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColor(e.target.value)}
                className="absolute inset-0 w-0 h-0 opacity-0"
                tabIndex={-1}
              />
            </div>
          </div>
        </div>

        {/* Size Selector */}
        <div>
          <h3 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
            Talla
          </h3>
          <div className="flex gap-2">
            {(['S', 'M', 'L', 'XL'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setProductConfig(prev => ({ ...prev, size }))}
                className={`flex-1 py-2 lg:py-2.5 rounded-xl text-sm font-bold transition-all ${
                  productConfig.size === size
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-foreground hover:bg-accent'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div>
          <h3 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
            {t('toolsPanel.designLogo')}
          </h3>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`relative rounded-2xl p-5 lg:p-6 text-center cursor-pointer transition-all border-2 border-dashed ${
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
              <Cloud size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="mb-1 text-sm font-semibold text-foreground">
                {t('upload.title', { defaultValue: 'Sube tu imagen' })}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Se aplicar&aacute; al lado: <strong>{activeSide === 'front' ? 'Frente' : 'Atr\u00e1s'}</strong>
              </p>
            </div>
          </div>

          {/* Layers List with Controls */}
          {layers.length > 0 && (
            <div className="mt-3 space-y-3">
              <h4 className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase">
                {t('toolsPanel.layers', { defaultValue: 'Capas' })} ({layers.length})
              </h4>

              {layers.map((layer) => (
                <div key={layer.id} className="p-3 bg-muted rounded-xl space-y-3">
                  {/* Header: thumbnail + name + side badge + delete */}
                  <div className="flex items-center gap-2">
                    <img
                      src={layer.thumbnail}
                      alt={layer.name}
                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate font-semibold text-foreground">
                        {layer.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {(layer.side || 'front') === 'front' ? 'Frente' : 'Atr\u00e1s'}
                    </span>
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                      title="Eliminar"
                    >
                      <X size={14} style={{ color: '#DC2626' }} />
                    </button>
                  </div>

                  {/* Side toggle */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateLayer(layer.id, { side: 'front' })}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                        (layer.side || 'front') === 'front'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      Frente
                    </button>
                    <button
                      onClick={() => updateLayer(layer.id, { side: 'back' })}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                        layer.side === 'back'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      Atr&aacute;s
                    </button>
                  </div>

                  {/* Scale slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Tama&ntilde;o
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {Math.round((layer.scale ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.5"
                      step="0.05"
                      value={layer.scale ?? 1}
                      onChange={(e) => updateLayer(layer.id, { scale: parseFloat(e.target.value) })}
                      className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
                    />
                  </div>

                  {/* Position sliders */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Pos. X
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {Math.round((layer.x ?? 0.5) * 100)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.01"
                        value={layer.x ?? 0.5}
                        onChange={(e) => updateLayer(layer.id, { x: parseFloat(e.target.value) })}
                        className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Pos. Y
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {Math.round((layer.y ?? 0.4) * 100)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.95"
                        step="0.01"
                        value={layer.y ?? 0.4}
                        onChange={(e) => updateLayer(layer.id, { y: parseFloat(e.target.value) })}
                        className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-border sticky bottom-0 bg-card lg:static">
        <button
          className="w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 lg:hover:scale-105 shadow-lg touch-manipulation font-bold"
          style={{ backgroundColor: '#FFD600', color: '#000000' }}
          onClick={handleFinishOrder}
        >
          <span className="text-base lg:text-lg">{t('toolsPanel.finishOrder')}</span>
          <span className="text-xl lg:text-2xl">{'\uD83D\uDCF2'}</span>
        </button>
        <p className="text-xs text-center mt-2 lg:mt-3 text-muted-foreground font-medium">
          {t('toolsPanel.whatsAppNote')}
        </p>
      </div>
    </div>
  );
}
