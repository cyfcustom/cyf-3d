import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-lg transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary group"
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
    >
      <div className="relative w-5 h-5">
        {theme === 'light' ? (
          <Moon className="absolute inset-0 h-5 w-5 text-foreground transition-all group-hover:text-primary group-hover:rotate-12" />
        ) : (
          <Sun className="absolute inset-0 h-5 w-5 text-foreground transition-all group-hover:text-primary group-hover:rotate-12" />
        )}
      </div>
    </button>
  );
}