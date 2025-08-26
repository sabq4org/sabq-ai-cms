'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';

interface ReadingModeButtonProps {
  className?: string;
}

export default function ReadingModeButton({ className = '' }: ReadingModeButtonProps) {
  const [isReadingMode, setIsReadingMode] = useState(false);

  const toggleReadingMode = () => {
    const newMode = !isReadingMode;
    setIsReadingMode(newMode);

    // Store preference in localStorage
    localStorage.setItem('reading-mode', newMode.toString());
  };

  // Restore reading mode preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('reading-mode') === 'true';
    if (savedMode) {
      setIsReadingMode(true);
    }
  }, []);

  return (
    <button
      onClick={toggleReadingMode}
      className={`
        reading-mode-button flex items-center gap-2 px-3 py-2 rounded-lg
        text-sm font-medium transition-all duration-200
        ${isReadingMode 
          ? 'bg-blue-100 text-blue-700 border-blue-200' 
          : 'bg-gray-100 text-gray-600 border-gray-200'
        }
        hover:shadow-sm active:scale-95
        border ${className}
      `}
      aria-label={isReadingMode ? 'إيقاف وضع القراءة' : 'تفعيل وضع القراءة'}
      title={isReadingMode ? 'إيقاف وضع القراءة' : 'تفعيل وضع القراءة'}
    >
      {isReadingMode ? (
        <>
          <X className="w-4 h-4" />
          <span>إيقاف وضع القراءة</span>
        </>
      ) : (
        <>
          <BookOpen className="w-4 h-4" />
          <span>وضع القراءة</span>
        </>
      )}
    </button>
  );
}
