"use client";

import { useState } from "react";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { Calendar, Clock, User, Eye } from "lucide-react";
import Link from "next/link";

interface SimpleArticleClientProps {
  article: any;
}

export default function SimpleArticleClient({ article }: SimpleArticleClientProps) {
  const { darkMode } = useDarkModeContext();
  const [imageError, setImageError] = useState(false);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            المقال غير موجود
          </h1>
          <Link href="/" className="text-blue-600 hover:underline">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* العنوان */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {article.title}
        </h1>
        
        {/* معلومات المقال */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
          {article.author && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author.name}</span>
            </div>
          )}
          
          {article.published_at && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.published_at).toLocaleDateString('ar-SA')}</span>
            </div>
          )}
          
          {article.reading_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.reading_time} دقيقة</span>
            </div>
          )}
          
          {article.views && (
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{article.views} مشاهدة</span>
            </div>
          )}
        </div>
      </header>

      {/* الصورة المميزة */}
      {article.featured_image && !imageError && (
        <div className="mb-8">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {/* شرح الصورة */}
          {article.image_caption && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center italic">
              {article.image_caption}
            </p>
          )}
        </div>
      )}

      {/* الموجز الذكي - تصميم مميز */}
      {(article.ai_summary || article.summary || article.excerpt) && (
        <div className="mb-8 relative">
          <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <div className="pr-6 pl-6 py-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🤖</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                الموجز الذكي
              </h3>
              <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full">
                AI
              </span>
            </div>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {article.ai_summary || article.summary || article.excerpt}
            </p>
          </div>
        </div>
      )}

      {/* المحتوى */}
      <div 
        className="prose prose-lg max-w-none dark:prose-invert"
        style={{ 
          color: darkMode ? '#e5e7eb' : '#374151',
          lineHeight: '1.8'
        }}
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      {/* التصنيف والكلمات المفتاحية */}
      {(article.category || article.tags) && (
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          {article.category && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {article.category.name || article.category}
              </span>
            </div>
          )}
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </footer>
      )}
    </article>
  );
}
