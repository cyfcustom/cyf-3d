import { ImagePlus, Palette, PaintBucket } from 'lucide-react';

export type ToolId = 'estampado' | 'colores' | 'fondo';

interface ToolDef {
  id: ToolId;
  label: string;
  icon: React.ReactNode;
}

const TOOLS: ToolDef[] = [
  { id: 'estampado', label: 'Estampado', icon: <ImagePlus size={20} /> },
  { id: 'colores',   label: 'Colores',    icon: <Palette   size={20} /> },
  { id: 'fondo',     label: 'Fondo',      icon: <PaintBucket size={20} /> },
];

interface ToolSidebarProps {
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
}

export function ToolSidebar({ activeTool, onToolChange }: ToolSidebarProps) {
  return (
    <div className="bg-card border-l border-border flex flex-col items-center py-3 gap-1 w-14 flex-shrink-0">
      {TOOLS.map((tool) => {
        const active = tool.id === activeTool;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            title={tool.label}
            aria-label={tool.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tool.icon}
          </button>
        );
      })}
    </div>
  );
}