'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface LoyaltyInfo {
  points: number;
  nextLevelPoints: number;
  progress: number;
}

interface UserData {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface UserDropdownProps {
  user: UserData;
  onLogout: () => void;
  anchorElement?: HTMLElement | null;
  open?: boolean;
  onClose?: () => void;
}

export default function UserDropdown({ user, onLogout, anchorElement, open = false, onClose }: UserDropdownProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState<boolean>(!!open);
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // مزامنة الحالة مع prop open
  useEffect(() => {
    setIsVisible(!!open);
  }, [open]);

  // إغلاق بأمان
  const handleClose = useCallback(() => {
    setIsVisible(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('dropdown-open');
    }
    onClose && onClose();
  }, [onClose]);

  // قفل التمرير عند فتح القائمة على الموبايل فقط
  useEffect(() => {
    if (!isMobile) return;
    if (typeof document === 'undefined') return;

    if (isVisible) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.classList.add('dropdown-open');
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('dropdown-open');
    }
  }, [isVisible, isMobile]);

  // تحديد حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // حساب موقع القائمة
  useEffect(() => {
    if (anchorElement && !isMobile && typeof window !== 'undefined') {
      const rect = anchorElement.getBoundingClientRect();
      const dropdownWidth = 320;
      const dropdownHeight = 500;

      let left = rect.left;
      let top = rect.bottom + 8;

      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 8;
      }
      setPosition({ top, left });
    }
  }, [anchorElement, isMobile, isVisible]);

  // إغلاق عند الضغط خارج العنصر
  useEffect(() => {
    if (!isVisible) return;
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isVisible, handleClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={dropdownRef}
      className={`fixed md:absolute z-[1000] ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-xl rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
      style={!isMobile ? { top: position.top, left: position.left, width: 320 } : { inset: 0, width: '100%', height: '100%' }}
    >
      {/* المحتوى مختصر للتوضيح */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="font-semibold">{user?.name || 'المستخدم'}</div>
            <div className="text-xs opacity-60">{user?.email}</div>
          </div>
          <button onClick={handleClose} className="text-sm opacity-70 hover:opacity-100">إغلاق</button>
        </div>
        <div className="mt-4 grid gap-2 text-sm">
          <a href="/profile" className="hover:underline">الملف الشخصي</a>
          <a href="/profile/saved" className="hover:underline">المحفوظات</a>
          <a href="/profile/liked" className="hover:underline">الإعجابات</a>
          <button onClick={onLogout} className="text-red-600 text-right hover:underline mt-2">تسجيل الخروج</button>
        </div>
      </div>
    </div>
  );
}