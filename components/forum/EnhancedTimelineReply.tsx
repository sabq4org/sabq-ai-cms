'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { format, isToday, isYesterday, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle, 
  Pin, 
  Filter,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Heart,
  Share2,
  MoreVertical
} from 'lucide-react';

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    isVerified?: boolean;
  };
  createdAt: string;
  updatedAt?: string;
  isAccepted?: boolean;
  isPinned?: boolean;
  isHighlighted?: boolean;
  isFeatured?: boolean;
  likes: number;
  isLiked?: boolean;
  replies?: Reply[];
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

interface TimelineEvent {
  id: string;
  type: 'reply' | 'milestone' | 'update';
  timestamp: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface EnhancedTimelineReplyProps {
  replies: Reply[];
  events?: TimelineEvent[];
  onReplyAction?: (action: string, replyId: string) => void;
  currentUserId?: string;
}

export default function EnhancedTimelineReply({ 
  replies, 
  events = [], 
  onReplyAction,
  currentUserId 
}: EnhancedTimelineReplyProps) {
  // نظام الثيم مع حماية من SSR
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // استخدام localStorage لتحديد الثيم
    const theme = localStorage.getItem('sabq-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(theme === 'dark' || (theme === null && systemPrefersDark));
  }, []);
  
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'pinned' | 'featured'>('all');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const repliesContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // تنسيق التاريخ المتقدم
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const minutesDiff = differenceInMinutes(now, date);
    const hoursDiff = differenceInHours(now, date);
    const daysDiff = differenceInDays(now, date);
    
