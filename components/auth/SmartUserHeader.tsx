'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function SmartUserHeader() {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // إذا كان هناك خطأ خادم لكن لا يوجد مستخدم، أظهر guest
  if (error && !user) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-sm">⚠️</span>
        </div>
        <span className="text-sm">خطأ في الاتصال</span>
      </div>
    );
  }

  // إذا لا يوجد مستخدم، أظهر guest
  if (!user) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-sm">👤</span>
        </div>
        <span className="text-sm">ضيف</span>
      </div>
    );
  }

  // إذا يوجد مستخدم، اعرض المعلومات مع تحذير إذا كانت جزئية
  return (
    <div className="flex items-center space-x-2">
      {error && (
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title={error} />
      )}
      
      <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
        {user.avatar ? (
          <Image 
            src={user.avatar} 
            alt={user.name || user.email}
            width={32}
            height={32}
            className="w-full h-full object-cover rounded-full"
            onError={() => {
              // Handle error - could set a flag to show fallback
            }}
          />
        ) : (
          <span className="text-white text-sm">
            {(user.name || user.email)[0]?.toUpperCase()}
          </span>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {user.name || 'مستخدم سبق'}
        </span>
        {user.role === 'admin' && (
          <span className="text-xs text-blue-600">مدير</span>
        )}
      </div>
    </div>
  );
}
