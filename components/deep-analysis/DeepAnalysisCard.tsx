'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import Link from 'next/link';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import AnalysisTypeIcon from './AnalysisTypeIcon';

import {
  Brain,
  Clock,
  Eye,
  BarChart3,
  Sparkles,
  Bookmark,
  Heart,
  Share2,
  Calendar,
  ArrowUpRight,
  ExternalLink,
  Plus,
  ChevronRight
} from 'lucide-react';

interface DeepAnalysisCardProps {
  analysis: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    categories: string[];
    tags: string[];
    authorName: string;
    sourceType: string;
    analysisType?: 'manual' | 'ai' | 'mixed';
    readingTime: number;
    views: number;
    likes: number;
    qualityScore: number;
    status: string;
    createdAt: string;
    publishedAt?: string;
    featuredImage?: string;
  };
  viewMode?: 'grid' | 'list';
}

export default function DeepAnalysisCard({ analysis, viewMode = 'grid' }: DeepAnalysisCardProps) {
  const { darkMode } = useDarkModeContext();
  const [showAllTags, setShowAllTags] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      calendar: 'gregory',
      numberingSystem: 'latn'
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-emerald-600';
    if (score >= 60) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  const generatePlaceholderImage = (title: string) => {
    const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B'];
    const colorIndex = title.charCodeAt(0) % colors.length;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[colorIndex]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[(colorIndex + 1) % colors.length]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <g opacity="0.2">
          <circle cx="100" cy="100" r="40" fill="white"/>
          <circle cx="300" cy="200" r="60" fill="white"/>
          <circle cx="200" cy="250" r="30" fill="white"/>
        </g>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
          ${title.substring(0, 20)}
        </text>
      </svg>
    `)}`;
  };

  const handleInteraction = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`${action} clicked for analysis ${analysis.id}`);
  };

  // تحديد الرابط الصحيح بالاعتماد على id فقط لضمان توافقه مع مسار الـ API
  const analysisUrl = `/insights/deep/${analysis.id}`;

  // الوسوم المرئية (4 كحد أقصى)
  const visibleTags = showAllTags ? analysis.tags : analysis.tags.slice(0, 4);
  const remainingTags = analysis.tags.length - 4;

  return (
    <div className={`
      relative overflow-hidden rounded-2xl transition-all duration-300 group
      ${darkMode 
        ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30' 
        : 'bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200'
      } 
      ${viewMode === 'list' ? 'flex' : ''}
      hover:transform hover:scale-[1.02]
    `}>
      {/* صورة مميزة محسنة */}
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-72 flex-shrink-0' : 'h-48'}`}>
        <Link href={analysisUrl} className="block w-full h-full">
          <Image 
            src={analysis.featuredImage || generatePlaceholderImage(analysis.title)} 
            alt={analysis.title}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        
        {/* تدرج علوي */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />
        
        {/* شارة التحليل العميق - محسنة */}
        <div className="absolute top-3 right-3">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
            <Brain className="w-3.5 h-3.5" />
            <span>تحليل عميق</span>
          </div>
        </div>

        {/* نسبة الجودة - محسنة */}
        <div className="absolute bottom-3 left-3">
          <div className={`
            bg-gradient-to-r ${getQualityColor(analysis.qualityScore)}
            text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm
          `}>
            <BarChart3 className="w-3.5 h-3.5" />
            {analysis.qualityScore}%
          </div>
        </div>

        {/* أيقونة عرض سريع - محسنة */}
        <Link 
          href={analysisUrl}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-sm"
        >
          <div className="bg-white/90 text-gray-800 p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* محتوى البطاقة - محسن */}
      <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''} flex flex-col`}>
        {/* التصنيفات - محسنة */}
        <div className="flex flex-wrap gap-2 mb-4">
          {analysis.categories.slice(0, 2).map((category, index) => (
            <span 
              key={index}
              className={`
                text-xs px-3 py-1.5 rounded-full font-medium transition-colors
                ${darkMode 
                  ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50' 
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }
              `}
            >
              {typeof category === 'string' ? category : ((category as any).name_ar || (category as any).name || 'عام')}
            </span>
          ))}
        </div>

        {/* العنوان - محسن */}
        <Link href={analysisUrl}>
          <h3 className={`
            text-lg font-bold line-clamp-2 mb-3 transition-colors cursor-pointer
            ${darkMode ? 'text-white hover:text-purple-400' : 'text-gray-900 hover:text-purple-600'}
          `}
          title={analysis.title}
          >
            {analysis.title}
          </h3>
        </Link>

        {/* الملخص - محسن */}
        <p className={`
          text-sm line-clamp-2 mb-4 flex-grow leading-relaxed
          ${darkMode ? 'text-gray-300' : 'text-gray-600'}
        `}
        title={analysis.summary}
        >
          {analysis.summary}
        </p>

        {/* الوسوم - تصميم جديد */}
        {analysis.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {visibleTags.map((tag, index) => (
              <span 
                key={index}
                className={`
                  text-xs px-2 py-1 rounded-md font-medium
                  ${darkMode 
                    ? 'bg-gray-700/50 text-gray-400' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                #{tag}
              </span>
            ))}
            {remainingTags > 0 && !showAllTags && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowAllTags(true);
                }}
                className={`
                  text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors
                  ${darkMode 
                    ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' 
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }
                `}
              >
                <Plus className="w-3 h-3" />
                {remainingTags} المزيد
              </button>
            )}
          </div>
        )}

        {/* معلومات أسفل البطاقة - محسنة */}
        <div className={`
          flex items-center justify-between text-xs pt-4 border-t
          ${darkMode ? 'border-gray-700/50 text-gray-400' : 'border-gray-100 text-gray-500'}
        `}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 opacity-60" />
                              <span>{new Date(analysis.publishedAt || analysis.createdAt).toLocaleDateString('ar-SA', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric',
                  calendar: 'gregory',
                  numberingSystem: 'latn'
                })}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 opacity-60" />
              {analysis.readingTime} د
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 opacity-60" />
              <span>{analysis.views > 999 ? `${(analysis.views / 1000).toFixed(1)}k` : analysis.views}</span>
            </span>
            {analysis.likes > 0 && (
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 opacity-60" />
                {analysis.likes}
              </span>
            )}
          </div>
        </div>

        {/* زر عرض مختصر - تصميم جديد */}
        <Link 
          href={analysisUrl}
          className={`
            absolute bottom-4 left-4 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100
            ${darkMode 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-purple-600 hover:bg-purple-700 text-white'
            }
            shadow-lg hover:shadow-xl transform hover:scale-110
          `}
          title="عرض التحليل الكامل"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}