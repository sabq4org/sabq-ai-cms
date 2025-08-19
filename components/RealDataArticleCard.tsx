'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Eye, Heart, Share2, Image as ImageIcon } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  featured_image?: string;
  views?: number;
  likes?: number;
  shares?: number;
  published_at?: Date | string;
  author?: {
    name: string;
  };
}

interface RealDataArticleCardProps {
  article: Article;
}

export function RealDataArticleCard({ article }: RealDataArticleCardProps) {
  // التحقق من صحة الصورة
  const hasValidImage = article.featured_image && 
    !article.featured_image.includes('placeholder') &&
    !article.featured_image.includes('faker') &&
    !article.featured_image.includes('unsplash.com') &&
    !article.featured_image.includes('lorempixel');

  const publishedDate = article.published_at ? 
    new Date(article.published_at).toLocaleDateString('ar') : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* عرض الصورة فقط إذا كانت حقيقية */}
      {hasValidImage ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      
      <div className="p-6">
        <Link href={`/news/${article.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
        </Link>
        
        {article.excerpt && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* عرض المشاهدات الحقيقية فقط */}
            {(article.views ?? 0) > 0 && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Eye className="w-4 h-4" />
                <span>{article.views}</span>
              </div>
            )}
            
            {/* عرض الإعجابات الحقيقية فقط */}
            {(article.likes ?? 0) > 0 && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Heart className="w-4 h-4" />
                <span>{article.likes}</span>
              </div>
            )}
            
            {/* عرض المشاركات الحقيقية فقط */}
            {(article.shares ?? 0) > 0 && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Share2 className="w-4 h-4" />
                <span>{article.shares}</span>
              </div>
            )}
          </div>
          
          {publishedDate && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Calendar className="w-4 h-4" />
              <span>{publishedDate}</span>
            </div>
          )}
        </div>
        
        {article.author?.name && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              بواسطة: {article.author.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RealDataArticleCard;