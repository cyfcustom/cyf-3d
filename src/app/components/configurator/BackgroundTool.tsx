import { useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { ImagePlus, PaintBucket, RotateCcw, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sceneBackgroundAtom } from '../../store/atoms';

const PRESET_COLORS = [
  '#FFFFFF', '#F5F5F4', '#E5E7EB', '#9CA3AF',
  '#1F2937', '#0F172A', '#000000',
  '#FEF3C7', '#DC2626', '#16A34A', '#0EA5E9', '#7C3AED',
];

const PRESET_ROWS = [
  ['#FFFFFF', '#F5F5F4', '#E5E7EB', '#9CA3AF', '#6B7280', '#374151', '#1F2937', '#0F172A'],
  ['#FEF3C7', '#FDE68A', '#FBBF24', '#F59E0B', '#EA580C', '#DC2626', '#9F1239', '#7C2D12'],
  ['#ECFDF5', '#BBF7D0', '#86EFAC', '#22C55E', '#16A34A', '#15803D', '#0F766E', '#134E4A'],
  ['#EFF6FF', '#BFDBFE', '#93C5FD', '#3B82F6', '#2563EB', '#1D4ED8', '#4338CA', '#7C3AED'],
];

/**
 * Right-panel tool for changing the 3D scene's background.
 *  - Color: presets + custom hex picker.
 *  - Image: file upload → data URL (kept in-memory, not uploaded to
 *    Supabase — background is a viewing preference, not part of the
 *    saved design).
 *  - Reset: clears the atom, the canvas falls back to the default
 *    transparent clearColor and the container's muted background shows.
 */
export function BackgroundTool() {
  const { t } = useTranslation('configurator');
  const [bg, setBg] = useAtom(sceneBackgroundAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hex, setHex] = useState<string>(
    bg && bg.type === 'color' ? bg.value : '#1F2937'
  );

  const setColor = (color: string) => {
    setHex(color);
    setBg({ type: 'color', value: color });
  };

  const handleHexChange = (v: string) => {
    setHex(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) setBg({ type: 'color', value: v });
  };

  const handleImageUpload = (file: File | null | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) setBg({ type: 'image', value: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => setBg(null);

  return (
    <div className="space-y-4">
      {/* ── Color ─────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('backgroundTool.colorTitle')}
          </h3>
          <PaintBucket size={14} className="text-muted-foreground" />
        </div>

        {/* Preset rows */}
        <div className="space-y-1.5">
          {PRESET_ROWS.map((row, i) => (
            <div key={i} className="flex gap-1.5">
              {row.map(c => {
                const active = bg?.type === 'color' && bg.value.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`flex-1 h-7 rounded-md transition-transform hover:scale-110 ${
                      active ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                    aria-label={`Color ${c}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Hex + native picker */}
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg border-2 border-border flex-shrink-0"
            style={{ backgroundColor: hex }}
          />
          <input
            type="text"
            value={hex}
            onChange={e => handleHexChange(e.target.value.toUpperCase())}
            placeholder="#1F2937"
            className="flex-1 px-2 py-1.5 text-xs font-mono bg-muted border border-border rounded-md text-foreground"
          />
          <input
            type="color"
            value={hex}
            onChange={e => handleHexChange(e.target.value.toUpperCase())}
            className="w-10 h-10 cursor-pointer rounded-md border border-border"
            aria-label="Selector de color"
          />
        </div>

        {/* Quick presets (neuter-friendly neutrals + brand) */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map(c => {
            const active = bg?.type === 'color' && bg.value.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  active ? 'border-primary' : 'border-border'
                }`}
                style={{ backgroundColor: c }}
                title={c}
                aria-label={`Color ${c}`}
              />
            );
          })}
        </div>
      </div>

      {/* ── Image ─────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('backgroundTool.imageTitle')}
          </h3>
          <ImagePlus size={14} className="text-muted-foreground" />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            handleImageUpload(e.target.files?.[0]);
            // Reset value so re-selecting the same file fires onChange again
            e.target.value = '';
          }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 px-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Upload size={16} />
          {t('backgroundTool.uploadImage')}
        </button>

        {/* Image preview + remove */}
        {bg?.type === 'image' && (
          <div className="space-y-2">
            <div
              className="w-full h-28 rounded-lg border border-border bg-cover bg-center"
              style={{ backgroundImage: `url(${bg.value})` }}
            />
            <button
              onClick={handleReset}
              className="w-full py-1.5 px-3 bg-muted text-foreground rounded-lg text-xs font-semibold hover:bg-muted/70 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={12} />
              {t('backgroundTool.removeImage')}
            </button>
          </div>
        )}
      </div>

      {/* ── Reset (always visible when bg is set) ────────────── */}
      {bg && (
        <button
          onClick={handleReset}
          className="w-full py-2 px-3 bg-muted text-muted-foreground rounded-xl text-xs font-semibold hover:bg-muted/70 transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={12} />
          {t('backgroundTool.reset')}
        </button>
      )}
    </div>
  );
}