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
        </div>
      )}

      {/* الملخص */}
      {article.excerpt && (
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {article.excerpt}
          </p>
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
