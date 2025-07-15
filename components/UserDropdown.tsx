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
  ChevronRight,
  Award,
  Crown,
  Trophy,
  Target
} from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface LoyaltyInfo {
  level: string;
  levelIcon: any;
  levelColor: string;
  points: number;
  nextLevelPoints: number;
  progress: number;
}

interface UserDropdownProps {
  user: UserData;
  onClose: () => void;
  onLogout: () => void;
  anchorElement?: HTMLElement | null;
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
  const handleClose = useCallback(() => {
    setIsVisible(false);
    
    // إزالة منع التمرير
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('dropdown-open');
    }
    
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
    window.addEventListener('resize', handleResize);
    
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
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.classList.remove('dropdown-open');
      }
    };
  }, []);

  // إظهار القائمة ومنع التمرير للموبايل
  useEffect(() => {
    if (!isMounted) return;

    // إظهار القائمة
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // منع التمرير للموبايل فقط
    if (isMobile && typeof document !== 'undefined') {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.classList.add('dropdown-open');
    }

    return () => {
      clearTimeout(timer);
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
          let level = 'برونزي';
          let levelIcon = Award;
          let levelColor = 'text-amber-600';
          
          if (data.points >= 1000) {
            level = 'ذهبي';
            levelIcon = Crown;
            levelColor = 'text-yellow-500';
          } else if (data.points >= 500) {
            level = 'فضي';
            levelIcon = Trophy;
            levelColor = 'text-gray-500';
          }
          
          setLoyaltyInfo({
            level,
            levelIcon,
            levelColor,
            points: data.points || 0,
            nextLevelPoints: data.points >= 1000 ? 1000 : (data.points >= 500 ? 1000 : 500),
            progress: data.points >= 1000 ? 100 : (data.points >= 500 ? (data.points / 1000) * 100 : (data.points / 500) * 100)
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
          handleClose();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    // إضافة المستمعين بدون منع التمرير العام
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMounted, anchorElement, handleClose]);

  // دالة معالجة النقر على الروابط
  const handleLinkClick = useCallback(() => {
    handleClose();
  }, [handleClose]);

  // دالة معالجة تسجيل الخروج
  const handleLogout = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    onLogout();
    handleClose();
  }, [onLogout, handleClose]);

  if (!isMounted) return null;

  const menuItems = [
    { icon: User, label: 'الملف الشخصي', href: '/profile' },
    { icon: Target, label: 'رحلتك المعرفية', href: '/my-journey' },
    { icon: Settings, label: 'الإعدادات', href: '/settings' },
  ];

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`fixed z-[9999] ${
        isMobile 
          ? 'inset-0 bg-black/50 backdrop-blur-sm' 
          : 'w-80'
      } transition-all duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={!isMobile ? { top: position.top, left: position.left } : {}}
    >
      <div className={`${
        isMobile 
          ? 'absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl' 
          : 'rounded-xl shadow-2xl border'
      } ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } overflow-hidden ${
        isMobile 
          ? `transform transition-transform duration-300 ${
              isVisible ? 'translate-y-0' : 'translate-y-full'
            }` 
          : ''
      }`}>
        
        {/* Header */}
        <div className={`p-4 ${
          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        } border-b ${
          darkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={56}
                  height={56}
                  className="user-avatar-large"
                  priority
                />
              ) : (
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                  darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : '؟'}
                </div>
              )}
              <div>
                <h3 className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.name || user.email?.split('@')[0] || 'مستخدم'}
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {user.email}
                </p>
              </div>
            </div>
            
            {isMobile && (
              <button
                onClick={handleClose}
                className={`p-2 rounded-full ${
                  darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Loyalty Info */}
          {loyaltyInfo && (
            <div className={`mt-3 p-3 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <loyaltyInfo.levelIcon className={`w-4 h-4 ${loyaltyInfo.levelColor}`} />
                  <span className={`text-sm font-medium ${loyaltyInfo.levelColor}`}>
                    {loyaltyInfo.level}
                  </span>
                </div>
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {loyaltyInfo.points} نقطة
                </span>
              </div>
              <div className={`w-full bg-gray-200 rounded-full h-2 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loyaltyInfo.progress}%` }}
                />
              </div>
              <p className={`text-xs mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {loyaltyInfo.nextLevelPoints - loyaltyInfo.points} نقطة للمستوى التالي
              </p>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="py-2 max-h-96 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${
          darkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-3 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );

  // استخدام Portal للموبايل فقط
  if (isMobile && typeof document !== 'undefined') {
    return ReactDOM.createPortal(dropdownContent, document.body);
  }

  return dropdownContent;
}