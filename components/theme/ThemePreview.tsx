'use client';

import React from 'react';
import { useCurrentTheme } from '@/contexts/ThemeManagerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Share2, Bookmark, MessageCircle, Eye,
  Star, TrendingUp, Clock, User
} from 'lucide-react';

interface ThemePreviewProps {
  className?: string;
}

export default function ThemePreview({ className = '' }: ThemePreviewProps) {
  const { colors, isDark } = useCurrentTheme();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* بطاقة مقال تجريبية */}
      <Card 
        className="overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text
        }}
      >
        <div 
          className="h-32 bg-gradient-to-r flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
          }}
        >
          <span className="text-white font-bold text-lg">صورة المقال</span>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium border"
              style={{ 
                backgroundColor: colors.accent + '20',
                color: colors.accent,
                borderColor: colors.accent
              }}
            >
              أخبار عاجلة
            </span>
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium border"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              تقنية
            </span>
          </div>
          
          <h3 
            className="text-lg font-bold mb-2 leading-relaxed"
            style={{ color: colors.text }}
          >
            عنوان المقال التجريبي - تحديث جديد في عالم التقنية
          </h3>
          
          <p 
            className="text-sm mb-4 leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            هذا نص تجريبي لمعاينة شكل المقال في الثيم الحالي. يمكنك رؤية كيف تبدو الألوان والتنسيق مع النص العربي والمحتوى المختلف.
          </p>
          
          <div className="flex items-center justify-between text-xs mb-4" style={{ color: colors.textSecondary }}>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                أحمد محمد
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                منذ ساعتين
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                1.2k مشاهدة
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                style={{
                  backgroundColor: colors.primary,
                  color: 'white'
                }}
                className="hover:opacity-90"
              >
                اقرأ المزيد
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                style={{
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3 text-xs" style={{ color: colors.textSecondary }}>
              <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                <Heart className="w-4 h-4" />
                24
              </button>
              <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                <MessageCircle className="w-4 h-4" />
                8
              </button>
              <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بطاقة إحصائيات تجريبية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المقالات', value: '1,234', icon: TrendingUp, color: colors.success },
          { label: 'المشاهدات اليوم', value: '45.6k', icon: Eye, color: colors.primary },
          { label: 'التعليقات الجديدة', value: '89', icon: MessageCircle, color: colors.accent },
          { label: 'التقييمات', value: '4.8', icon: Star, color: colors.warning }
        ].map((stat, index) => (
          <Card 
            key={index}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border
            }}
          >
            <CardContent className="p-4 text-center">
              <div 
                className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: stat.color + '20' }}
              >
                <stat.icon 
                  className="w-5 h-5" 
                  style={{ color: stat.color }} 
                />
              </div>
              <div className="text-lg font-bold" style={{ color: colors.text }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: colors.textSecondary }}>
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* شريط الألوان */}
      <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <CardHeader>
          <CardTitle style={{ color: colors.text }}>معاينة الألوان</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(colors).slice(0, 8).map(([name, color]) => (
              <div key={name} className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                  style={{ 
                    backgroundColor: color,
                    borderColor: colors.border
                  }}
                />
                <div className="text-xs font-medium" style={{ color: colors.text }}>
                  {getColorName(name)}
                </div>
                <div className="text-xs font-mono" style={{ color: colors.textSecondary }}>
                  {color}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// دالة مساعدة لترجمة أسماء الألوان
function getColorName(key: string): string {
  const names: Record<string, string> = {
    primary: 'أساسي',
    secondary: 'ثانوي',
    accent: 'مميز',
    background: 'خلفية',
    surface: 'سطح',
    text: 'نص',
    textSecondary: 'نص ثانوي',
    border: 'حدود',
    success: 'نجاح',
    warning: 'تحذير',
    error: 'خطأ',
    info: 'معلومات'
  };
  return names[key] || key;
}
