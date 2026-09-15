import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  Bookmark, BookmarkCheck, Save, Trash2, X, LogIn, Loader2,
  Check, FolderPlus, Folder as FolderIcon,
} from 'lucide-react';
import {
  layersAtom, activeFolderAtom, type DesignFolder,
} from '../../store/atoms';
import { useDesignLibrary } from '../../hooks/useDesignLibrary';
import { cn } from '../ui/utils';
import type { UserFolder } from '../../lib/designs';
import { FolderChip, DesignRow, formatRelative } from './DesignLibraryParts';
import type { Section } from '../../types/sections';

interface DesignLibraryProps {
  modelSlug: string;
  modelName: string;
  sections: Section[];
  /** Captures a 3D screenshot used as the saved design's preview thumbnail. */
  takeScreenshot: () => Promise<string | null>;
}

interface FolderChipDef {
  key: string;
  folder: DesignFolder;
  label: string;
  customFolder?: UserFolder;
}

/**
 * Save + quick-load designs backed by Supabase.
 *
 * Reads `activeFolderAtom` to decide which designs to list, and
 * exposes folder CRUD (create/delete + toggle design membership).
 * Switching folders anywhere automatically drives this panel — no
 * changes to this component are needed to add new folder types.
 *
 * The folder selector at the top of the dropdown lists:
 *   - the predefined "Este producto" / "Todos" chips
 *   - the user's custom folders (persisted in design_folders) with a
 *     tiny delete X on hover
 *   - an inline "+ Nueva carpeta" input that creates and selects the
 *     new folder on submit
 *
 * Each design row has a bookmark button that opens a small popover to
 * add/remove the design from any custom folder (works from any active
 * view, so adding to a folder works even while browsing "Todos").
 */
export function DesignLibrary({ modelSlug, modelName, sections, takeScreenshot }: DesignLibraryProps) {
  const { t } = useTranslation('configurator');
  const layers = useAtomValue(layersAtom);
  const folder = useAtomValue(activeFolderAtom);
  const setFolder = useSetAtom(activeFolderAtom);
  const {
    designs,
    folders,
    isLoading,
    isAuthenticated,
    saveDesign,
    applyDesign,
    removeDesign,
    createFolder,
    deleteFolder,
    toggleDesignInFolder,
  } = useDesignLibrary({ folder });

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Inline "+ Nueva carpeta" input state
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Popover state (per design ID) for "+" add-to-folder
  const [openPopoverFor, setOpenPopoverFor] = useState<string | null>(null);

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

  const handleCreateFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    const created = await createFolder(trimmed);
    if (created) {
      setNewFolderName('');
      setCreatingFolder(false);
      // Select the new folder so the user sees it immediately.
      setFolder({ type: 'custom', folderId: created.id });
    }
  };

  // Build the chip list. Predefined first, then user folders, then "+".
  const chips: FolderChipDef[] = [
    { key: 'predefined:model', folder: { type: 'model', modelSlug }, label: t('designLibrary.folderThisProduct') },
    { key: 'predefined:all',   folder: { type: 'all' },                 label: t('designLibrary.folderAll') },
    ...folders.map(f => ({
      key: `custom:${f.id}`,
      folder: { type: 'custom', folderId: f.id } as DesignFolder,
      label: f.name,
      customFolder: f,
    })),
  ];

  const isFolderActive = (chip: DesignFolder) => {
    if (chip.type !== folder.type) return false;
    if (chip.type === 'model' && folder.type === 'model') return chip.modelSlug === folder.modelSlug;
    if (chip.type === 'custom' && folder.type === 'custom') return chip.folderId === folder.folderId;
    return true;
  };

  // ── Unauthenticated: prompt to sign in.
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
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
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
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/30 px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                {t('designLibrary.folderLabel')}
              </span>
              {chips.map(chip => {
                const active = isFolderActive(chip.folder);
                return (
                  <FolderChip
                    key={chip.key}
                    label={chip.label}
                    active={active}
                    custom={chip.customFolder}
                    onClick={() => setFolder(chip.folder)}
                    onDelete={chip.customFolder
                      ? () => {
                          if (!window.confirm(t('designLibrary.deleteFolderConfirm', { name: chip.customFolder!.name }))) return;
                          deleteFolder(chip.customFolder.id);
                          if (folder.type === 'custom' && folder.folderId === chip.customFolder.id) {
                            setFolder({ type: 'all' });
                          }
                        }
                      : undefined}
                  />
                );
              })}
              {/* "+ Nueva carpeta" inline */}
              {creatingFolder ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); }
                    }}
                    onBlur={() => { if (!newFolderName.trim()) setCreatingFolder(false); }}
                    placeholder={t('designLibrary.newFolderPlaceholder')}
                    className="w-32 px-2 py-1 text-xs rounded-full bg-card border border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()} // keep input focused
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground disabled:opacity-50"
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreatingFolder(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/40 px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  title={t('designLibrary.newFolder')}
                >
                  <FolderPlus size={12} />
                  {t('designLibrary.newFolder')}
                </button>
              )}
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
                  <DesignRow
                    key={d.id}
                    design={d}
                    folders={folders}
                    openPopoverFor={openPopoverFor}
                    setOpenPopoverFor={setOpenPopoverFor}
                    onLoad={() => handleLoad(d.id)}
                    onDelete={() => handleDelete(d.id)}
                    onToggleFolder={(folderId) => toggleDesignInFolder(folderId, d.id)}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-components live in DesignLibraryParts.tsx ───────────────────────