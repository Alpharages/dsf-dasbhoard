/**
 * Theme Context - Comprehensive Theme Management
 * Supports: Light, Dark, System (auto-detect), and Black (AMOLED) themes
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'black' | 'system';
export type ResolvedTheme = 'light' | 'dark' | 'black';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key for persisting theme preference
const STORAGE_KEY = 'dsf-theme-preference';

// CSS variable definitions for each theme
const themeStyles: Record<ResolvedTheme, Record<string, string>> = {
  light: {
    '--color-bg': '#ffffff',
    '--color-bg-secondary': '#f8fafc',
    '--color-bg-tertiary': '#f1f5f9',
    '--color-surface': '#ffffff',
    '--color-surface-elevated': '#f8fafc',
    '--color-surface-overlay': '#f1f5f9',
    '--color-border': '#e2e8f0',
    '--color-border-subtle': '#f1f5f9',
    '--color-text-primary': '#0f172a',
    '--color-text-secondary': '#475569',
    '--color-text-tertiary': '#64748b',
    '--color-text-muted': '#94a3b8',
    '--color-text-inverse': '#f8fafc',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '--shadow-glow-primary': '0 0 20px rgba(37, 99, 235, 0.2)',
    '--chart-grid': 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    '--color-bg': '#0f172a',
    '--color-bg-secondary': '#1e293b',
    '--color-bg-tertiary': '#334155',
    '--color-surface': '#1e293b',
    '--color-surface-elevated': '#0f172a',
    '--color-surface-overlay': '#334155',
    '--color-border': '#334155',
    '--color-border-subtle': '#1e293b',
    '--color-text-primary': '#f8fafc',
    '--color-text-secondary': '#94a3b8',
    '--color-text-tertiary': '#64748b',
    '--color-text-muted': '#475569',
    '--color-text-inverse': '#0f172a',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
    '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
    '--shadow-glow-primary': '0 0 20px rgba(37, 99, 235, 0.3)',
    '--chart-grid': 'rgba(255, 255, 255, 0.03)',
  },
  black: {
    '--color-bg': '#000000',
    '--color-bg-secondary': '#0a0a0a',
    '--color-bg-tertiary': '#141414',
    '--color-surface': '#0a0a0a',
    '--color-surface-elevated': '#000000',
    '--color-surface-overlay': '#1a1a1a',
    '--color-border': '#262626',
    '--color-border-subtle': '#141414',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#a3a3a3',
    '--color-text-tertiary': '#737373',
    '--color-text-muted': '#525252',
    '--color-text-inverse': '#000000',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.6)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.7)',
    '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
    '--shadow-glow-primary': '0 0 30px rgba(37, 99, 235, 0.4)',
    '--chart-grid': 'rgba(255, 255, 255, 0.02)',
  },
};

// Additional theme-specific classes
const themeClasses: Record<ResolvedTheme, string[]> = {
  light: ['theme-light'],
  dark: ['theme-dark'],
  black: ['theme-black'],
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'black', 'system'].includes(stored)) {
      setThemeState(stored);
    }
    setMounted(true);
  }, []);

  // Resolve system theme
  const resolveSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark'; // Default to dark for system preference
  };

  // Apply theme
  useEffect(() => {
    if (!mounted) return;

    const resolved = theme === 'system' ? resolveSystemTheme() : theme;
    setResolvedTheme(resolved);

    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes
    themeClasses.light.forEach(c => body.classList.remove(c));
    themeClasses.dark.forEach(c => body.classList.remove(c));
    themeClasses.black.forEach(c => body.classList.remove(c));

    // Add current theme classes
    themeClasses[resolved].forEach(c => body.classList.add(c));

    // Set data attribute for CSS selectors
    body.setAttribute('data-theme', resolved);

    // Apply CSS variables
    const variables = themeStyles[resolved];
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Store preference
    localStorage.setItem(STORAGE_KEY, theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColor = resolved === 'light' ? '#ffffff' : resolved === 'dark' ? '#0f172a' : '#000000';
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      const resolved = resolveSystemTheme();
      setResolvedTheme(resolved);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'black'];
    const currentIndex = themes.indexOf(resolvedTheme as Theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeState(themes[nextIndex]);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isSystem: theme === 'system',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for theme-aware styles
export function useThemeValue<T>(light: T, dark: T, black: T): T {
  const { resolvedTheme } = useTheme();
  const values = { light, dark, black };
  return values[resolvedTheme];
}

// Utility to check if current theme is dark (for chart colors, etc.)
export function useIsDark(): boolean {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' || resolvedTheme === 'black';
}
