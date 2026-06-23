import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  DEFAULT_LOCALE,
  RTL_LOCALES,
  SUPPORTED_LOCALES,
  intlLocale,
  translate,
  localizedName,
} from './translations';

const I18nContext = createContext(null);

const STORAGE_KEY = 'uiLocale';

function readInitialLocale() {
  const saved = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY);
  if (saved && /^[a-z]{2,8}$/i.test(saved)) return saved.toLowerCase();
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readInitialLocale);

  // Any short locale code is acceptable — category translations are keyed by
  // whatever code the admin set on the language, not just our bundled UI list.
  // Static UI strings fall back to English when the code has no STRINGS entry.
  const setLocale = useCallback((next) => {
    const raw = String(next || '').toLowerCase().trim();
    const safe = /^[a-z]{2,8}$/.test(raw) ? raw : DEFAULT_LOCALE;
    setLocaleState(safe);
    try { localStorage.setItem(STORAGE_KEY, safe); } catch {}
  }, []);

  // Keep <html lang> and <html dir> in sync so RTL/font-rendering is correct
  // across the whole document tree (not just React-rendered nodes).
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  const value = useMemo(() => {
    const t = (key) => translate(locale, key);
    // Pass the full category / sub-tag object — translations live on the row
    // itself in the DB, so the helper just picks the right one for the active
    // locale and falls back to the original `name`.
    const localized = (entity) => localizedName(entity, locale);
    return {
      locale,
      setLocale,
      dir: RTL_LOCALES.has(locale) ? 'rtl' : 'ltr',
      intlLocale: intlLocale(locale),
      t,
      localized,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Render-safe fallback: never crashes if a component is used outside the
    // provider (e.g. in a test). Returns English with passthrough helpers.
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      dir: 'ltr',
      intlLocale: intlLocale(DEFAULT_LOCALE),
      t: (key) => translate(DEFAULT_LOCALE, key),
      localized: (entity) => (entity && entity.name) || '',
    };
  }
  return ctx;
}
