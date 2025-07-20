'use client';

import React, { useState } from 'react';
import { 
  Heart, Share2, MessageSquare, Bookmark, 
  Copy, Check, Facebook, Send, MessageCircle 
} from 'lucide-react';

interface InteractionBarProps {
  liked: boolean;
  saved: boolean;
  stats: {
    likes: number;
    shares: number;
    comments: number;
  };
  onLike: () => void;
  onSave: () => void;
  onShare: (platform: string) => void;
  onComment: () => void;
  isLoggedIn: boolean;
}

export default function InteractionBar({
  liked,
  saved,
  stats,
  onLike,
  onSave,
  onShare,
  onComment,
  isLoggedIn
}: InteractionBarProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
    onShare(platform);
    setShowShareMenu(false);
  };

  const handleInteraction = (action: () => void) => {
    if (!isLoggedIn) {
      alert('يجب تسجيل الدخول للتفاعل مع المقالات');
      return;
    }
    action();
  };

  return (
    <div className="sticky bottom-6 z-40">
      {/* شريط التفاعل العائم */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-3 mx-auto w-fit">
        <div className="flex items-center gap-2">
          {/* زر الإعجاب */}
          <button
            onClick={() => handleInteraction(onLike)}
            className={`interaction-button flex items-center gap-2 px-4 py-3 rounded-full font-medium transition-all duration-300 text-sm ${
              liked
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 liked shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
            }`}
            title={liked ? 'إلغاء الإعجاب' : 'أعجبني'}
          >
            <Heart className={`w-5 h-5 transition-all duration-300 ${liked ? 'fill-current scale-110' : ''}`} />
            <span className="font-semibold">
              {stats.likes > 0 ? stats.likes.toLocaleString('ar-SA') : 'إعجاب'}
            </span>
          </button>

          {/* زر المشاركة */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="interaction-button flex items-center gap-2 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300 text-sm hover:shadow-md"
              title="مشاركة المقال"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-semibold">
                {stats.shares > 0 ? stats.shares.toLocaleString('ar-SA') : 'مشاركة'}
              </span>
            </button>
            
            {/* قائمة المشاركة المحسنة */}
            {showShareMenu && (
              <>
                {/* خلفية شفافة لإغلاق القائمة */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowShareMenu(false)}
                ></div>
                
                <div className="share-menu absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 min-w-[240px] z-20">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm transition-all duration-200 hover:scale-105"
                    >
                      <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold">𝕏</span>
                      </div>
                      <span className="font-medium">تويتر</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm transition-all duration-200 hover:scale-105"
                    >
                      <div className="w-8 h-8 bg-[#25D366] text-white rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="font-medium">واتساب</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm transition-all duration-200 hover:scale-105"
                    >
                      <div className="w-8 h-8 bg-[#1877F2] text-white rounded-lg flex items-center justify-center">
                        <Facebook className="w-4 h-4" />
                      </div>
                      <span className="font-medium">فيسبوك</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare('telegram')}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm transition-all duration-200 hover:scale-105"
                    >
                      <div className="w-8 h-8 bg-[#0088CC] text-white rounded-lg flex items-center justify-center">
                        <Send className="w-4 h-4" />
                      </div>
                      <span className="font-medium">تيليجرام</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm transition-all duration-200"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      copySuccess ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {copySuccess ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-medium">
                      {copySuccess ? 'تم النسخ!' : 'نسخ الرابط'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* زر التعليقات */}
          <button
            onClick={onComment}
            className="interaction-button flex items-center gap-2 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300 text-sm hover:shadow-md"
            title="عرض التعليقات"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">
              {stats.comments > 0 ? stats.comments.toLocaleString('ar-SA') : 'تعليق'}
            </span>
          </button>

          {/* زر الحفظ */}
          <button
            onClick={() => handleInteraction(onSave)}
            className={`interaction-button flex items-center gap-2 px-4 py-3 rounded-full font-medium transition-all duration-300 text-sm ${
              saved
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
            }`}
            title={saved ? 'إلغاء الحفظ' : 'حفظ المقال'}
          >
            <Bookmark className={`w-5 h-5 transition-all duration-300 ${saved ? 'fill-current scale-110' : ''}`} />
            <span className="font-semibold">{saved ? 'محفوظ' : 'حفظ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
