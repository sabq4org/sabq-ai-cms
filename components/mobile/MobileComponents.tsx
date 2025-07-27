/**
 * 📱 مكونات محسنة للهواتف الذكية
 * مصممة خصيصًا للتفاعل باللمس والاستخدام بالإبهام
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ChevronRight, 
  Search, 
  Filter, 
  MoreVertical,
  Heart,
  Share2,
  Bookmark,
  Eye,
  MessageCircle,
  Clock,
  User,
  Calendar,
  Tag,
  TrendingUp,
  X,
  ChevronDown,
  Check
} from 'lucide-react';

// زر محسن للهاتف مع منطقة لمس كبيرة
interface MobileButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function MobileButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  onClick,
  disabled = false,
  className = ''
}: MobileButtonProps) {
  const baseClasses = "flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-95 touch-manipulation";
  
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white shadow-lg",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg"
  };

  const sizeClasses = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
}

// بطاقة مقال محسنة للهاتف
interface MobileArticleCardProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    image?: string;
    author: string;
    publishedAt: string;
    category: string;
    views: number;
    likes: number;
    comments: number;
    readingTime: number;
  };
  onRead?: (id: string) => void;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  onBookmark?: (id: string) => void;
}

export function MobileArticleCard({ 
  article, 
  onRead, 
  onLike, 
  onShare, 
  onBookmark 
}: MobileArticleCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(article.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(article.id);
  };

  return (
    <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      {/* صورة المقال */}
      {article.image && (
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-blue-500 text-white">
              {article.category}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-4">
        {/* عنوان المقال */}
        <h3 
          className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2 cursor-pointer"
          onClick={() => onRead?.(article.id)}
        >
          {article.title}
        </h3>

        {/* ملخص المقال */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {article.excerpt}
        </p>

        {/* معلومات المقال */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{article.readingTime} دقائق</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{article.publishedAt}</span>
          </div>
        </div>

        {/* إحصائيات وأزرار التفاعل */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{article.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{article.comments}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`w-8 h-8 p-0 rounded-full ${
                isLiked ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`w-8 h-8 p-0 rounded-full ${
                isBookmarked ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(article.id)}
              className="w-8 h-8 p-0 rounded-full text-gray-400"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* زر القراءة */}
        <MobileButton
          fullWidth
          className="mt-4"
          onClick={() => onRead?.(article.id)}
        >
          اقرأ المقال
          <ChevronRight className="w-4 h-4 mr-2" />
        </MobileButton>
      </CardContent>
    </Card>
  );
}

// شريط بحث محسن للهاتف
interface MobileSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  showFilter?: boolean;
}

export function MobileSearchBar({ 
  placeholder = "البحث في المقالات...", 
  onSearch, 
  onFilter,
  showFilter = true 
}: MobileSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    onSearch?.(query);
  };

  return (
    <div className={`relative transition-all duration-300 ${
      isFocused ? 'transform scale-102' : ''
    }`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="h-12 pl-12 pr-4 rounded-xl border-2 text-base"
            dir="rtl"
          />
          <Search 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
          />
        </div>

        {showFilter && (
          <Button
            variant="outline"
            onClick={onFilter}
            className="w-12 h-12 p-0 rounded-xl border-2"
          >
            <Filter className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* اقتراحات البحث (يمكن إضافتها لاحقاً) */}
      {isFocused && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border z-50">
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              جاري البحث عن: "{query}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// قائمة منسدلة محسنة للهاتف
interface MobileDropdownProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
    action?: () => void;
  }>;
  onSelect?: (value: string) => void;
}

export function MobileDropdown({ trigger, items, onSelect }: MobileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    item.action?.();
    onSelect?.(item.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border z-50 min-w-48">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl transition-colors"
              >
                {item.icon && <span>{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// مكون سحب للتحديث
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setIsPulling(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* مؤشر التحديث */}
      <div className={`absolute top-0 left-0 right-0 flex justify-center transition-all duration-300 ${
        isPulling || isRefreshing ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-blue-500 text-white px-4 py-2 rounded-b-lg shadow-lg">
          {isRefreshing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>جاري التحديث...</span>
            </div>
          ) : (
            <span>اسحب للتحديث</span>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

export default {
  MobileButton,
  MobileArticleCard,
  MobileSearchBar,
  MobileDropdown,
  PullToRefresh
};
