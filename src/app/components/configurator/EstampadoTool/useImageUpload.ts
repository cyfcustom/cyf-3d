import { useState, useEffect, useRef, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { layersAtom, Layer } from '../../../store/atoms';
import type { SectionId } from '../../../types/sections';

/**
 * File-upload + clipboard-paste hook for the design editor.
 *
 * Owns:
 *  - the hidden <input type="file"> ref
 *  - the document-level 'paste' listener
 *  - the conversion File → dataURL → Layer (with naturalWidth/Height captured)
 *
 * Callers wire it up with the activeSection + a setLayers setter. The hook
 * itself doesn't render anything — the caller renders the upload button.
 */
export function useImageUpload(opts: {
  activeSection: SectionId;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { activeSection, t } = opts;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setLayers = useSetAtom(layersAtom);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      setUploading(true);
      toast.info(t('upload.uploading', { defaultValue: 'Subiendo…' }), { duration: 1200 });
      await new Promise(resolve => setTimeout(resolve, 300));

      const reader = new FileReader();
      reader.onload = e => {
        const dataURL = e.target?.result as string;
        const probe = new Image();
        probe.onload = () => {
          const newLayer: Layer = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            thumbnail: dataURL,
            rotation: 0,
            scale: 0.5,                 // 50% of print area width — sane default
            x: 0.5,
            y: 0.4,
            side: activeSection,
            naturalWidth: probe.naturalWidth,
            naturalHeight: probe.naturalHeight,
          };
          setLayers(prev => [...prev, newLayer]);
          setUploading(false);
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
    },
    [activeSection, setLayers, t]
  );

  // Cmd/Ctrl+V — paste an image from the clipboard as a new layer.
  // Skips when focus is inside a text input/textarea so layer name
  // fields still paste text normally.
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            const dt = new DataTransfer();
            dt.items.add(blob);
            handleFileUpload(dt.files);
            toast.success('Imagen pegada del portapapeles', { duration: 1500 });
            return;
          }
        }
      }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [handleFileUpload]);

  return {
    fileInputRef,
    handleFileUpload,
    uploading,
  };
}
