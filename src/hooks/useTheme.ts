import { useState, useEffect, useCallback } from 'react';
import { ThemeService, AppTheme } from '../utils/themeService';

export function useTheme() {
  const [theme, setThemeState] = useState<AppTheme>(() => ThemeService.getTheme());

  useEffect(() => {
    // Sync with global theme service on mount
    ThemeService.setTheme(theme);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppTheme>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
      } else {
        setThemeState(ThemeService.getTheme());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'reberwet_theme_mode') {
        setThemeState(ThemeService.getTheme());
      }
    };

    window.addEventListener('reberwet_theme_change', handleThemeChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('reberwet_theme_change', handleThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const next = ThemeService.toggleTheme();
    setThemeState(next);
  }, []);

  const setTheme = useCallback((t: AppTheme) => {
    ThemeService.setTheme(t);
    setThemeState(t);
  }, []);

  return { theme, isDark: theme === 'dark', toggleTheme, setTheme };
}

