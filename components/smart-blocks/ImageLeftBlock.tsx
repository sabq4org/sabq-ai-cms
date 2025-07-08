import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { Calendar, Eye, Tag } from 'lucide-react';

'use client';







interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  publishedAt: string;
  views?: number;
}

interface ImageLeftBlockProps {
  block: {
    id: string;
    name: string;
    theme: {
      primaryColor: string;
      backgroundColor: string;
      textColor: string;
    };
  };
  articles: Article[];
}

export const ImageLeftBlock: React.FC<ImageLeftBlockProps> = ({ block, articles }) => {
  return (
    <div className="w-full">
      {/* عنوان البلوك */}
      <div className="mb-6 flex items-center gap-3">
        <h2 
          className="text-2xl font-bold"
          style={{ color: block.theme.textColor }}
        >
          {block.name}
        </h2>
        <div 
          className="flex-1 h-0.5 rounded-full"
          style={{ backgroundColor: `${block.theme.primaryColor}30` }}
        />
      </div>

      {/* قائمة المقالات */}
      <div className="space-y-4">
        {articles.map((article) => (
          <Link 
            key={article.id}
            href={`/news/${article.slug}`}
            className="group block"
          >
            <div 
              className="flex gap-4 p-4 rounded-xl hover:shadow-lg transition-all duration-300"
              style={{ 
                backgroundColor: block.theme.backgroundColor,
                borderColor: `${block.theme.primaryColor}20`,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              {/* الصورة على اليسار */}
              {article.imageUrl && (
                <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
                  <Image src={undefined} alt="" width={100} height={100} /> {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* المحتوى على اليمين */}
              <div className="flex-1 flex flex-col justify-between">
                {/* العنوان والملخص */}
                <div>
                  <h3 
                    className="font-bold text-lg mb-1 line-clamp-2 group-hover:underline"
                    style={{ color: block.theme.textColor }}
                  >
                    {article.title}
                  </h3>
                  
                  {article.excerpt && (
                    <p 
                      className="text-sm line-clamp-2 opacity-80"
                      style={{ color: block.theme.textColor }}
                    >
                      {article.excerpt}
                    </p>
                  )}
                </div>

                {/* معلومات إضافية */}
                <div className="flex items-center gap-4 mt-2 text-xs">
                  {/* التصنيف */}
                  {article.category && (
                    <div 
                      className="flex items-center gap-1"
                      style={{ color: block.theme.primaryColor }}
                    >
                      <Tag className="w-3 h-3" />
                      <span className="font-medium">{article.category}</span>
                    </div>
                  )}

                  {/* التاريخ */}
                  <div 
                    className="flex items-center gap-1 opacity-60"
                    style={{ color: block.theme.textColor }}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(article.publishedAt).toLocaleDateString('ar-SA')}</span>
                  </div>

                  {/* المشاهدات */}
                  {article.views && (
                    <div 
                      className="flex items-center gap-1 opacity-60"
                      style={{ color: block.theme.textColor }}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{article.views.toLocaleString('ar-SA')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}; 