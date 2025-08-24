'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  placeholder?: string;
  submitText?: string;
  initialValue?: string;
}

export default function CommentForm({ 
  onSubmit, 
  onCancel, 
  placeholder = 'اكتب تعليقك هنا...',
  submitText = 'إرسال التعليق',
  initialValue = ''
}: CommentFormProps) {
  const { darkMode } = useDarkModeContext();
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentThemeColor, setCurrentThemeColor] = useState<string | null>(null);

  // تتبع نظام الألوان المتغيرة
  useEffect(() => {
    const updateThemeColor = () => {
      const root = document.documentElement;
      const themeColor = root.style.getPropertyValue('--theme-primary');
      const accentColor = root.style.getPropertyValue('--accent');
      
      if (themeColor) {
        setCurrentThemeColor(themeColor);
      } else if (accentColor) {
        const hslMatch = accentColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (hslMatch) {
          const [_, h, s, l] = hslMatch;
          setCurrentThemeColor(`hsl(${h}, ${s}%, ${l}%)`);
        }
      } else {
        setCurrentThemeColor(null);
      }
    };

    updateThemeColor();
    window.addEventListener('theme-color-change', updateThemeColor);
    return () => window.removeEventListener('theme-color-change', updateThemeColor);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('الرجاء كتابة تعليق');
      return;
    }

    if (content.length < 3) {
      alert('التعليق قصير جداً');
      return;
    }

    if (content.length > 1000) {
      alert('التعليق طويل جداً (الحد الأقصى 1000 حرف)');
      return;
    }

    // إزالة التحذير المسبق - سيتم التحليل في الخادم
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          className={`w-full p-4 rounded-lg border resize-none transition-all focus:outline-none ${
            darkMode 
              ? 'bg-gray-700 text-white placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500'
          }`}
          style={{
            borderColor: currentThemeColor 
              ? `${currentThemeColor}40` 
              : (darkMode ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)'),
            boxShadow: `0 0 0 0px ${currentThemeColor || 'transparent'}`
          }}
          onFocus={(e) => {
            if (currentThemeColor) {
              e.currentTarget.style.borderColor = currentThemeColor;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${currentThemeColor}20`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = currentThemeColor 
              ? `${currentThemeColor}40` 
              : (darkMode ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)');
            e.currentTarget.style.boxShadow = `0 0 0 0px transparent`;
          }}
          rows={4}
        />
        
        {/* عداد الأحرف */}
        <div className={`absolute bottom-2 left-2 text-xs ${
          content.length > 900 
            ? 'text-red-500' 
            : darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {content.length} / 1000
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            isSubmitting || !content.trim()
              ? 'cursor-not-allowed opacity-50'
              : 'hover:scale-[1.02] active:scale-95'
          }`}
          style={{
            backgroundColor: (isSubmitting || !content.trim())
              ? (darkMode ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)')
              : (currentThemeColor || '#3b82f6'),
            color: (isSubmitting || !content.trim())
              ? (darkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)')
              : 'white'
          }}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {submitText}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } active:scale-95`}
        >
          <X className="w-4 h-4" />
          إلغاء
        </button>
      </div>

      {/* تعليمات محدثة */}
      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>• يرجى الالتزام بآداب الحوار واحترام الآخرين</p>
        <p>• يتم تحليل التعليقات بالذكاء الاصطناعي لضمان جودة المحتوى</p>
        <p>• التعليقات المسيئة أو المخالفة سيتم رفضها تلقائياً</p>
      </div>
    </form>
  );
}