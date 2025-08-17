"use client";

import { DarkModeToggle } from "@/components/admin/modern-dashboard/DarkModeToggle";
import { useEffect, useState } from "react";

export default function DebugTheme() {
  const [theme, setTheme] = useState<string>('');
  const [cssVars, setCssVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(currentTheme);
      
      // Get CSS variables
      const computedStyle = getComputedStyle(document.documentElement);
      const vars: Record<string, string> = {};
      ['--bg', '--fg', '--accent', '--line', '--muted', '--bg-card', '--bg-elevated'].forEach(varName => {
        vars[varName] = computedStyle.getPropertyValue(varName);
      });
      setCssVars(vars);
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen p-8" style={{ background: 'hsl(var(--bg))' }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'hsl(var(--fg))' }}>
        تصحيح أخطاء الثيم
      </h1>
      
      <div className="mb-6">
        <DarkModeToggle />
      </div>

      <div className="card p-6 mb-6" style={{ background: 'hsl(var(--bg-card))' }}>
        <h2 className="text-xl font-semibold mb-4">معلومات الثيم الحالي</h2>
        <p><strong>الثيم:</strong> {theme}</p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">متغيرات CSS:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(cssVars).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-mono text-sm">{key}:</span>
              <span className="text-sm">{value}</span>
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: `hsl(${value})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
