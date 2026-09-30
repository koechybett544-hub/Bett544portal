/**
 * Theme Service for Light / Dark mode management
 * Persists user preference in localStorage and toggles the .dark class on <html>
 */

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'reberwet_theme_mode';

export const ThemeService = {
  getTheme(): AppTheme {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  },

  setTheme(theme: AppTheme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
          document.body?.classList.add('dark');
        } else {
          root.classList.remove('dark');
          document.body?.classList.remove('dark');
        }

        // Update mobile theme-color header
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', theme === 'dark' ? '#0c0a09' : '#6b1426');
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reberwet_theme_change', { detail: theme }));
      }
    } catch (e) {
      console.warn('Theme switch error:', e);
    }
  },

  toggleTheme(): AppTheme {
    const current = this.getTheme();
    const next: AppTheme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  },

  initTheme(): AppTheme {
    const current = this.getTheme();
    this.setTheme(current);
    return current;
  }
};

