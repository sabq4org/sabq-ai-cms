'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, ThumbsUp, Share2, Bookmark, 
  ChevronDown, ChevronUp, BarChart, Image as ImageIcon,
  FileText, Quote, List, Sparkles, Brain,
  PlayCircle, Volume2, Eye, Clock
} from 'lucide-react';
import Image from 'next/image';

interface ArticleBlock {
  id: string;
  type: 'intro' | 'paragraph' | 'image' | 'video' | 'poll' | 'quote' | 'list' | 'summary' | 'ai-insight';
  content?: string;
  metadata?: {
    imageUrl?: string;
    imageAlt?: string;
    videoUrl?: string;
    author?: string;
    source?: string;
    items?: string[];
    pollOptions?: Array<{
      id: string;
      text: string;
      votes: number;
    }>;
    aiGenerated?: boolean;
  };
  interactions?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface InteractiveArticleProps {
  title: string;
  subtitle?: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readingTime: number;
  blocks: ArticleBlock[];
  onBlockInteraction?: (blockId: string, type: 'like' | 'comment' | 'share') => void;
}

export default function InteractiveArticle({ 
  title, 
  subtitle, 
  author, 
  publishedAt, 
  readingTime,
  blocks,
  onBlockInteraction 
}: InteractiveArticleProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [savedBlocks, setSavedBlocks] = useState<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  // تتبع تقدم القراءة
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const handleVote = (blockId: string, optionId: string) => {
    setUserVotes(prev => ({ ...prev, [blockId]: optionId }));
    // هنا يمكن إرسال التصويت إلى الخادم
  };

  const toggleSaveBlock = (blockId: string) => {
    setSavedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const renderBlock = (block: ArticleBlock) => {
    const isExpanded = expandedBlocks.has(block.id);
    const isSaved = savedBlocks.has(block.id);

    switch (block.type) {
      case 'intro':
        return (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
            <p className="text-lg font-medium text-gray-800 leading-relaxed">
              {block.content}
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                مقدمة
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                30 ثانية
              </span>
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="mb-6 group relative">
            <p className="text-gray-700 leading-relaxed text-lg">
              {block.content}
            </p>
            <BlockActions 
              block={block} 
              isSaved={isSaved} 
              onSave={() => toggleSaveBlock(block.id)}
              onInteraction={onBlockInteraction}
            />
          </div>
        );

      case 'image':
        return (
          <div className="mb-8 group relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src={block.metadata?.imageUrl || '/placeholder.jpg'}
                alt={block.metadata?.imageAlt || 'صورة'}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm">{block.metadata?.imageAlt}</p>
              </div>
            </div>
            <BlockActions 
              block={block} 
              isSaved={isSaved} 
              onSave={() => toggleSaveBlock(block.id)}
              onInteraction={onBlockInteraction}
            />
          </div>
        );

      case 'poll':
        const totalVotes = block.metadata?.pollOptions?.reduce((sum, opt) => sum + opt.votes, 0) || 0;
        const userVote = userVotes[block.id];

        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  <BarChart className="inline-block w-5 h-5 mr-2 text-purple-600" />
                  استطلاع رأي
                </h4>
                <p className="text-gray-700">{block.content}</p>
              </div>
              <span className="text-sm text-gray-500">{totalVotes} صوت</span>
            </div>

            <div className="space-y-3">
              {block.metadata?.pollOptions?.map((option) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                const isSelected = userVote === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(block.id, option.id)}
                    className={`w-full text-right p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                    disabled={!!userVote}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{option.text}</span>
                      {userVote && (
                        <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                      )}
                    </div>
                    {userVote && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="border-r-4 border-indigo-500 bg-indigo-50 rounded-xl p-6 mb-8 relative">
            <Quote className="absolute top-4 right-4 w-8 h-8 text-indigo-200" />
            <blockquote className="text-xl font-medium text-gray-800 italic mb-3 pr-8">
              "{block.content}"
            </blockquote>
            {block.metadata?.author && (
              <cite className="text-sm text-gray-600 not-italic">
                — {block.metadata.author}
                {block.metadata.source && ` (${block.metadata.source})`}
              </cite>
            )}
          </div>
        );

      case 'list':
        return (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-gray-600" />
              النقاط الرئيسية
            </h4>
            <ul className="space-y-2">
              {block.metadata?.items?.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'ai-insight':
        return (
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-6 h-6" />
                <h4 className="font-bold text-lg">رؤية الذكاء الاصطناعي</h4>
              </div>
              <p className="leading-relaxed">{block.content}</p>
              <div className="mt-4 flex items-center gap-2 text-sm opacity-80">
                <Sparkles className="w-4 h-4" />
                <span>تم توليد هذا المحتوى بواسطة AI</span>
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 ${
            !isExpanded ? 'cursor-pointer' : ''
          }`} onClick={() => !isExpanded && toggleBlockExpansion(block.id)}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                ملخص المقال
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBlockExpansion(block.id);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            
            <div className={`text-gray-700 transition-all duration-300 ${
              isExpanded ? 'max-h-96' : 'max-h-20 overflow-hidden'
            }`}>
              {block.content}
            </div>
            
            {!isExpanded && (
              <p className="text-sm text-green-600 mt-2">اضغط لقراءة الملخص الكامل</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        {subtitle && (
          <p className="text-xl text-gray-600 mb-6">{subtitle}</p>
        )}
        
        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {author.avatar && (
              <img 
                src={author.avatar} 
                alt={author.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">{author.name}</p>
              <p className="text-sm text-gray-600">{publishedAt}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readingTime} دقائق قراءة
            </span>
            <button 
              onClick={() => setIsListening(!isListening)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                isListening ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              استمع للمقال
            </button>
          </div>
        </div>
      </header>

      {/* Content Blocks */}
      <div className="prose prose-lg max-w-none">
        {blocks.map((block) => (
          <div key={block.id} id={`block-${block.id}`}>
            {renderBlock(block)}
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-8 flex flex-col gap-3">
        <button className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
          <MessageSquare className="w-6 h-6 text-gray-700" />
        </button>
        <button className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
          <Share2 className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </article>
  );
}

// مكون الإجراءات لكل كتلة
function BlockActions({ 
  block, 
  isSaved, 
  onSave, 
  onInteraction 
}: { 
  block: ArticleBlock;
  isSaved: boolean;
  onSave: () => void;
  onInteraction?: (blockId: string, type: 'like' | 'comment' | 'share') => void;
}) {
  return (
    <div className="absolute -left-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
      <button 
        onClick={() => onInteraction?.(block.id, 'like')}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
      >
        <ThumbsUp className="w-4 h-4 text-gray-600" />
      </button>
      <button 
        onClick={onSave}
        className={`w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow ${
          isSaved ? 'text-blue-600' : 'text-gray-600'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
} 