import { useState } from 'react';
import { useAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { ConfiguratorHeader } from './configurator/ConfiguratorHeader';
import { BabylonCanvas } from './configurator/BabylonCanvas';
import { ToolsPanel } from './configurator/ToolsPanel';
import { SuccessModal } from './SuccessModal';
import { LoadingOverlay } from './LoadingOverlay';
import { selectedColorAtom, productConfigAtom, loadingStateAtom } from '../store/atoms';

export function ConfiguratorWorkspace() {
  const [selectedColor, setSelectedColor] = useAtom(selectedColorAtom);
  const [productConfig] = useAtom(productConfigAtom);
  const [loadingState] = useAtom(loadingStateAtom);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <ConfiguratorHeader />

      {/* Main Workspace - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas 3D - Top 50% on mobile, Left 70% on desktop */}
        <div className="h-1/2 lg:h-auto lg:flex-[7] min-w-0">
          <BabylonCanvas selectedColor={selectedColor} productType={productConfig.type} />
        </div>

        {/* Tools Panel - Bottom 50% on mobile, Right 30% on desktop */}
        <div className="h-1/2 lg:h-auto lg:flex-[3] min-w-0 overflow-y-auto">
          <ToolsPanel onColorChange={setSelectedColor} selectedColor={selectedColor} />
        </div>
      </div>

      {/* Modals and Overlays */}
      <SuccessModal />
      
      <AnimatePresence>
        {loadingState.isLoading && (
          <LoadingOverlay message={loadingState.message} />
        )}
      </AnimatePresence>
    </div>
  );
}