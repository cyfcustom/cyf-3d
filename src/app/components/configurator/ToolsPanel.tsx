import { Palette, Upload, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  layersAtom,
  selectedColorNameAtom,
  productConfigAtom,
  loadingStateAtom,
  showSuccessModalAtom,
  designPreviewAtom,
  Layer,
} from '../../store/atoms';
import type { Section, SectionId } from '../../types/sections';
import { SectionsPanel } from './SectionsPanel';
import { ToolSidebar, ConfiguratorTool } from './ToolSidebar';
import { FabricEditor } from './FabricEditor';

interface ToolsPanelProps {
  onColorChange: (color: string) => void;
  selectedColor: string;
  modelName?: string;
  activeSection: SectionId;
  onActiveSectionChange: (section: SectionId) => void;
  sections: Section[];
  setSections: (next: Section[] | ((prev: Section[]) => Section[])) => void;
  activeTool: ConfiguratorTool;
  onActiveToolChange: (tool: ConfiguratorTool) => void;
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

export function ToolsPanel({
  onColorChange, selectedColor, modelName,
  activeSection, onActiveSectionChange,
  sections, setSections,
  activeTool, onActiveToolChange,
  onTakeScreenshot,
}: ToolsPanelProps) {
  const { t } = useTranslation('configurator');
  const [layers, setLayers] = useAtom(layersAtom);
  const [customColor, setCustomColor] = useState('#EC4899');
  const [, setLoadingState] = useAtom(loadingStateAtom);
  const [, setShowSuccessModal] = useAtom(showSuccessModalAtom);
  const [, setDesignPreview] = useAtom(designPreviewAtom);
  const [, setSelectedColorName] = useAtom(selectedColorNameAtom);
  const [productConfig, setProductConfig] = useAtom(productConfigAtom);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSectionDef = sections.find(s => s.id === activeSection);

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
      const dataURL = e.target?.result as string;
      // Capture native dimensions so FabricEditor + BabylonCanvas can
      // round-trip the user's scale edits in the same units.
      const probe = new Image();
      probe.onload = () => {
        const newLayer: Layer = {
          id: Date.now().toString(),
          name: file.name,
          thumbnail: dataURL,
          rotation: 0,
          scale: 0.5,                     // 50% of print area width — sane default
          x: 0.5,
          y: 0.4,
          side: activeSectionDef?.id ?? 'front',
          naturalWidth: probe.naturalWidth,
          naturalHeight: probe.naturalHeight,
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
      probe.src = dataURL;
    };
    reader.readAsDataURL(file);
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
    // Update the active section's color in the sections array.
    setSections(sections.map(s => s.id === activeSection ? { ...s, color } : s));
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
      className="h-full bg-card flex flex-row border-l border-border"
      style={{
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ padding: '24px 20px' }}>
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

        {activeTool === 'colores' ? (
          /* Colores tool — full section color picker */
          <SectionsPanel
            onSectionColorChange={(id, color) => {
              if (id === activeSection) onColorChange(color);
            }}
          />
        ) : (
          <>
        {/* Section Selector (Estampado) */}
        <div>
          <h3 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
            Editar secci&oacute;n
          </h3>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => onActiveSectionChange(sec.id)}
                disabled={!sec.mesh_name}
                title={sec.mesh_name ? undefined : 'Sección sin mesh asignado'}
                className={`shrink-0 py-2 lg:py-3 px-3 lg:px-4 rounded-xl transition-all text-xs lg:text-sm font-semibold ${
                  activeSection === sec.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {sec.display_name}
              </button>
            ))}
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

        {/* Upload + 2D Canvas editor */}
        <div>
          <h3 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
            {t('toolsPanel.designLogo')}
          </h3>

          {/* Upload + drag-drop */}
          <div className="flex gap-2 items-center mb-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              <Upload size={14} />
              Subir imagen
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* 2D canvas editor (drag, resize, rotate) */}
          <FabricEditor
            activeSection={activeSection}
            onCanvasUpdate={() => {/* no-op; layer system is source of truth */}}
          />

          {/* Compact layer list (no section picker, no sliders) */}
          {layers.length > 0 && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Capas ({layers.length})
                </h4>
              </div>
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center gap-2 p-2 bg-muted rounded-xl">
                  <img
                    src={layer.thumbnail}
                    alt={layer.name}
                    className="w-8 h-8 object-cover rounded-lg flex-shrink-0"
                  />
                  <p className="flex-1 text-xs truncate font-semibold text-foreground">
                    {layer.name}
                  </p>
                  <button
                    onClick={() => removeLayer(layer.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                    title="Eliminar"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}

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
      {/* ── Right-side vertical icon toolbar ── */}
      <ToolSidebar activeTool={activeTool} onToolChange={onActiveToolChange} />
    </div>
  );
}
