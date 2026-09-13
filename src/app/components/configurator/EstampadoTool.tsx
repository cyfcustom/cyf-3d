import { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { Palette, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  selectedColorNameAtom,
  productConfigAtom,
} from '../../store/atoms';
import type { Section, SectionId } from '../../types/sections';
import { FabricEditor } from './FabricEditor';
import { useImageUpload } from './EstampadoTool/useImageUpload';
import { LayerPositionSliders } from './EstampadoTool/LayerPositionSliders';
import { LayerList } from './EstampadoTool/LayerList';

interface EstampadoToolProps {
  activeSection: SectionId;
  onActiveSectionChange: (section: SectionId) => void;
  sections: Section[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

/** Estampado tool: section tabs, color picker, upload, FabricEditor, layers. */
export function EstampadoTool({
  activeSection,
  onActiveSectionChange,
  sections,
  selectedColor,
  onColorChange,
}: EstampadoToolProps) {
  const { t } = useTranslation('configurator');
  const [, setSelectedColorName] = useAtom(selectedColorNameAtom);
  const [productConfig, setProductConfig] = useAtom(productConfigAtom);

  // Custom-color picker state lives here so the preset row can also open it.
  const [customColor, setCustomColor] = useState('#EC4899');
  const colorInputRef = useRef<HTMLInputElement>(null);

  // File upload + clipboard paste (one hook owns both flows).
  const { fileInputRef, handleFileUpload, uploading } = useImageUpload({
    activeSection,
    t,
  });

  // ── Section tabs ──────────────────────────────────────────────────
  const tabs = (
    <div>
      <h3 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
        Editar secci&oacute;n
      </h3>
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {sections.map(sec => (
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
  );

  // ── Color picker (quick-access for the active section's body color) ──
  const PRESET_COLORS = [
    { key: 'white',  value: '#FFFFFF' },
    { key: 'black',  value: '#000000' },
    { key: 'blue',   value: '#0F172A' },
    { key: 'red',    value: '#DC2626' },
    { key: 'gray',   value: '#6B7280' },
    { key: 'green',  value: '#16A34A' },
    { key: 'yellow', value: '#FFD600' },
  ];
  const isCustomActive = !PRESET_COLORS.some(c => c.value === selectedColor);

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

  const colorPicker = (
    <div>
      <h3 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
        {t('toolsPanel.baseColor')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(color => (
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
            onChange={e => handleCustomColor(e.target.value)}
            className="absolute inset-0 w-0 h-0 opacity-0"
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  );

  // ── Upload + canvas ───────────────────────────────────────────────
  const uploadAndCanvas = (
    <div>
      <h3 className="text-xs lg:text-sm mb-2 font-semibold text-muted-foreground uppercase">
        {t('toolsPanel.designLogo')}
      </h3>
      <div className="flex gap-2 items-center mb-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? 'Subiendo…' : 'Subir imagen'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={e => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      <FabricEditor
        activeSection={activeSection}
        onCanvasUpdate={() => {/* no-op; layer system is source of truth */}}
      />

      <div className="mt-3">
        <LayerPositionSliders activeSection={activeSection} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      {tabs}
      {colorPicker}
      {uploadAndCanvas}
      <LayerList />
    </div>
  );
}
