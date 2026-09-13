import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { Eye, EyeOff, Palette } from 'lucide-react';
import { modelSectionsMapAtom, activeSectionAtom } from '../../store/atoms';
import type { SectionId, Section } from '../../types/sections';
import { useParams } from 'react-router-dom';

interface SectionsPanelProps {
  onSectionColorChange?: (id: SectionId, color: string) => void;
}

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#0F172A', '#DC2626',
  '#6B7280', '#16A34A', '#FFD600', '#7C3AED',
  '#EC4899', '#0EA5E9',
];

const PRESET_ROWS = [
  ['#FFFFFF', '#000000', '#0F172A', '#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'],
  ['#DC2626', '#EA580C', '#F59E0B', '#FFD600', '#16A34A', '#0EA5E9', '#2563EB', '#7C3AED'],
  ['#EC4899', '#DB2777', '#9333EA', '#6366F1', '#0891B2', '#0D9488', '#65A30D', '#CA8A04'],
];

export function SectionsPanel({ onSectionColorChange }: SectionsPanelProps) {
  const { slug } = useParams<{ slug: string }>();
  const modelKey = slug && slug !== '_' ? slug : '';
  const [sectionsMap, setSectionsMap] = useAtom(modelSectionsMapAtom);
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom);
  const [pickerOpenFor, setPickerOpenFor] = useState<SectionId | null>(null);

  const sections: Section[] = sectionsMap[modelKey] ?? [];
  const pickerAnchorRef = useRef<HTMLDivElement | null>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpenFor) return;
    const handler = (e: MouseEvent) => {
      if (pickerAnchorRef.current && !pickerAnchorRef.current.contains(e.target as Node)) {
        setPickerOpenFor(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpenFor]);

  if (!modelKey || sections.length === 0) return null;

  const updateColor = (id: SectionId, color: string) => {
    setSectionsMap(prev => ({
      ...prev,
      [modelKey]: (prev[modelKey] ?? []).map(s => s.id === id ? { ...s, color } : s),
    }));
    onSectionColorChange?.(id, color);
  };

  const applyToAll = (color: string) => {
    setSectionsMap(prev => ({
      ...prev,
      [modelKey]: (prev[modelKey] ?? []).map(s => ({ ...s, color })),
    }));
  };

  const toggleVisibility = (id: SectionId) => {
    setSectionsMap(prev => ({
      ...prev,
      [modelKey]: (prev[modelKey] ?? []).map(s => s.id === id ? { ...s, visible: !s.visible } : s),
    }));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Colores por secci&oacute;n
      </h3>

      <div className="space-y-1" ref={pickerAnchorRef}>
        {sections.map((sec) => (
          <div
            key={sec.id}
            className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
              activeSection === sec.id ? 'bg-accent' : 'hover:bg-muted/50'
            }`}
          >
            {/* Color swatch — click opens picker */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveSection(sec.id);
                setPickerOpenFor(pickerOpenFor === sec.id ? null : sec.id);
              }}
              disabled={!sec.mesh_name}
              className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-border transition-transform hover:scale-110 active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: sec.color }}
              title={sec.color}
            />

            {/* Name */}
            <button
              onClick={() => setActiveSection(sec.id)}
              disabled={!sec.mesh_name}
              className="flex-1 text-left text-sm font-semibold text-foreground disabled:opacity-40"
            >
              {sec.display_name}
            </button>

            {/* Visibility */}
            <button
              onClick={() => toggleVisibility(sec.id)}
              disabled={!sec.mesh_name}
              className={`p-1.5 rounded-lg transition-colors ${
                sec.visible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              } disabled:opacity-40`}
              title={sec.visible ? 'Visible' : 'Oculta'}
            >
              {sec.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
        ))}

        {/* Color picker dropdown — anchored to active section's swatch */}
        {pickerOpenFor && (() => {
          const sec = sections.find(s => s.id === pickerOpenFor);
          if (!sec) return null;
          return (
            <ColorPickerPopover
              section={sec}
              onPick={(c) => updateColor(sec.id, c)}
              onApplyAll={(c) => applyToAll(c)}
              onClose={() => setPickerOpenFor(null)}
            />
          );
        })()}
      </div>
    </div>
  );
}

interface ColorPickerPopoverProps {
  section: Section;
  onPick: (color: string) => void;
  onApplyAll: (color: string) => void;
  onClose: () => void;
}

function ColorPickerPopover({ section, onPick, onApplyAll, onClose }: ColorPickerPopoverProps) {
  const [hex, setHex] = useState(section.color);
  useEffect(() => { setHex(section.color); }, [section.color]);

  const handleHexChange = (v: string) => {
    setHex(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onPick(v);
  };

  return (
    <div className="absolute z-30 right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl p-3 space-y-3">
      {/* Preview + hex input */}
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-lg border-2 border-border flex-shrink-0"
          style={{ backgroundColor: hex }}
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
          className="flex-1 px-2 py-1.5 text-xs font-mono bg-muted border border-border rounded-md text-foreground"
        />
        <input
          type="color"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
          className="w-10 h-10 cursor-pointer rounded-md border border-border"
        />
      </div>

      {/* Preset rows */}
      <div className="space-y-1.5">
        {PRESET_ROWS.map((row, i) => (
          <div key={i} className="flex gap-1.5">
            {row.map(c => (
              <button
                key={c}
                onClick={() => handleHexChange(c)}
                className={`flex-1 h-6 rounded-md transition-transform hover:scale-110 ${
                  c.toLowerCase() === section.color.toLowerCase() ? 'ring-2 ring-primary' : ''
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Apply to all */}
      <button
        onClick={() => { onApplyAll(hex); onClose(); }}
        className="w-full py-2 px-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
      >
        <Palette size={14} />
        Aplicar a todas las secciones
      </button>
    </div>
  );
}
