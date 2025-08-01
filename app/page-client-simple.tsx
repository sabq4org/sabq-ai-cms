'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import PageWrapper from '@/components/PageWrapper';
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { getSmartArticleLink } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  published_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    name: string;
    avatar?: string;
  };
  image?: string;
  stats?: {
    views: number;
    likes: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface PageClientProps {
  initialArticles?: Article[];
  initialCategories?: Category[];
}

export default function PageClient({ 
  initialArticles = [], 
  initialCategories = []
}: PageClientProps) {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  return (
    <PageWrapper
      pageName="home"
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Articles Section */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              أحدث الأخبار
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      <Link 
                        href={getSmartArticleLink(article)}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    
                    {article.excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {article.excerpt}
                      </p>
                    )}
                    
                    {article.category && (
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                        {article.category.name}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    لا توجد مقالات متاحة حالياً
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                التصنيفات
              </h3>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </PageWrapper>
  );
}
