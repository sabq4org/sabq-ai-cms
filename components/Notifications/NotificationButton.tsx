'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationCenter from './NotificationCenter';

interface NotificationButtonProps {
  className?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  className = '',
  showBadge = true,
  size = 'md'
}) => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className={`relative ${getSizeClasses()} p-0 hover:bg-gray-100 dark:hover:bg-gray-700`}
        title={`الإشعارات${unreadCount > 0 ? ` (${unreadCount} غير مقروء)` : ''}`}
      >
        {unreadCount > 0 ? (
          <BellRing className={`${getIconSize()} text-blue-600 dark:text-blue-400`} />
        ) : (
          <Bell className={`${getIconSize()} text-gray-600 dark:text-gray-400`} />
        )}
        
        {/* شارة عدد الإشعارات غير المقروءة */}
        {showBadge && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* نقطة التنبيه للإشعارات الجديدة */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* مركز الإشعارات */}
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      {/* خلفية شفافة لإغلاق المركز عند النقر خارجه */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationButton;