'use client';

import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface DarkModeToggleProps {
  className?: string;
  showTooltip?: boolean;
}

export function DarkModeToggle({ className = '', showTooltip = true }: DarkModeToggleProps) {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-all duration-300 relative group ${
        darkMode 
          ? 'hover:bg-gray-700 text-gray-300 hover:text-yellow-400 hover:scale-110' 
          : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600 hover:scale-110'
      } ${className}`}
      title={darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
      aria-label={darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
    >
      {darkMode ? (
        <Sun className="w-5 h-5 animate-pulse" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      
      {/* Tooltip محسّن */}
      {showTooltip && (
        <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap ${
          darkMode 
            ? 'bg-gray-700 text-gray-200' 
            : 'bg-gray-800 text-white'
        }`}>
          {darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
        </div>
      )}
    </button>
  );
} 