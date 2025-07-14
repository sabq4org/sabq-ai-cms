'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  Settings, 
  LogOut, 
  X, 
  Heart, 
  Bell, 
  ChevronRight,
  Award,
  Star,
  Crown,
  Trophy,
  Bookmark,
  Activity,
  Brain,
  MessageSquare
} from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface LoyaltyData {
  total_points: number;
  tier: string;
  earned_points: number;
  redeemed_points: number;
}

interface UserDropdownProps {
  user: UserData;
  onClose: () => void;
  onLogout: () => void;
  anchorElement?: HTMLElement | null;
}

interface LoyaltyInfo {
  level: string;
  levelIcon: any;
  levelColor: string;
  points: number;
  nextLevelPoints: number;
  progress: number;
}

export default function UserDropdown({ user, onClose, onLogout, anchorElement }: UserDropdownProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const { darkMode } = useDarkModeContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // دالة آمنة لإغلاق القائمة
  const handleClose = useCallback((event?: Event | React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // تنظيف body styles
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.classList.remove('dropdown-open');
    }
    
    // إخفاء القائمة أولاً
    setIsVisible(false);
    
    // إغلاق القائمة بعد انتهاء الأنيميشن
    setTimeout(() => {
      onClose();
    }, 150);
  }, [onClose]);

  // تحديد حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };
    
    checkMobile();
    
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // إعداد القائمة عند التحميل
  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      // تنظيف شامل عند إلغاء التحميل
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.classList.remove('dropdown-open');
      }
      setIsMounted(false);
    };
  }, []);

  // منع التمرير وإظهار القائمة
  useEffect(() => {
    if (!isMounted) return;

    // إظهار القائمة
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // منع التمرير للموبايل فقط
    if (isMobile && typeof document !== 'undefined') {
      const body = document.body;
      const scrollY = window.scrollY;
      
      // حفظ الحالة الحالية
      const originalStyles = {
        overflow: body.style.overflow,
        position: body.style.position,
        top: body.style.top,
        width: body.style.width,
      };
      
      // تطبيق منع التمرير
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.classList.add('dropdown-open');
      
      return () => {
        // استعادة الحالة الأصلية
        Object.assign(body.style, originalStyles);
        body.classList.remove('dropdown-open');
        window.scrollTo(0, scrollY);
      };
    }

    return () => {
      cancelAnimationFrame(timer);
    };
  }, [isMounted, isMobile]);

  // حساب موقع القائمة
  useEffect(() => {
    if (anchorElement && !isMobile && typeof window !== 'undefined') {
      const rect = anchorElement.getBoundingClientRect();
      const dropdownWidth = 320;
      const dropdownHeight = 500;
      
      let left = rect.left;
      let top = rect.bottom + 8;
      
      // التحقق من تجاوز حدود الشاشة
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 8;
      }
      
      setPosition({ top, left });
    }
  }, [anchorElement, isMobile]);

  // جلب معلومات الولاء
  useEffect(() => {
    const fetchLoyaltyInfo = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/loyalty/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          
          // تحديد مستوى العضوية
          let level = 'عضو جديد';
          let levelIcon = Star;
          let levelColor = 'text-gray-500';
          let nextLevelPoints = 100;
          
          if (data.totalPoints >= 1000) {
            level = 'عضو ذهبي';
            levelIcon = Crown;
            levelColor = 'text-yellow-500';
            nextLevelPoints = 5000;
          } else if (data.totalPoints >= 500) {
            level = 'عضو فضي';
            levelIcon = Trophy;
            levelColor = 'text-gray-400';
            nextLevelPoints = 1000;
          } else if (data.totalPoints >= 100) {
            level = 'عضو برونزي';
            levelIcon = Award;
            levelColor = 'text-orange-600';
            nextLevelPoints = 500;
          }
          
          const progress = Math.min(100, (data.totalPoints / nextLevelPoints) * 100);
          
          setLoyaltyInfo({
            level,
            levelIcon,
            levelColor,
            points: data.totalPoints || 0,
            nextLevelPoints,
            progress
          });
        }
      } catch (error) {
        console.error('Error fetching loyalty info:', error);
      }
    };

    fetchLoyaltyInfo();
  }, [user?.id]);

  // معالجة الأحداث
  useEffect(() => {
    if (!isMounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // تحقق من أن النقرة ليست داخل القائمة
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // تحقق من أن النقرة ليست على زر فتح القائمة
        if (!anchorElement || !anchorElement.contains(target)) {
          handleClose(event);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose(event);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      // منع التمرير على الموبايل
      if (isMobile) {
        event.preventDefault();
      }
    };

    // إضافة المستمعين
    document.addEventListener('mousedown', handleClickOutside, { passive: false });
    document.addEventListener('keydown', handleEscape, { passive: false });
    
    if (isMobile) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMounted, isMobile, anchorElement, handleClose]);

  // دالة معالجة النقر على الروابط
  const handleLinkClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
  }, [handleClose]);

  // دالة معالجة تسجيل الخروج
  const handleLogout = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    onLogout();
    handleClose();
  }, [onLogout, handleClose]);

  if (!isMounted || typeof document === 'undefined') return null;

  const dropdownContent = (
    <>
      {/* الخلفية المعتمة للموبايل */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleClose}
          style={{ touchAction: 'none' }}
        />
      )}
      
      <div 
        ref={dropdownRef}
        className={`
          ${isMobile 
            ? 'fixed inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl' 
            : 'absolute w-80 rounded-xl'
          } 
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          shadow-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          overflow-hidden z-50 transition-all duration-200 ease-out
          ${isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-2 scale-95'
          }
        `}
        style={!isMobile ? { top: position.top, left: position.left } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* رأس القائمة - معلومات المستخدم */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={56}
                  height={56}
                  className="rounded-full ring-2 ring-white dark:ring-gray-700 shadow-md"
                />
              ) : (
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-md ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
                {user.role && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* بطاقة الولاء */}
          {loyaltyInfo && (
            <div className={`p-3 rounded-xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <loyaltyInfo.levelIcon className={`w-5 h-5 ${loyaltyInfo.levelColor}`} />
                  <span className={`text-sm font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {loyaltyInfo.level}
                  </span>
                </div>
                <span className={`text-sm font-bold ${loyaltyInfo.levelColor}`}>
                  {loyaltyInfo.points} نقطة
                </span>
              </div>
              {/* شريط التقدم */}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${loyaltyInfo.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                {loyaltyInfo.nextLevelPoints - loyaltyInfo.points} نقطة للمستوى التالي
              </p>
            </div>
          )}
        </div>

        {/* قائمة الروابط */}
        <div className="py-2 max-h-[60vh] overflow-y-auto">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
            onClick={handleLinkClick}
          >
            <User className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500" />
            <div className="flex-1">
              <span className="font-medium">ملفي الشخصي</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">عرض معلوماتك الكاملة</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/profile/saved"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
            onClick={handleLinkClick}
          >
            <Bookmark className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-green-500" />
            <div className="flex-1">
              <span className="font-medium">محفوظاتي</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">الأخبار المحفوظة للقراءة لاحقاً</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/profile/interactions"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
            onClick={handleLinkClick}
          >
            <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-red-500" />
            <div className="flex-1">
              <span className="font-medium">تفاعلاتي</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">اللايكات والمشاركات</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/welcome/preferences"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
            onClick={handleLinkClick}
          >
            <Brain className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-500" />
            <div className="flex-1">
              <span className="font-medium">اهتماماتي</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">تخصيص المحتوى</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <hr className={`my-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

          <Link
            href="/settings"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
            onClick={handleLinkClick}
          >
            <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600" />
            <span>الإعدادات</span>
          </Link>

          <Link
            href="/notifications"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
            onClick={handleLinkClick}
          >
            <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-yellow-500" />
            <span>الإشعارات</span>
          </Link>
        </div>

        {/* زر تسجيل الخروج */}
        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full text-right group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>

        {/* مساحة إضافية للموبايل */}
        {isMobile && <div className="h-safe-area-inset-bottom" />}
      </div>
    </>
  );

  return ReactDOM.createPortal(dropdownContent, document.body);
}