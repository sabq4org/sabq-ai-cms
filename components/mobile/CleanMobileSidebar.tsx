"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import { X, Home, Activity, Newspaper, Sparkles, PenTool, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CleanMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// عناصر القائمة - أقسام الموقع فقط
const menuItems = [
  { 
    label: 'الرئيسية', 
    url: '/', 
    icon: Home,
    color: 'text-blue-600 dark:text-blue-400'
  },
  { 
    label: 'اللحظة بلحظة', 
    url: '/moment-by-moment', 
    icon: Activity,
    highlight: true,
    color: 'text-red-500 dark:text-red-400',
    pulse: true
  },
  { 
    label: 'الأخبار', 
    url: '/news', 
    icon: Newspaper,
    color: 'text-green-600 dark:text-green-400'
  },
  { 
    label: 'التحليل العميق', 
    url: '/deep-analysis', 
    icon: Sparkles,
    color: 'text-indigo-600 dark:text-indigo-400'
  },
  { 
    label: 'مقالات الرأي',
    url: '/opinion',
    icon: PenTool,
    color: 'text-orange-600 dark:text-orange-400',
    badge: 'جديد'
  },
  { 
    label: 'الميديا', 
    url: '/media', 
    icon: Bookmark,
    color: 'text-purple-600 dark:text-purple-400'
  },
];

const CleanMobileSidebar = memo(({ isOpen, onClose }: CleanMobileSidebarProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية الشفافة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* القائمة الجانبية */}
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-white dark:bg-gray-900 z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* رأس القائمة */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">س</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">سبق الذكية</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">صحيفة إلكترونية بالذكاء الاصطناعي</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    aria-label="إغلاق القائمة"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* قائمة الأقسام */}
              <div className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.li
                        key={item.url}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.url}
                          onClick={onClose}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                            ${item.highlight 
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <Icon className={`w-5 h-5 ${item.color} ${item.pulse ? 'animate-pulse' : ''}`} />
                          <span className="flex-1 font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>

              {/* الفوتر */}
              <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  جميع الحقوق محفوظة © سبق الذكية 2024
                </p>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
});

CleanMobileSidebar.displayName = 'CleanMobileSidebar';

export default CleanMobileSidebar;
