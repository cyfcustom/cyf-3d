import { useRef } from 'react';
import { Check, Eye, EyeOff, Folder as FolderIcon, Plus, Shirt, Trash2, X } from 'lucide-react';
import { cn } from '../ui/utils';
import type { SavedDesign, UserFolder } from '../../lib/designs';

/**
 * Sub-components for DesignLibrary's dropdown — extracted to keep the
 * main component under the 400-line cap.
 */

export function FolderChip({
  label, active, custom, onClick, onDelete, onTogglePublic,
}: {
  label: string;
  active: boolean;
  custom?: UserFolder;
  onClick: () => void;
  onDelete?: () => void;
  /** Owner-only: toggle whether the folder is publicly readable. */
  onTogglePublic?: () => void;
}) {
  return (
    <span
      className={cn(
        'group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-muted-foreground hover:bg-background hover:text-foreground'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="inline-flex items-center gap-1"
      >
        {custom && <FolderIcon size={11} />}
        <span className="max-w-[120px] truncate">{label}</span>
        {custom?.isPublic && (
          <Eye size={10} className="opacity-80" aria-label="Pública" />
        )}
      </button>
      {onTogglePublic && (
        <button
          type="button"
          onClick={onTogglePublic}
          title={custom?.isPublic ? 'Hacer privada' : 'Hacer pública'}
          aria-label={custom?.isPublic ? 'Hacer privada' : 'Hacer pública'}
          className={cn(
            'inline-flex items-center justify-center rounded-full p-0.5 transition-opacity',
            custom?.isPublic
              ? 'opacity-90 hover:opacity-100'
              : 'opacity-0 group-hover:opacity-100',
            active
              ? 'hover:bg-primary-foreground/20'
              : 'hover:bg-muted'
          )}
        >
          {custom?.isPublic ? <EyeOff size={11} /> : <Eye size={11} />}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          title="Eliminar carpeta"
          aria-label="Eliminar carpeta"
          className={cn(
            'inline-flex items-center justify-center rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100',
            active
              ? 'hover:bg-primary-foreground/20'
              : 'hover:bg-muted'
          )}
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}

export function DesignRow({
  design, folders, openPopoverFor, setOpenPopoverFor,
  onLoad, onDelete, onToggleFolder, t,
}: {
  design: SavedDesign;
  folders: UserFolder[];
  openPopoverFor: string | null;
  setOpenPopoverFor: (id: string | null) => void;
  onLoad: () => void;
  onDelete: () => void;
  onToggleFolder: (folderId: string) => void;
  t: (k: string, opts?: object) => string;
}) {
  const isOpen = openPopoverFor === design.id;
  const hasFolders = folders.length > 0;

  return (
    <div className="relative flex items-center gap-3 px-4 py-3">
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {design.previewUrl ? (
          <img
            src={design.previewUrl}
            alt={design.name ?? ''}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <Shirt size={20} className="text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {design.name || t('designLibrary.untitled')}
        </p>
        <p className="text-xs text-muted-foreground">
          {design.createdAt ? formatRelative(Date.parse(design.createdAt), t) : ''}
        </p>
      </div>
      {/* "+" add-to-folder button (only if there are custom folders). */}
      {hasFolders && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenPopoverFor(isOpen ? null : design.id);
          }}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          aria-label={t('designLibrary.addToFolder')}
          title={t('designLibrary.addToFolder')}
        >
          <Plus size={14} />
        </button>
      )}
      <button
        type="button"
        onClick={onLoad}
        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {t('designLibrary.load')}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
        aria-label={t('designLibrary.delete')}
        title={t('designLibrary.delete')}
      >
        <Trash2 size={14} />
      </button>

      {isOpen && (
        <>
          {/* close on outside click */}
          <div
            className="fixed inset-0 z-30"
            onClick={(e) => { e.stopPropagation(); setOpenPopoverFor(null); }}
          />
          <div
            className="absolute right-4 top-12 z-40 w-64 rounded-xl bg-card border border-border shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('designLibrary.addToFolder')}
            </p>
            <div className="mt-1 space-y-0.5 max-h-56 overflow-y-auto">
              {folders.map(f => {
                const inFolder = f.designIds.includes(design.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onToggleFolder(f.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-muted',
                      inFolder ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    <FolderIcon size={12} className="shrink-0" />
                    <span className="flex-1 truncate">{f.name}</span>
                    {inFolder && <Check size={12} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function formatRelative(ms: number, t: (k: string, opts?: object) => string): string {
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