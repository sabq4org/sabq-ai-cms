'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, User, Clock, Zap, Star } from 'lucide-react';
import { formatRelativeDate } from '@/lib/date-utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  featured_image?: string;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
  views?: number;
  reading_time?: number;
  published_at?: string;
  created_at: string;
  featured?: boolean;
  breaking?: boolean;
}

interface MobileNewsCardProps {
  article: Article;
  darkMode?: boolean;
}

export default function MobileNewsCard({ article, darkMode = false }: MobileNewsCardProps) {
  const {
    title,
    slug,
    excerpt,
    summary,
    featured_image,
    author,
    category,
    views = 0,
    reading_time = 5,
    published_at,
    created_at,
    featured = false,
    breaking = false
  } = article;

  const displayDate = published_at || created_at;
  const displayExcerpt = excerpt || summary || '';

  return (
    <Link 
      href={`/article/${slug}`}
      className={`block w-full mb-3 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border ${
        darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="p-4">
        {/* الشارات العاجلة والمميزة */}
        {(breaking || featured) && (
          <div className="flex gap-2 mb-2">
            {breaking && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
                <Zap className="w-3 h-3" />
                عاجل
              </span>
            )}
            {featured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-yellow-500 text-white">
                <Star className="w-3 h-3" />
                مميز
              </span>
            )}
          </div>
        )}

        {/* العنوان والمحتوى */}
        <div className="flex gap-3">
          {/* الصورة المصغرة */}
          {featured_image && (
            <div className="flex-shrink-0">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <Image
                  src={featured_image}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="80px"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* المحتوى النصي */}
          <div className="flex-1 min-w-0">
            {/* التصنيف */}
            {category && (
              <span 
                className="inline-block text-xs font-medium px-2 py-1 rounded-full mb-1"
                style={{
                  backgroundColor: category.color ? `${category.color}20` : '#3B82F620',
                  color: category.color || '#3B82F6'
                }}
              >
                {category.name}
              </span>
            )}

            {/* العنوان */}
            <h3 className={`font-bold text-sm line-clamp-2 mb-1 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h3>

            {/* المقتطف */}
            {displayExcerpt && (
              <p className={`text-xs line-clamp-2 mb-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {displayExcerpt}
              </p>
            )}

            {/* المعلومات السفلية */}
            <div className="flex items-center gap-3 text-xs">
              {/* الكاتب */}
              {author && (
                <div className={`flex items-center gap-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[100px]">{author.name}</span>
                </div>
              )}

              {/* التاريخ */}
              <div className={`flex items-center gap-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{formatRelativeDate(displayDate)}</span>
              </div>

              {/* المشاهدات */}
              <div className={`flex items-center gap-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <Eye className="w-3 h-3" />
                <span>{views}</span>
              </div>

              {/* وقت القراءة */}
              <div className={`flex items-center gap-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <Clock className="w-3 h-3" />
                <span>{reading_time} د</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
