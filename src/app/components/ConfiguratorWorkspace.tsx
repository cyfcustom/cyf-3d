import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useAtom } from 'jotai';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ConfiguratorHeader } from './configurator/ConfiguratorHeader';
import { BabylonCanvas, BabylonCanvasHandle } from './configurator/BabylonCanvas';
import { ToolsPanel } from './configurator/ToolsPanel';
import { ProductGallery } from './configurator/ProductGallery';
import { SuccessModal } from './SuccessModal';
import { LoadingOverlay } from './LoadingOverlay';
import { loadingStateAtom, modelSectionsMapAtom, activeSectionAtom, activeToolAtom } from '../store/atoms';
import { useProductCatalog, ProductModel } from '../hooks/useProductCatalog';
import type { Section, SectionId } from '../types/sections';

export function ConfiguratorWorkspace() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loadingState] = useAtom(loadingStateAtom);
  const [sectionsMap, setSectionsMap] = useAtom(modelSectionsMapAtom);
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom);
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);
  const canvasRef = useRef<BabylonCanvasHandle>(null);
  const { models } = useProductCatalog();

  // Resolve model from slug. `_` (or unknown slug) shows the gallery.
  const selectedModel: ProductModel | null = useMemo(() => {
    if (!slug || slug === '_') return null;
    return models.find(m => m.slug === slug) ?? null;
  }, [slug, models]);

  // Initialize / hydrate sections for this model from the persisted map,
  // falling back to the model's default sections on first load.
  const modelKey = selectedModel?.slug ?? '';
  const sections: Section[] = useMemo(() => {
    if (!selectedModel) return [];
    return sectionsMap[modelKey] ?? selectedModel.sections;
  }, [selectedModel, sectionsMap, modelKey]);

  const setSections = useCallback((updater: Section[] | ((prev: Section[]) => Section[])) => {
    if (!modelKey) return;
    setSectionsMap(prev => {
      const current = prev[modelKey] ?? selectedModel?.sections ?? [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [modelKey]: next };
    });
  }, [modelKey, selectedModel, setSectionsMap]);

  // Active section's color (derived) — fed into ToolsPanel for the picker UI.
  const activeColor = sections.find(s => s.id === activeSection)?.color ?? '#FFFFFF';

  const handleColorChange = (color: string) => {
    setSections(sections.map(s => s.id === activeSection ? { ...s, color } : s));
  };

  const handleSelectModel = (model: ProductModel) => {
    setActiveSection('front');
    navigate(`/configurator/${model.slug}`);
  };

  const handleBackToGallery = () => {
    navigate('/configurator/_');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ConfiguratorHeader />

      <AnimatePresence mode="wait">
        {!selectedModel ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex-1 overflow-hidden"
          >
            <ProductGallery onSelectModel={handleSelectModel} />
          </motion.div>
        ) : (
          <motion.div
            key="customizer"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Back to gallery */}
            <div className="px-4 py-2 border-b border-border bg-card/50">
              <button
                onClick={handleBackToGallery}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Cambiar producto</span>
                <span className="text-foreground">&middot; {selectedModel.name}</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              <div className="h-1/2 lg:h-auto lg:flex-[11] min-w-0">
                <BabylonCanvas
                  ref={canvasRef}
                  modelUrl={selectedModel.model_url}
                  sections={sections}
                  activeSection={activeSection}
                />
              </div>
              <div className="h-1/2 lg:h-auto lg:flex-[9] min-w-0 overflow-y-auto">
                <ToolsPanel
                  onColorChange={handleColorChange}
                  selectedColor={activeColor}
                  modelName={selectedModel.name}
                  activeSection={activeSection}
                  onActiveSectionChange={setActiveSection}
                  sections={sections}
                  setSections={setSections}
                  activeTool={activeTool}
                  onActiveToolChange={setActiveTool}
                  onTakeScreenshot={() => canvasRef.current?.takeScreenshot() ?? Promise.resolve(null)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal />
      <AnimatePresence>
        {loadingState.isLoading && (
          <LoadingOverlay message={loadingState.message} />
        )}
      </AnimatePresence>
    </div>
  );
}
