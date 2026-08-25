import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type ColorTheme = 'teal' | 'blue' | 'rose' | 'purple' | 'emerald' | 'orange';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (t: ColorTheme) => void;
}

const COLOR_THEME_KEY = 'cv_maker_color_theme_v2';

const ColorThemeContext = createContext<ColorThemeContextType>({
  colorTheme: 'teal',
  setColorTheme: () => {},
});

export const useColorTheme = () => useContext(ColorThemeContext);

export const themes: { id: ColorTheme; label: string; colors: string[] }[] = [
  { id: 'blue',    label: 'Executive Navy', colors: ['#1e3a5f', '#315b7d', '#8ca6b8'] },
  { id: 'teal',    label: 'Slate Teal',     colors: ['#164e63', '#0f766e', '#94a3b8'] },
  { id: 'emerald', label: 'Forest',         colors: ['#244c3d', '#3f725e', '#a3b8ae'] },
  { id: 'rose',    label: 'Burgundy',       colors: ['#5f2636', '#8a4054', '#b9a2a8'] },
];

function getStoredTheme(): ColorTheme {
  try {
    const stored = localStorage.getItem(COLOR_THEME_KEY);
    if (stored && themes.some((t) => t.id === stored)) return stored as ColorTheme;
  } catch {
    // Storage can be unavailable in privacy mode.
  }
  return 'blue';
}

export const ColorThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme);
    try {
      localStorage.setItem(COLOR_THEME_KEY, colorTheme);
    } catch {
      // Theme persistence is optional.
    }
  }, [colorTheme]);

  const setColorTheme = useCallback((t: ColorTheme) => setColorThemeState(t), []);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
};
