'use client';

import React, { useState } from 'react';
import { useThemeManager, useCurrentTheme } from '@/contexts/ThemeManagerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Palette, Sun, Moon, Monitor, Settings, Check, 
  ChevronDown, Droplets, Brush
} from 'lucide-react';

interface QuickThemeSwitcherProps {
  className?: string;
}

export default function QuickThemeSwitcher({ className = '' }: QuickThemeSwitcherProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { settings, setSettings, predefinedSchemes } = useThemeManager();
  const { scheme, colors } = useCurrentTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleSchemeChange = (schemeId: string) => {
    setSettings(prev => ({ ...prev, currentScheme: schemeId }));
    setIsOpen(false);
  };

  const handleThemeToggle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <div className={`relative ${className}`}>
      {/* زر التبديل السريع */}
      <div className="flex items-center gap-1">
        {/* تبديل الوضع الليلي/النهاري */}
        <button
          onClick={handleThemeToggle}
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
            resolvedTheme === 'dark'
              ? 'text-yellow-400 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={`الوضع الحالي: ${
            theme === 'light' ? 'نهاري' : 
            theme === 'dark' ? 'ليلي' : 'تلقائي'
          }`}
        >
          {theme === 'light' && <Sun className="w-5 h-5" />}
          {theme === 'dark' && <Moon className="w-5 h-5" />}
          {theme === 'system' && <Monitor className="w-5 h-5" />}
        </button>

        {/* منتقي الثيم */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 flex items-center gap-1 ${
              resolvedTheme === 'dark'
                ? 'text-purple-400 hover:bg-gray-700'
                : 'text-purple-600 hover:bg-purple-50'
            }`}
            title="تغيير الثيم"
          >
            <Palette className="w-5 h-5" />
            <div 
              className="w-3 h-3 rounded-full border border-current"
              style={{ backgroundColor: colors.primary }}
            />
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* قائمة الثيمات */}
          {isOpen && (
            <>
              {/* طبقة الخلفية */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              
              {/* القائمة */}
              <div className={`
                absolute left-0 top-full mt-2 w-72 rounded-xl shadow-lg border z-20
                ${resolvedTheme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
                }
              `}>
                <div className="p-4">
                  <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                    resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    <Brush className="w-4 h-4" />
                    اختيار الثيم
                  </h3>
                  
                  <div className="space-y-2">
                    {predefinedSchemes.map((themeScheme) => (
                      <button
                        key={themeScheme.id}
                        onClick={() => handleSchemeChange(themeScheme.id)}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                          ${settings.currentScheme === themeScheme.id
                            ? resolvedTheme === 'dark'
                              ? 'bg-purple-900/50 border-purple-500'
                              : 'bg-purple-50 border-purple-200'
                            : resolvedTheme === 'dark'
                              ? 'hover:bg-gray-700 border-gray-600'
                              : 'hover:bg-gray-50 border-gray-200'
                          }
                          border
                        `}
                      >
                        {/* معاينة الألوان */}
                        <div className="flex gap-1">
                          {Object.values(resolvedTheme === 'dark' ? themeScheme.darkMode : themeScheme.colors)
                            .slice(0, 4)
                            .map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                            ))
                          }
                        </div>
                        
                        <div className="flex-1 text-right">
                          <span className={`text-sm font-medium ${
                            resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {themeScheme.displayName}
                          </span>
                        </div>
                        
                        {settings.currentScheme === themeScheme.id && (
                          <Check className="w-4 h-4 text-purple-500" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className={`mt-4 pt-3 border-t ${
                    resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <a
                      href="/dashboard/theme-manager"
                      className={`
                        flex items-center gap-2 text-sm font-medium transition-colors
                        ${resolvedTheme === 'dark' 
                          ? 'text-purple-400 hover:text-purple-300' 
                          : 'text-purple-600 hover:text-purple-700'
                        }
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      إعدادات متقدمة
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
