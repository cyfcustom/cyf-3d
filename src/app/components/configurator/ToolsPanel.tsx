import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  loadingStateAtom,
  showSuccessModalAtom,
  designPreviewAtom,
  productConfigAtom,
} from '../../store/atoms';
import type { Section, SectionId } from '../../types/sections';
import { SectionsPanel } from './SectionsPanel';
import { ToolSidebar, ConfiguratorTool } from './ToolSidebar';
import { EstampadoTool } from './EstampadoTool';
import { BackgroundTool } from './BackgroundTool';

interface ToolsPanelProps {
  onColorChange: (color: string) => void;
  selectedColor: string;
  modelName?: string;
  activeSection: SectionId;
  onActiveSectionChange: (section: SectionId) => void;
  sections: Section[];
  activeTool: ConfiguratorTool;
  onActiveToolChange: (tool: ConfiguratorTool) => void;
  onTakeScreenshot?: () => Promise<string | null>;
}

/**
 * Right-side configurator panel. Renders a header, the active tool body
 * (Colores → SectionsPanel; Estampado → EstampadoTool), a "Finalizar y
 * Pedir" footer CTA, and the vertical ToolSidebar.
 */
export function ToolsPanel({
  onColorChange, selectedColor, modelName,
  activeSection, onActiveSectionChange,
  sections,
  activeTool, onActiveToolChange,
  onTakeScreenshot,
}: ToolsPanelProps) {
  const { t } = useTranslation('configurator');
  const [, setLoadingState] = useAtom(loadingStateAtom);
  const [, setShowSuccessModal] = useAtom(showSuccessModalAtom);
  const [, setDesignPreview] = useAtom(designPreviewAtom);
  const [productConfig, setProductConfig] = useAtom(productConfigAtom);

  const handleFinishOrder = async () => {
    setLoadingState({ isLoading: true, message: t('upload.rendering') });

    let screenshotData: string | null = null;
    if (onTakeScreenshot) {
      screenshotData = await onTakeScreenshot();
    }

    if (modelName) {
      setProductConfig(prev => ({
        ...prev,
        type: 'tshirt',
        baseColor: selectedColor,
        baseColorName: modelName,
      }));
    }

    setDesignPreview(screenshotData);
    setLoadingState({ isLoading: false, message: '' });
    setShowSuccessModal(true);
  };

  return (
    <div
      className="h-full bg-card flex flex-row border-l border-border"
      style={{ boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.06)' }}
    >
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

        {/* Scrollable content — switches on tool */}
        <div className="flex-1 overflow-y-auto pr-2">
          {activeTool === 'colores' ? (
            <SectionsPanel
              onSectionColorChange={(id, color) => {
                if (id === activeSection) onColorChange(color);
              }}
            />
          ) : activeTool === 'fondo' ? (
            <BackgroundTool />
          ) : (
            <EstampadoTool
              activeSection={activeSection}
              onActiveSectionChange={onActiveSectionChange}
              sections={sections}
              selectedColor={selectedColor}
              onColorChange={onColorChange}
            />
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

      <ToolSidebar activeTool={activeTool} onToolChange={onActiveToolChange} />
    </div>
  );
}
