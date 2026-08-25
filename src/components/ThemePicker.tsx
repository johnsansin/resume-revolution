import React from 'react';
import { useColorTheme, themes, ColorTheme } from '@/contexts/ColorThemeContext';
import { Check } from 'lucide-react';

const ThemePicker: React.FC = () => {
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {themes.map((theme) => {
        const active = colorTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => setColorTheme(theme.id)}
            className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
              active
                ? 'border-foreground/80 bg-muted shadow-md scale-105'
                : 'border-border hover:border-foreground/30 hover:bg-muted/50 hover:scale-105'
            }`}
          >
            <div className="flex gap-1">
              {theme.colors.map((color, i) => (
                <span
                  key={i}
                  className="h-5 w-5 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
              {theme.label}
            </span>
            {active && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ThemePicker;
