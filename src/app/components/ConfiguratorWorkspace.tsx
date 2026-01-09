import { useState } from 'react';
import { useAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { ConfiguratorHeader } from './configurator/ConfiguratorHeader';
import { Canvas3D } from './configurator/Canvas3D';
import { ToolsPanel } from './configurator/ToolsPanel';
import { SuccessModal } from './SuccessModal';
import { LoadingOverlay } from './LoadingOverlay';
import { selectedColorAtom, loadingStateAtom } from '../store/atoms';

const TSHIRT_IMAGE = 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjBtb2NrdXB8ZW58MXx8fHwxNzY2OTMxMzM2fDA&ixlib=rb-4.1.0&q=80&w=1080';

export function ConfiguratorWorkspace() {
  const [selectedColor, setSelectedColor] = useAtom(selectedColorAtom);
  const [loadingState] = useAtom(loadingStateAtom);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <ConfiguratorHeader />

      {/* Main Workspace - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas 3D - Top 50% on mobile, Left 70% on desktop */}
        <div className="h-1/2 lg:h-auto lg:flex-[7] min-w-0">
          <Canvas3D productImage={TSHIRT_IMAGE} selectedColor={selectedColor} />
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