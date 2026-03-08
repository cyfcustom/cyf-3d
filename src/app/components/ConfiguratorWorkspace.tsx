import { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ConfiguratorHeader } from './configurator/ConfiguratorHeader';
import { BabylonCanvas, BabylonCanvasHandle } from './configurator/BabylonCanvas';
import { ToolsPanel } from './configurator/ToolsPanel';
import { ProductGallery } from './configurator/ProductGallery';
import { SuccessModal } from './SuccessModal';
import { LoadingOverlay } from './LoadingOverlay';
import { selectedColorAtom, loadingStateAtom } from '../store/atoms';
import { ProductModel } from '../hooks/useProductCatalog';

export function ConfiguratorWorkspace() {
  const [selectedColor, setSelectedColor] = useAtom(selectedColorAtom);
  const [loadingState] = useAtom(loadingStateAtom);
  const [selectedModel, setSelectedModel] = useState<ProductModel | null>(null);
  const canvasRef = useRef<BabylonCanvasHandle>(null);

  const handleSelectModel = (model: ProductModel) => {
    setSelectedModel(model);
  };

  const handleBackToGallery = () => {
    setSelectedModel(null);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ConfiguratorHeader />

      <AnimatePresence mode="wait">
        {!selectedModel ? (
          /* Step 1: Product Gallery */
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
          /* Step 2: 3D Customizer */
          <motion.div
            key="customizer"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Back to gallery button */}
            <div className="px-4 py-2 border-b border-border bg-card/50">
              <button
                onClick={handleBackToGallery}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Cambiar producto</span>
                <span className="text-foreground">· {selectedModel.name}</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              <div className="h-1/2 lg:h-auto lg:flex-[7] min-w-0">
                <BabylonCanvas
                  ref={canvasRef}
                  selectedColor={selectedColor}
                  modelUrl={selectedModel.model_url}
                />
              </div>
              <div className="h-1/2 lg:h-auto lg:flex-[3] min-w-0 overflow-y-auto">
                <ToolsPanel
                  onColorChange={setSelectedColor}
                  selectedColor={selectedColor}
                  modelName={selectedModel.name}
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
