'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import DashboardMobileHeader from './DashboardMobileHeader';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock,
  Zap, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Newspaper,
  PenTool, 
  FileText, 
  Settings,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EnhancedMobileDashboardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showAdd?: boolean;
  showBack?: boolean;
  actionButtons?: React.ReactNode;
  onAdd?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onBack?: () => void;
}

export default function EnhancedMobileDashboard({
  children,
  title,
  subtitle,
  showSearch = false,
  showFilter = false,
  showAdd = false,
  showBack = false,
  actionButtons,
  onAdd,
  onSearch,
  onFilter,
  onBack
}: EnhancedMobileDashboardProps) {
  
  const { darkMode } = useDarkModeContext();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // عرض نسخة مبسطة للديسكتوب
  if (!isMobile) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-md mx-auto">
          <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="text-center mb-6">
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                واجهة الهاتف المحمول
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                للحصول على أفضل تجربة، يرجى استخدام جهاز محمول أو تصغير نافذة المتصفح
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-pulse">
          <div className={`w-8 h-8 rounded-full mb-4 mx-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          <div className={`h-4 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* الهيدر المحسن */}
      <DashboardMobileHeader 
        title={title}
        showSearch={showSearch}
        showNotifications={true}
      />

      {/* شريط العمليات الثانوي */}
      {(showBack || showFilter || showAdd || actionButtons || subtitle) && (
        <div className={`
          sticky top-[72px] z-40 border-b backdrop-blur-sm
          ${darkMode 
            ? 'bg-gray-800/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
          }
        `}>
          <div className="px-4 py-3">
            {/* العنوان الفرعي */}
            {subtitle && (
              <div className="mb-3">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {subtitle}
                </p>
              </div>
            )}

            {/* شريط الإجراءات */}
            <div className="flex items-center justify-between gap-3">
              {/* الجانب الأيمن - زر العودة */}
              <div className="flex items-center gap-2">
                {showBack && (
                  <button
                    onClick={() => onBack ? onBack() : router.back()}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                      ${darkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">رجوع</span>
                  </button>
                )}
              </div>

              {/* الجانب الأيسر - أزرار العمليات */}
              <div className="flex items-center gap-2">
                {showFilter && (
                  <button
                    onClick={onFilter}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${darkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                      }
                    `}
                    aria-label="تصفية"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                )}

                {showAdd && (
                  <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة
                  </button>
                )}

                {/* أزرار مخصصة إضافية */}
                {actionButtons}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <main className="relative">
        <div className="px-4 py-6 space-y-6">
          {children}
        </div>
      </main>

      {/* شريط سفلي ثابت للإجراءات السريعة */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-sm
        ${darkMode 
          ? 'bg-gray-800/95 border-gray-700' 
          : 'bg-white/95 border-gray-200'
        }
      `}>
        <div className="flex items-center justify-around px-4 py-3">
          <QuickAction 
            icon={BarChart3} 
            label="الإحصائيات" 
            onClick={() => router.push('/dashboard/analytics')}
            darkMode={darkMode}
          />
          <QuickAction 
            icon={FileText} 
            label="المقالات" 
            onClick={() => router.push('/dashboard/articles')}
            darkMode={darkMode}
          />
          <QuickAction 
            icon={Users} 
            label="المستخدمين" 
            onClick={() => router.push('/dashboard/users')}
            darkMode={darkMode}
          />
          <QuickAction 
            icon={Settings} 
            label="الإعدادات" 
            onClick={() => router.push('/dashboard/settings')}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* مساحة فارغة في الأسفل لتجنب تداخل الشريط السفلي */}
      <div className="h-20"></div>
    </div>
  );
}

// مكون الإجراء السريع
interface QuickActionProps {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  darkMode: boolean;
  isActive?: boolean;
}

function QuickAction({ icon: Icon, label, onClick, darkMode, isActive = false }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors
        ${isActive 
          ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
          : darkMode 
            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

// مكون بطاقة الإحصائيات المحسنة للموبايل
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<any>;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon }: StatCardProps) {
  const { darkMode } = useDarkModeContext();
  
  return (
    <Card className={`
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      hover:shadow-lg transition-shadow
    `}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {title}
            </p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {change && (
              <p className={`text-sm mt-1 ${
                changeType === 'positive' 
                  ? 'text-green-600' 
                  : changeType === 'negative' 
                    ? 'text-red-600' 
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {change}
              </p>
            )}
          </div>
          
          {Icon && (
            <div className={`
              p-3 rounded-lg
              ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
            `}>
              <Icon className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}