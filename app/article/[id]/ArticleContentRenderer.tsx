'use client';

import React from 'react';

interface ArticleContentRendererProps {
  content: string;
}

export default function ArticleContentRenderer({ content }: ArticleContentRendererProps) {
  const renderArticleContent = (content: string) => {
    try {
      if (!content) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">لا يوجد محتوى لعرضه</p>
          </div>
        );
      }
      
      // محاولة تحليل المحتوى كـ JSON blocks
      try {
        const blocks = JSON.parse(content);
        
        if (Array.isArray(blocks)) {
          return (
            <div className="space-y-8 arabic-text">
              {blocks.map((block: any, index: number) => {
                if (!block || typeof block !== 'object') return null;
                
                const blockType = block.type;
                const blockData = block.data?.[blockType] || block.data || {};
                
                switch (blockType) {
                  case 'paragraph':
                    const paragraphText = blockData.text || block.text || block.content || '';
                    if (!paragraphText) return null;
                    return (
                      <p key={block.id || index} className="text-lg leading-loose text-gray-800 dark:text-gray-200 mb-6">
                        {paragraphText}
                      </p>
                    );
                  
                  case 'heading':
                    const headingText = blockData.text || block.text || '';
                    const level = blockData.level || 2;
                    const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                    const headingClasses = {
                      1: 'text-4xl font-bold mt-12 mb-6 text-gray-900 dark:text-white',
                      2: 'text-3xl font-bold mt-10 mb-5 text-gray-900 dark:text-white',
                      3: 'text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white',
                      4: 'text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white',
                      5: 'text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white',
                      6: 'text-base font-bold mt-3 mb-2 text-gray-900 dark:text-white'
                    };
                    
                    if (!headingText) return null;
                    return (
                      <HeadingTag 
                        key={block.id || index} 
                        className={headingClasses[level as keyof typeof headingClasses]}
                      >
                        {headingText}
                      </HeadingTag>
                    );
                  
                  case 'list':
                    const items = blockData.items || block.items || [];
                    const listStyle = blockData.style || 'unordered';
                    
                    if (!items.length) return null;
                    
                    const ListTag = listStyle === 'ordered' ? 'ol' : 'ul';
                    const listClass = listStyle === 'ordered' 
                      ? 'list-decimal list-inside space-y-3 text-gray-800 dark:text-gray-200 pr-4' 
                      : 'list-disc list-inside space-y-3 text-gray-800 dark:text-gray-200 pr-4';
                    
                    return (
                      <ListTag key={block.id || index} className={listClass}>
                        {items.map((item: string, i: number) => (
                          <li key={i} className="text-lg leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ListTag>
                    );
                  
                  case 'quote':
                    const quoteText = blockData.text || block.text || '';
                    const quoteAuthor = blockData.caption || blockData.author || block.caption || '';
                    
                    if (!quoteText) return null;
                    return (
                      <div key={block.id || index} className="my-8">
                        <blockquote className="border-r-4 border-blue-500 pr-6 py-6 bg-gradient-to-l from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-lg">
                          <p className="text-xl italic text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
                            "{quoteText}"
                          </p>
                          {quoteAuthor && (
                            <cite className="text-base text-gray-600 dark:text-gray-400 not-italic font-medium">
                              — {quoteAuthor}
                            </cite>
                          )}
                        </blockquote>
                      </div>
                    );
                  
                  case 'image':
                    const imageUrl = blockData.file?.url || blockData.url || block.url || '';
                    const imageCaption = blockData.caption || block.caption || '';
                    const imageAlt = blockData.alt || block.alt || imageCaption || 'صورة';
                    
                    if (!imageUrl) return null;
                    return (
                      <figure key={block.id || index} className="my-10">
                        <div className="overflow-hidden rounded-3xl shadow-2xl group">
                          <img
                            src={imageUrl}
                            alt={imageAlt}
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        {imageCaption && (
                          <figcaption className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4 italic">
                            {imageCaption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  
                  case 'divider':
                    return (
                      <hr key={block.id || index} className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
                    );
                  
                  case 'code':
                    const codeText = blockData.code || block.code || '';
                    if (!codeText) return null;
                    return (
                      <pre key={block.id || index} className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto my-8">
                        <code className="text-sm leading-relaxed">{codeText}</code>
                      </pre>
                    );
                  
                  default:
                    // أي نوع block آخر غير معروف
                    if (block.content || block.text) {
                      return (
                        <div key={block.id || index} className="my-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300">
                            {block.content || block.text}
                          </p>
                        </div>
                      );
                    }
                    return null;
                }
              })}
            </div>
          );
        }
      } catch (e) {
        // المحتوى ليس JSON blocks، معالجة النص العادي
      }
      
      // معالجة المحتوى النصي العادي
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
      
      if (paragraphs.length > 0) {
        return (
          <div className="space-y-8 arabic-text">
            {paragraphs.map((paragraph, index) => {
              const trimmedParagraph = paragraph.trim();
              
              // تحديد ما إذا كان عنواناً
              if (trimmedParagraph.startsWith('#')) {
                const level = (trimmedParagraph.match(/^#+/) || [''])[0].length;
                const text = trimmedParagraph.replace(/^#+\s*/, '');
                const HeadingTag = `h${Math.min(level, 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                
                return (
                  <HeadingTag 
                    key={index} 
                    className="text-2xl font-bold mt-10 mb-5 text-gray-900 dark:text-white"
                  >
                    {text}
                  </HeadingTag>
                );
              }
              
              // فقرة عادية
              return (
                <p key={index} className="text-lg leading-loose text-gray-800 dark:text-gray-200 mb-6">
                  {trimmedParagraph}
                </p>
              );
            })}
          </div>
        );
      }
      
      // عرض المحتوى كـ HTML كخيار أخير
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
          className="prose prose-lg max-w-none dark:prose-invert arabic-text
                     prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                     prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:leading-loose prose-p:text-lg
                     prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:pr-6
                     prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
                     prose-ul:list-disc prose-ol:list-decimal prose-li:text-lg prose-li:leading-relaxed
                     prose-img:rounded-2xl prose-img:shadow-lg prose-img:w-full
                     prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                     prose-strong:text-gray-900 dark:prose-strong:text-gray-100"
        />
      );
    } catch (error) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">خطأ في عرض المحتوى</p>
        </div>
      );
    }
  };

  return (
    <div className="article-content">
      {renderArticleContent(content)}
    </div>
  );
}
