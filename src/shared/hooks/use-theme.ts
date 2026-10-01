'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const themeStorageKey = 'extra-theme';
const themeChangeEvent = 'extra:theme-change';
let sessionOverride: Theme | null = null;

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

function savedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(themeStorageKey);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

function getThemeSnapshot(): Theme {
  if (sessionOverride) return sessionOverride;
  return savedTheme() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function subscribe(notify: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onStorage = () => {
    sessionOverride = null;
    notify();
  };
  const onSystemChange = () => {
    if (!sessionOverride && !savedTheme()) notify();
  };

  window.addEventListener(themeChangeEvent, notify);
  window.addEventListener('storage', onStorage);
  media.addEventListener('change', onSystemChange);
  return () => {
    window.removeEventListener(themeChangeEvent, notify);
    window.removeEventListener('storage', onStorage);
    media.removeEventListener('change', onSystemChange);
  };
}

function getServerSnapshot(): Theme {
  return 'light';
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    sessionOverride = nextTheme;
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      // Theme selection still applies for the current session.
    }
    window.dispatchEvent(new Event(themeChangeEvent));
  }, [theme]);

  return { theme, toggleTheme };
}
