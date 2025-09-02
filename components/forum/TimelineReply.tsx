'use client';

import React, { useEffect, useState, useRef } from 'react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useClientTheme } from '@/hooks/useClientTheme';

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  isAccepted?: boolean;
  isPinned?: boolean;
  isHighlighted?: boolean;
}

interface TimelineReplyProps {
  replies: Reply[];
}

export default function TimelineReply({ replies }: TimelineReplyProps) {
  // استخدام hook الثيم الموحد
  const { darkMode, mounted } = useClientTheme();
  
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const repliesContainerRef = useRef<HTMLDivElement>(null);

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `اليوم ${format(date, 'HH:mm', { locale: ar })}`;
    } else if (isYesterday(date)) {
      return `أمس ${format(date, 'HH:mm', { locale: ar })}`;
    } else if (differenceInDays(new Date(), date) < 7) {
      return format(date, 'EEEE HH:mm', { locale: ar });
    } else {
      return format(date, 'dd MMM HH:mm', { locale: ar });
    }
  };

  // تتبع التمرير
  useEffect(() => {
    const handleScroll = () => {
      if (repliesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = repliesContainerRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(Math.min(progress, 100));
      }
    };

    const container = repliesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // التمرير إلى رد معين
  const scrollToReply = (replyId: string) => {
    const element = document.getElementById(`reply-${replyId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveReplyId(replyId);
      
      // إزالة التمييز بعد 2 ثانية
      setTimeout(() => setActiveReplyId(null), 2000);
    }
  };

  // حماية من العرض قبل التهيئة
  if (!mounted) {
    return (
      <div className="flex gap-4 relative">
        <div className="w-24 h-32 bg-gray-200 animate-pulse rounded-lg hidden lg:block"></div>
        <div className="flex-1 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 relative">
      {/* الخط الزمني */}
      <div 
        ref={timelineRef}
        className={`sticky top-20 h-[calc(100vh-10rem)] w-24 flex flex-col items-center py-8 ${
          darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'
        } backdrop-blur-sm rounded-lg hidden lg:flex`}
      >
        {/* شريط التقدم */}
        <div className="absolute top-8 bottom-8 w-0.5 bg-gray-300 dark:bg-gray-600">
          <div 
            className="absolute top-0 w-full bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-300"
            style={{ height: `${scrollProgress}%` }}
          />
        </div>

        {/* نقاط الخط الزمني */}
        <div className="relative z-10 flex flex-col justify-between h-full py-4">
          {replies.map((reply, index) => {
            const position = (index / (replies.length - 1)) * 100;
            const isActive = activeReplyId === reply.id;
            const isSpecial = reply.isAccepted || reply.isPinned || reply.isHighlighted;
            
            return (
              <div
                key={reply.id}
                className="absolute transform -translate-y-1/2"
                style={{ top: `${position}%` }}
              >
                <button
                  onClick={() => scrollToReply(reply.id)}
                  className={`group relative flex items-center gap-2 transition-all duration-300 ${
                    isActive ? 'scale-125' : 'hover:scale-110'
                  }`}
                >
                  {/* النقطة */}
                  <div className={`
                    w-3 h-3 rounded-full border-2 transition-all duration-300
                    ${isActive ? 'w-4 h-4' : ''}
                    ${isSpecial 
                      ? 'bg-yellow-500 border-yellow-600' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-600' 
                        : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500'
                    }
                  `} />
                  
                  {/* التاريخ */}
                  <div className={`
                    absolute right-6 whitespace-nowrap text-xs px-2 py-1 rounded-md
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-800 text-white'}
                  `}>
                    {formatDate(reply.createdAt)}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* معلومات إضافية */}
        <div className="absolute bottom-2 text-xs text-gray-500 dark:text-gray-400">
          {replies.length} رد
        </div>
      </div>

      {/* حاوية الردود */}
      <div 
        ref={repliesContainerRef}
        className="flex-1 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto scroll-smooth"
      >
        {replies.map((reply) => (
          <div
            key={reply.id}
            id={`reply-${reply.id}`}
            className={`
              p-4 rounded-lg transition-all duration-300
              ${activeReplyId === reply.id 
                ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]' 
                : ''
              }
              ${darkMode ? 'bg-gray-800' : 'bg-white'}
              ${reply.isAccepted ? 'border-l-4 border-green-500' : ''}
              ${reply.isPinned ? 'border-l-4 border-yellow-500' : ''}
            `}
          >
            {/* رأس الرد */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* الصورة الرمزية */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                  ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}
                `}>
                  {reply.author.avatar || (reply.author.name ? reply.author.name.charAt(0).toUpperCase() : '؟')}
                </div>
                
                {/* معلومات المؤلف */}
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {reply.author.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(reply.createdAt)}
                  </p>
                </div>
              </div>

              {/* الشارات */}
              <div className="flex items-center gap-2">
                {reply.isAccepted && (
                  <span className="text-green-500 text-sm" title="إجابة مقبولة">✓</span>
                )}
                {reply.isPinned && (
                  <span className="text-yellow-500 text-sm" title="مثبت">📌</span>
                )}
              </div>
            </div>

            {/* محتوى الرد */}
            <div className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {reply.content}
            </div>
          </div>
        ))}
      </div>

      {/* الخط الزمني للجوال */}
      <div className={`
        fixed bottom-20 left-4 right-4 h-2 rounded-full lg:hidden
        ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
      `}>
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
        <div className="absolute -top-8 left-0 text-xs text-gray-500 dark:text-gray-400">
          {Math.round(scrollProgress)}%
        </div>
      </div>
    </div>
  );
} 