    if (minutesDiff < 1) {
      return 'الآن';
    } else if (minutesDiff < 60) {
      return `منذ ${minutesDiff} دقيقة`;
    } else if (hoursDiff < 24) {
      return `منذ ${hoursDiff} ساعة`;
    } else if (isToday(date)) {
      return `اليوم ${format(date, 'HH:mm', { locale: ar })}`;
    } else if (isYesterday(date)) {
      return `أمس ${format(date, 'HH:mm', { locale: ar })}`;
    } else if (daysDiff < 7) {
      return format(date, 'EEEE HH:mm', { locale: ar });
    } else if (daysDiff < 30) {
      return `منذ ${daysDiff} يوم`;
    } else {
      return format(date, 'dd MMMM yyyy', { locale: ar });
    }
  };

  // فلترة الردود
  const filteredReplies = replies.filter(reply => {
    switch (filter) {
      case 'accepted':
        return reply.isAccepted;
      case 'pinned':
        return reply.isPinned;
      case 'featured':
        return reply.isFeatured;
      default:
        return true;
    }
  });

  // دمج الردود والأحداث
  const timelineItems = [
    ...filteredReplies.map(reply => ({
      type: 'reply' as const,
      id: reply.id,
      timestamp: reply.createdAt,
      data: reply
    })),
    ...events.map(event => ({
      type: 'event' as const,
      id: event.id,
      timestamp: event.timestamp,
      data: event
    }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // مراقبة الردود المرئية
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const replyId = entry.target.getAttribute('data-reply-id');
            if (replyId && entry.intersectionRatio > 0.5) {
              setActiveReplyId(replyId);
            }
          }
        });
      },
      { threshold: [0.5], rootMargin: '-20% 0px -70% 0px' }
    );

    const replyElements = document.querySelectorAll('[data-reply-id]');
    replyElements.forEach(el => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [filteredReplies]);

  // التمرير إلى رد معين
  const scrollToReply = useCallback((replyId: string) => {
    const element = document.getElementById(`reply-${replyId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // تأثير التمييز
      element.classList.add('reply-highlighted');
      setTimeout(() => element.classList.remove('reply-highlighted'), 2000);
    }
  }, []);

  // توسيع/طي الردود الفرعية
  const toggleReplies = (replyId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
      }
      return newSet;
    });
  };

  // حماية من العرض قبل التهيئة
  if (!mounted) {
    return (
      <div className="flex gap-6 relative">
        <div className="w-32 h-96 bg-gray-200 animate-pulse rounded-lg hidden lg:block"></div>
        <div className="flex-1 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 relative">
      {/* الخط الزمني - نسخة سطح المكتب */}
      <div 
        ref={timelineRef}
        className={`sticky top-20 h-[calc(100vh-10rem)] w-32 flex flex-col py-8 ${
          darkMode ? 'bg-gray-800/30' : 'bg-gray-50/50'
        } backdrop-blur-sm rounded-xl hidden lg:flex shadow-lg`}
      >
        {/* رأس الخط الزمني */}
        <div className="px-4 mb-6">
          <h3 className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            الخط الزمني
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`mt-2 flex items-center gap-1 text-xs ${
              darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            <Filter className="w-3 h-3" />
            فلتر
          </button>
        </div>

        {/* خيارات الفلتر */}
        {showFilters && (
          <div className="px-4 mb-4 space-y-1">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'accepted', label: 'المقبولة', icon: <CheckCircle className="w-3 h-3" /> },
              { value: 'pinned', label: 'المثبتة', icon: <Pin className="w-3 h-3" /> },
              { value: 'featured', label: 'المميزة', icon: <Star className="w-3 h-3" /> }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
                  filter === option.value
                    ? darkMode 
                      ? 'bg-blue-900/50 text-blue-300' 
                      : 'bg-blue-100 text-blue-700'
                    : darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* شريط التقدم */}
        <div className="relative flex-1 mx-auto">
          <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-gray-300 to-gray-300 dark:from-gray-600 dark:to-gray-600">
            <div 
              className="absolute top-0 w-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
              style={{ height: `${scrollProgress}%` }}
            />
          </div>

          {/* نقاط الخط الزمني */}
          <div className="relative z-10 h-full">
            {timelineItems.map((item, index) => {
              const position = (index / Math.max(timelineItems.length - 1, 1)) * 100;
              const isActive = item.type === 'reply' && activeReplyId === item.id;
              const isSpecial = item.type === 'reply' && (
                item.data.isAccepted || 
                item.data.isPinned || 
                item.data.isFeatured
              );
              
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${position}%` }}
                >
                  <button
                    onClick={() => item.type === 'reply' && scrollToReply(item.id)}
                    onMouseEnter={() => setHoveredDate(item.id)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={`group relative flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'scale-125' : 'hover:scale-110'
                    } ${item.type === 'event' ? 'cursor-default' : ''}`}
                  >
                    {/* النقطة */}
                    <div className={`
                      relative rounded-full border-2 transition-all duration-300
                      ${item.type === 'event' 
                        ? 'w-4 h-4 bg-purple-500 border-purple-600' 
                        : isActive 
                          ? 'w-5 h-5 timeline-dot-active' 
                          : 'w-4 h-4 timeline-dot'
                      }
                      ${item.type === 'reply' && isSpecial 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-600' 
                        : item.type === 'reply' && isActive 
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-700' 
                          : item.type === 'reply'
                            ? 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500'
                            : ''
                      }
                    `}>
                      {item.type === 'event' && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                          {item.data.icon || <Calendar className="w-2 h-2" />}
                        </div>
                      )}
                    </div>
                    
                    {/* التاريخ والمعلومات */}
                    {hoveredDate === item.id && (
                      <div className={`
                        timeline-date-tooltip absolute right-8 px-3 py-2 rounded-lg text-xs
                        whitespace-nowrap shadow-lg z-50
                        ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-800 text-white'}
                      `}>
                        <div className="font-semibold mb-1">
                          {formatDate(item.timestamp)}
                        </div>
                        {item.type === 'reply' && (
                          <div className="text-xs opacity-80">
                            {item.data.author.name}
                          </div>
                        )}
                        {item.type === 'event' && item.data.title && (
                          <div className="text-xs opacity-80">
                            {item.data.title}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>الردود</span>
              <span className="font-semibold">{filteredReplies.length}</span>
            </div>
            {events.length > 0 && (
              <div className="flex items-center justify-between">
                <span>الأحداث</span>
                <span className="font-semibold">{events.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* حاوية الردود */}
      <div 
        ref={repliesContainerRef}
        className="flex-1 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto timeline-scroll-container pr-2"
      >
        {timelineItems.map((item) => {
          if (item.type === 'event') {
            // عرض الأحداث
            return (
              <div
                key={item.id}
                className={`
                  p-4 rounded-lg border-2 border-dashed
                  ${darkMode 
                    ? 'bg-purple-900/20 border-purple-700 text-purple-300' 
                    : 'bg-purple-50 border-purple-300 text-purple-700'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/20">
                    {item.data.icon || <Calendar className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.data.title}</h4>
                    {item.data.description && (
                      <p className="text-sm opacity-80 mt-1">{item.data.description}</p>
                    )}
                    <p className="text-xs opacity-60 mt-1">
                      {formatDate(item.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // عرض الردود
          const reply = item.data as Reply;
          const isExpanded = expandedReplies.has(reply.id);
          
          return (
            <div
              key={reply.id}
              id={`reply-${reply.id}`}
              data-reply-id={reply.id}
              className={`
                reply-card p-5 rounded-xl transition-all duration-300 shadow-sm
                ${activeReplyId === reply.id 
                  ? 'ring-2 ring-blue-500 shadow-xl scale-[1.01]' 
                  : 'hover:shadow-md'
                }
                ${darkMode ? 'bg-gray-800' : 'bg-white'}
                ${reply.isAccepted ? 'border-l-4 border-green-500' : ''}
                ${reply.isPinned ? 'border-l-4 border-yellow-500' : ''}
                ${reply.isFeatured ? 'border-l-4 border-purple-500' : ''}
              `}
            >
              {/* رأس الرد */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* الصورة الرمزية */}
                  <div className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                    ${darkMode ? 'bg-gradient-to-br from-gray-600 to-gray-700' : 'bg-gradient-to-br from-gray-400 to-gray-500'}
                  `}>
                    {reply.author.avatar ? (
                      <img src={reply.author.avatar} alt={reply.author.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      reply.author.name ? reply.author.name.charAt(0).toUpperCase() : '؟'
                    )}
                    {reply.author.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* معلومات المؤلف */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {reply.author.name}
                      </h4>
                      {reply.author.role && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          reply.author.role === 'مشرف' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : reply.author.role === 'خبير'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {reply.author.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(reply.createdAt)}
                      {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                        <span className="text-gray-400"> • تم التعديل</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* الشارات والإجراءات */}
                <div className="flex items-center gap-2">
                  {reply.isAccepted && (
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg" title="إجابة مقبولة">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  {reply.isPinned && (
                    <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg" title="مثبت">
                      <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  )}
                  {reply.isFeatured && (
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg" title="مميز">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  
                  {currentUserId === reply.author.id && (
                    <button 
                      onClick={() => onReplyAction?.('edit', reply.id)}
                      className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* محتوى الرد */}
              <div className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>
                {reply.content}
              </div>

              {/* المرفقات */}
              {reply.attachments && reply.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {reply.attachments.map((attachment, idx) => (
                    <div key={idx} className={`
                      px-3 py-2 rounded-lg text-sm flex items-center gap-2
                      ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                    `}>
                      {attachment.type === 'image' ? '🖼️' : '📎'}
                      <span>{attachment.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* إجراءات الرد */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onReplyAction?.('like', reply.id)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      reply.isLiked 
                        ? 'text-red-500' 
                        : darkMode 
                          ? 'text-gray-400 hover:text-red-400' 
                          : 'text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${reply.isLiked ? 'fill-current' : ''}`} />
                    <span>{reply.likes}</span>
                  </button>
                  
                  {reply.replies && reply.replies.length > 0 && (
                    <button
                      onClick={() => toggleReplies(reply.id)}
                      className={`flex items-center gap-2 text-sm ${
                        darkMode 
                          ? 'text-gray-400 hover:text-blue-400' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{reply.replies.length} رد</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                  
                  <button
                    onClick={() => onReplyAction?.('share', reply.id)}
                    className={`flex items-center gap-2 text-sm ${
                      darkMode 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-600 hover:text-gray-700'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onReplyAction?.('reply', reply.id)}
                  className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  رد
                </button>
              </div>

              {/* الردود الفرعية */}
              {isExpanded && reply.replies && reply.replies.length > 0 && (
                <div className="mt-4 mr-8 space-y-3 border-r-2 border-gray-200 dark:border-gray-700 pr-4">
                  {reply.replies.map(subReply => (
                    <div key={subReply.id} className={`
                      p-3 rounded-lg
                      ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
                    `}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                          ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}
                        `}>
                          {subReply.author.name ? subReply.author.name.charAt(0).toUpperCase() : '؟'}
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {subReply.author.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                            {formatDate(subReply.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {subReply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* الخط الزمني للجوال */}
      <div className="mobile-progress-bar lg:hidden">
        <div 
          className="mobile-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* مؤشر التقدم للجوال */}
      <div className={`
        fixed bottom-24 left-4 text-xs lg:hidden
        px-3 py-1.5 rounded-full shadow-lg
        ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}
      `}>
        {Math.round(scrollProgress)}% • {filteredReplies.length} رد
      </div>
    </div>
  );
} 