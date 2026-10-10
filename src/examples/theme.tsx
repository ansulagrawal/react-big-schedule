import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

export const THEMES = ['light', 'dark', 'classic'] as const;
export type Theme = (typeof THEMES)[number];

const KEY = 'rbs-example-theme';

const isTheme = (value: unknown): value is Theme => THEMES.some(t => t === value);

const readTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // storage can be blocked
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({
  theme: 'light',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    // tokens for the page chrome, the schedulers and their popovers all key off this attribute
    document.documentElement.setAttribute('data-rbs-theme', theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // storage can be blocked
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
