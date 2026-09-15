import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, Save, Trash2, Shirt, X, LogIn, Loader2 } from 'lucide-react';
import { layersAtom, activeFolderAtom, type DesignFolder } from '../../store/atoms';
import { useDesignLibrary } from '../../hooks/useDesignLibrary';
import { cn } from '../ui/utils';
import type { Section } from '../../types/sections';

interface DesignLibraryProps {
  modelSlug: string;
  modelName: string;
  sections: Section[];
  /** Captures a 3D screenshot used as the saved design's preview thumbnail. */
  takeScreenshot: () => Promise<string | null>;
}

interface FolderChipDef {
  folder: DesignFolder;
  /** Translated label key (under designLibrary namespace). */
  labelKey: string;
}

/**
 * Save + quick-load designs backed by Supabase.
 *
 * The dropdown is driven by `activeFolderAtom` (read here) — changing
 * the folder anywhere (this selector, a future folder manager, etc.)
 * automatically refetches and re-renders the list because the hook
 * subscribes to the folder reference. No changes to this component are
 * needed to add new folder types — just extend the DesignFolder union
 * and the folderToListArgs resolver.
 */
export function DesignLibrary({ modelSlug, modelName, sections, takeScreenshot }: DesignLibraryProps) {
  const { t } = useTranslation('configurator');
  const layers = useAtomValue(layersAtom);
  const folder = useAtomValue(activeFolderAtom);
  const setFolder = useSetAtom(activeFolderAtom);
  const {
    designs,
    isLoading,
    isAuthenticated,
    saveDesign,
    applyDesign,
    removeDesign,
  } = useDesignLibrary({ folder });

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('designLibrary.nameRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    const previewDataUrl = await (takeScreenshot() ?? Promise.resolve(null));
    const saved = await saveDesign({
      name: trimmed,
      modelSlug,
      sections,
      layers,
      previewDataUrl,
    });
    setSaving(false);
    if (saved) {
      setName('');
      setOpen(true);
    }
  };

  const handleLoad = (id: string) => {
    const design = designs.find(d => d.id === id);
    if (!design) return;
    applyDesign(design);
    setOpen(false);
  };

  const handleDelete = (designId: string) => {
    const design = designs.find(d => d.id === designId);
    if (!design) return;
    if (!window.confirm(t('designLibrary.deleteConfirm'))) return;
    removeDesign(design);
  };

  // Predefined folder chips shown at the top of the dropdown. Add more
  // here (or in a future folder manager) without touching the list
  // rendering below — the folder object drives everything.
  const folderChips: FolderChipDef[] = [
    { folder: { type: 'model', modelSlug }, labelKey: 'designLibrary.folderThisProduct' },
    { folder: { type: 'all' },                 labelKey: 'designLibrary.folderAll' },
  ];

  const isFolderActive = (chip: DesignFolder) => {
    if (chip.type === folder.type) {
      if (chip.type === 'model' && folder.type === 'model') {
        return chip.modelSlug === folder.modelSlug;
      }
      return true;
    }
    return false;
  };

  // ── Unauthenticated: prompt to sign in. Loading from Supabase still
  //    works for reading (RLS returns nothing), but there's nothing to show.
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <LogIn size={14} />
        <span>{t('designLibrary.loginRequiredHint')}</span>
      </div>
    );
  }

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
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{t('designLibrary.save')}</span>
        </button>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-card border border-border hover:bg-muted transition-colors"
          title={t('designLibrary.myDesigns')}
        >
          {open ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          <span>{t('designLibrary.myDesigns')}</span>
          <span className="text-xs text-muted-foreground">{designs.length}</span>
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

            {/* ── Folder chips ───────────────────────────────────────── */}
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                {t('designLibrary.folderLabel')}
              </span>
              {folderChips.map(chip => {
                const active = isFolderActive(chip.folder);
                return (
                  <button
                    key={chip.labelKey}
                    type="button"
                    onClick={() => setFolder(chip.folder)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-background hover:text-foreground'
                    )}
                    aria-pressed={active}
                  >
                    {t(chip.labelKey)}
                  </button>
                );
              })}
            </div>

            {isLoading ? (
              <div className="px-4 py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                <span>{t('designLibrary.loading')}</span>
              </div>
            ) : designs.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t('designLibrary.empty')}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {designs.map(d => (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {d.previewUrl ? (
                        <img
                          src={d.previewUrl}
                          alt={d.name ?? ''}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <Shirt size={20} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {d.name || t('designLibrary.untitled')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.createdAt ? formatRelative(Date.parse(d.createdAt), t) : ''}
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

function formatRelative(ms: number, t: (k: string, opts?: object) => string): string {
  if (!Number.isFinite(ms)) return '';
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return t('designLibrary.justNow');
  if (min < 60) return t('designLibrary.minutesAgo', { n: min });
  const hours = Math.floor(min / 60);
  if (hours < 24) return t('designLibrary.hoursAgo', { n: hours });
  const days = Math.floor(hours / 24);
  return t('designLibrary.daysAgo', { n: days });
}