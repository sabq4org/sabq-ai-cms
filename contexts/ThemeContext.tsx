"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeConfig = {
  theme_name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  logo_url?: string | null;
  block_styles?: Record<string, any> | null;
  is_active?: boolean;
  start_date?: string | null; // ISO
  end_date?: string | null;   // ISO
};

type ThemeContextValue = {
  theme: ThemeConfig | null;
  loading: boolean;
  applyTheme: (cfg: ThemeConfig | null, opts?: { broadcast?: boolean }) => void;
  previewTheme: (cfg: ThemeConfig) => void;
  clearTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  try {
    const c = hex.replace('#', '');
    const bigint = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const rPerc = r / 255, gPerc = g / 255, bPerc = b / 255;
    const max = Math.max(rPerc, gPerc, bPerc), min = Math.min(rPerc, gPerc, bPerc);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rPerc: h = (gPerc - bPerc) / d + (gPerc < bPerc ? 6 : 0); break;
        case gPerc: h = (bPerc - rPerc) / d + 2; break;
        case bPerc: h = (rPerc - gPerc) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  } catch { return null; }
}

function applyThemeVars(cfg: ThemeConfig | null) {
  const root = document.documentElement;
  if (!cfg) {
    // إزالة المتغيرات عند إلغاء التفعيل
    root.style.removeProperty('--theme-primary');
    root.style.removeProperty('--theme-secondary');
    root.style.removeProperty('--theme-background');
    root.style.removeProperty('--theme-text');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--block-bg');
    root.style.removeProperty('--block-text');
    root.style.removeProperty('--block-border');
    root.removeAttribute('data-theme-name');
    window.dispatchEvent(new CustomEvent('theme-color-change'));
    return;
  }
  root.setAttribute('data-theme-name', cfg.theme_name);
  root.style.setProperty('--theme-primary', cfg.primary);
  root.style.setProperty('--theme-secondary', cfg.secondary);
  root.style.setProperty('--theme-background', cfg.background);
  root.style.setProperty('--theme-text', cfg.text);
  // accent كـ HSL إذا أمكن
  const hsl = hexToHsl(cfg.primary);
  if (hsl) {
    root.style.setProperty('--accent', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
  } else {
    root.style.setProperty('--accent', cfg.primary);
  }
  // متغيرات البلوكات الافتراضية
  root.style.setProperty('--block-bg', cfg.background);
  root.style.setProperty('--block-text', cfg.text);
  root.style.setProperty('--block-border', cfg.secondary);
  window.dispatchEvent(new CustomEvent('theme-color-change'));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = useCallback((cfg: ThemeConfig | null, opts?: { broadcast?: boolean }) => {
    setTheme(cfg);
    applyThemeVars(cfg);
    if (opts?.broadcast !== false) {
      // أبلغ المستمعين
      window.dispatchEvent(new CustomEvent('theme-applied', { detail: { name: cfg?.theme_name || 'default' } } as any));
    }
  }, []);

  const previewTheme = useCallback((cfg: ThemeConfig) => {
    applyThemeVars(cfg);
  }, []);

  const clearTheme = useCallback(() => applyTheme(null), [applyTheme]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/settings/theme', { cache: 'no-store' });
        const data = await res.json();
        if (!active) return;
        const activeTheme: ThemeConfig | null = data?.active || null;
        applyTheme(activeTheme, { broadcast: false });
      } catch {
        // تجاهل
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [applyTheme]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, loading, applyTheme, previewTheme, clearTheme }), [theme, loading, applyTheme, previewTheme, clearTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}


