import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { layersAtom } from '../../../store/atoms';

/**
 * Compact layer list — one row per layer with thumbnail, name, and delete.
 * Lives below the Fabric canvas; the actual editing happens in the canvas
 * itself (drag, resize, rotate, plus the floating toolbar on selection).
 */
export function LayerList() {
  const { t } = useTranslation('configurator');
  const [layers, setLayers] = useAtom(layersAtom);

  if (layers.length === 0) return null;

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

  return (
    <div className="mt-3 space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">
          Capas ({layers.length})
        </h4>
      </div>
      {layers.map(layer => (
        <div
          key={layer.id}
          className="flex items-center gap-2 p-2 bg-muted rounded-xl"
        >
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
  );
}
