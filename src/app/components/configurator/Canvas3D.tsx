import { RotateCw, ZoomIn, Eye, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Canvas3DProps {
  productImage: string;
  selectedColor: string;
}

export function Canvas3D({ productImage, selectedColor }: Canvas3DProps) {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const { t } = useTranslation('configurator');

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-muted/30">

      {/* 3D Model Display */}
      <div className="relative flex items-center justify-center">
        <div
          className="relative w-[500px] h-[500px] flex items-center justify-center rounded-2xl transition-all duration-500"
          style={{
            filter: `hue-rotate(${selectedColor === '#000000' ? '0deg' : selectedColor === '#FFFFFF' ? '0deg' : '0deg'})`
          }}
        >
          <img
            src={productImage}
            alt={t('canvas.preview')}
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{
              transform: activeView === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.6s ease-in-out'
            }}
          />
        </div>

        {/* View Indicator */}
        <div className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-card/90 backdrop-blur-sm shadow-md border border-border">
          <span className="text-sm font-semibold text-foreground">
            {t('canvas.viewLabel', { view: activeView === 'front' ? t('canvas.viewFront') : t('canvas.viewBack') })}
          </span>
        </div>
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-card/95 backdrop-blur-md px-4 py-3 rounded-full shadow-xl border border-border">
        <button
          className="p-3 rounded-full hover:bg-muted transition-all group"
          aria-label={t('canvas.rotate')}
          title={t('canvas.rotate')}
        >
          <RotateCw size={20} className="text-foreground group-hover:rotate-90 transition-transform" />
        </button>

        <div className="w-px h-6 bg-border" />

        <button
          className="p-3 rounded-full hover:bg-muted transition-all"
          aria-label={t('canvas.zoom')}
          title={t('canvas.zoom')}
        >
          <ZoomIn size={20} className="text-foreground" />
        </button>

        <div className="w-px h-6 bg-border" />

        <button
          className={`px-4 py-2 rounded-full transition-all font-semibold ${
            activeView === 'front'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          }`}
          onClick={() => setActiveView('front')}
        >
          {t('canvas.viewFront')}
        </button>

        <button
          className={`px-4 py-2 rounded-full transition-all font-semibold ${
            activeView === 'back'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          }`}
          onClick={() => setActiveView('back')}
        >
          {t('canvas.viewBack')}
        </button>

        <div className="w-px h-6 bg-border" />

        <button
          className="p-3 rounded-full hover:bg-muted transition-all"
          aria-label={t('canvas.fullscreen')}
          title={t('canvas.fullscreen')}
        >
          <Maximize2 size={20} className="text-foreground" />
        </button>
      </div>
    </div>
  );
}
