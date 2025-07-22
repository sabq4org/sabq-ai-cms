'use client';

import React from 'react';
import Link from 'next/link';
import { User, Calendar, Clock, Eye, ChevronRight } from 'lucide-react';
import { formatDateGregorian, formatTimeOnly } from '@/lib/date-utils';

interface AuthorData {
  id?: string;
  name: string;
  avatar?: string;
  bio?: string;
}

interface AuthorInfoProps {
  author: AuthorData;
  publishedDate: string;
  readingTime: number;
  views: number;
  className?: string;
}

export default function AuthorInfo({ 
  author, 
  publishedDate, 
  readingTime, 
  views,
  className = "" 
}: AuthorInfoProps) {
  const formatDate = (dateString: string) => {
    // استخدام النظام الموحد للتاريخ الميلادي العربي
    return formatDateGregorian(dateString);
  };

  const formatTime = (dateString: string) => {
    // استخدام النظام الموحد لتنسيق الوقت
    return formatTimeOnly(dateString);
  };

  return (
    <div className={`flex items-center justify-between flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      <div className="flex items-center gap-6 flex-wrap">
        {/* معلومات المؤلف */}
        <div className="flex items-center gap-3">
          {author.avatar ? (
            <img 
              src={author.avatar} 
              alt={author.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white text-base">
              {author.name}
            </span>
            {author.id && (
              <Link 
                href={`/author/${author.id}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs flex items-center gap-1 transition-colors"
              >
                عرض الملف الشخصي
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* التاريخ والوقت */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(publishedDate)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(publishedDate)}
            </span>
          </div>
        </div>

        {/* وقت القراءة */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {readingTime} دقائق
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              وقت القراءة
            </span>
          </div>
        </div>
      </div>

      {/* المشاهدات */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white">
            {views.toLocaleString('ar-SA')}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            مشاهدة
          </span>
        </div>
      </div>
    </div>
  );
}
