'use client';

import { useState, useEffect, useRef } from 'react';
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

  // تحديد حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // جلب معلومات الولاء
  useEffect(() => {
    const fetchLoyaltyInfo = async () => {
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

    if (user?.id) {
      fetchLoyaltyInfo();
    }
  }, [user]);

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

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // إظهار القائمة بتأثير والتحكم في overflow
  useEffect(() => {
    if (isMounted) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      
      // منع التمرير عند فتح القائمة في الموبايل فقط
      if (isMobile && typeof document !== 'undefined') {
        // حفظ الحالة الأصلية لـ overflow
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        // إضافة class لمنع التمرير
        document.body.classList.add('dropdown-open');
        
        return () => {
          document.body.style.overflow = originalOverflow;
          document.body.classList.remove('dropdown-open');
        };
      }
    }
  }, [isMounted, isMobile]);

  // دالة إغلاق القائمة مع تنظيف overflow
  const handleClose = () => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.classList.remove('dropdown-open');
    }
    onClose();
  };

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    if (!isMounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // التحقق من أن النقرة ليست على زر فتح القائمة
        if (anchorElement && !anchorElement.contains(event.target as Node)) {
          handleClose();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMounted, anchorElement]);

  if (!isMounted || typeof document === 'undefined') return null;

  const dropdownContent = (
    <>
      {/* الخلفية المعتمة للموبايل */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleClose}
        />
      )}
      
      <div 
        ref={dropdownRef}
        className={`
          ${isMobile 
            ? 'fixed inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl animate-slide-up' 
            : 'absolute w-80 rounded-xl animate-fade-in'
          } 
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          shadow-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          overflow-hidden z-50 transition-all duration-200
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
        style={!isMobile ? { top: position.top, left: position.left } : {}}
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
            onClick={handleClose}
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
            onClick={handleClose}
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
            onClick={handleClose}
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
            onClick={handleClose}
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
            onClick={handleClose}
          >
            <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600" />
            <span>الإعدادات</span>
          </Link>

          <Link
            href="/notifications"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
            onClick={handleClose}
          >
            <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-yellow-500" />
            <span>الإشعارات</span>
          </Link>
        </div>

        {/* زر تسجيل الخروج */}
        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => {
              onLogout();
              handleClose();
            }}
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