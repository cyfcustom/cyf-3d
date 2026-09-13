import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, Save, Trash2, Shirt, X } from 'lucide-react';
import { layersAtom } from '../../store/atoms';
import { useDesignLibrary } from '../../hooks/useDesignLibrary';
import type { Section } from '../../types/sections';

interface DesignLibraryProps {
  modelSlug: string;
  modelName: string;
  sections: Section[];
  takeScreenshot: () => Promise<string | null>;
}

/**
 * Save + quick-load designs for the current model.
 *
 * Save: takes a name, snapshots colors + images + positions (normalized
 * by lib/designLibrary), stores a screenshot preview for the list.
 * Load: applies a saved design back into the live configurator state.
 *
 * Anything saved here is available — via the same localStorage atom — to a
 * future standalone "cargar diseño" component (both share useDesignLibrary).
 */
export function DesignLibrary({ modelSlug, modelName, sections, takeScreenshot }: DesignLibraryProps) {
  const { t } = useTranslation('configurator');
  const layers = useAtomValue(layersAtom);
  const { designs, saveDesign, applyDesign, removeDesign } = useDesignLibrary();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const modelDesigns = designs
    .filter(d => d.modelSlug === modelSlug)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('designLibrary.nameRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    const preview = await (takeScreenshot() ?? Promise.resolve(null));
    const saved = await saveDesign({
      name: trimmed,
      modelSlug,
      modelName,
      sections,
      layers,
      preview,
    });
    setSaving(false);
    if (saved) {
      setName('');
      setOpen(true);
    }
  };

  const handleLoad = (id: string) => {
    const design = modelDesigns.find(d => d.id === id);
    if (!design) return;
    applyDesign(design);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('designLibrary.deleteConfirm'))) return;
    removeDesign(id);
  };

  return (
    <div className="relative">
      {/* ── Top-level actions ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSave();
          }}
          placeholder={t('designLibrary.savePlaceholder')}
          className="w-48 px-3 py-1.5 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          title={t('designLibrary.save')}
        >
          <Save size={15} />
          <span>{t('designLibrary.save')}</span>
        </button>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-card border border-border hover:bg-muted transition-colors"
          title={t('designLibrary.myDesigns')}
        >
          {open ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          <span>{t('designLibrary.myDesigns')}</span>
          <span className="text-xs text-muted-foreground">{modelDesigns.length}</span>
        </button>
      </div>

      {error && (
        <p className="absolute left-0 -bottom-6 text-xs text-destructive font-medium">{error}</p>
      )}

      {/* ── Designs dropdown ──────────────────────────────────────── */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 max-h-96 overflow-y-auto rounded-xl bg-card border border-border shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card">
              <h3 className="text-sm font-bold text-foreground">{t('designLibrary.myDesigns')}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            {modelDesigns.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t('designLibrary.empty')}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {modelDesigns.map(d => (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {d.preview ? (
                        <img src={d.preview} alt={d.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shirt size={20} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(d.updatedAt, t)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoad(d.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      {t('designLibrary.load')}
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={t('designLibrary.delete')}
                      title={t('designLibrary.delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatRelative(ts: number, t: (k: string, opts?: object) => string): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return t('designLibrary.justNow');
  if (min < 60) return t('designLibrary.minutesAgo', { n: min });
  const hours = Math.floor(min / 60);
  if (hours < 24) return t('designLibrary.hoursAgo', { n: hours });
  const days = Math.floor(hours / 24);
  return t('designLibrary.daysAgo', { n: days });
}