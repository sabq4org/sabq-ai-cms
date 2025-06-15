'use client';

import React from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الشريط العلوي */}
      <nav className="sabq-navbar h-16 flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">لوحة تحكم سبق</h1>
          </Link>
        </div>
        
        <div className="mr-auto flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">أ</span>
            </div>
            <span className="text-sm">مرحباً، أحمد</span>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* الشريط الجانبي */}
        <DashboardSidebar />
        
        {/* المحتوى الرئيسي */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 