'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Search, Smile, Heart, ThumbsUp, Star, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  editor: Editor;
}

export function EmojiPicker({ editor }: EmojiPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('smileys');

  // فئات الرموز التعبيرية
  const emojiCategories = {
    smileys: {
      name: 'وجوه وابتسامات',
      icon: <Smile className="h-4 w-4" />,
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
        '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
        '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
        '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
        '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'
      ]
    },
    hearts: {
      name: 'قلوب ومشاعر',
      icon: <Heart className="h-4 w-4" />,
      emojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
        '💋', '💌', '💐', '🌹', '🌷', '🌺', '🌸', '🌼', '🌻', '💐'
      ]
    },
    gestures: {
      name: 'إيماءات وأيدي',
      icon: <ThumbsUp className="h-4 w-4" />,
      emojis: [
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
        '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '💪',
        '🦾', '🖕', '✍️', '🙏', '🦶', '🦵', '👂', '👃', '🧠', '🦷'
      ]
    },
    symbols: {
      name: 'رموز ونجوم',
      icon: <Star className="h-4 w-4" />,
      emojis: [
        '⭐', '🌟', '💫', '✨', '🌠', '☀️', '🌙', '🌛', '🌜', '🌚',
        '🌝', '🌞', '⚡', '🔥', '💥', '☄️', '🌈', '☁️', '⛅', '🌤️',
        '⛈️', '🌦️', '🌧️', '⛆', '❄️', '☃️', '⛄', '🌨️', '💨', '🌪️'
      ]
    },
    objects: {
      name: 'أشياء ورموز',
      icon: <Sun className="h-4 w-4" />,
      emojis: [
        '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍭', '🍬',
        '🍫', '🍩', '🍪', '🎯', '🎮', '🎲', '🎸', '🎵', '🎶', '🎤',
        '🎧', '📱', '💻', '⌨️', '🖥️', '🖨️', '📷', '📹', '🎬', '📺'
      ]
    },
    flags: {
      name: 'أعلام ودول',
      icon: <Moon className="h-4 w-4" />,
      emojis: [
        '🇸🇦', '🇦🇪', '🇪🇬', '🇯🇴', '🇱🇧', '🇸🇾', '🇮🇶', '🇰🇼',
        '🇶🇦', '🇧🇭', '🇴🇲', '🇾🇪', '🇵🇸', '🇲🇦', '🇹🇳', '🇩🇿',
        '🇱🇾', '🇸🇩', '🇸🇴', '🇩🇯', '🇰🇲', '🇲🇷', '🇹🇩', '🇺🇸',
        '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇷🇺', '🇨🇳', '🇯🇵'
      ]
    }
  };

  // البحث في الرموز التعبيرية
  const searchEmojis = () => {
    if (!searchTerm) return [];
    
    const allEmojis = Object.values(emojiCategories).flatMap(cat => cat.emojis);
    return allEmojis.filter(emoji => {
      // يمكن إضافة منطق بحث أكثر تطوراً هنا
      return true;
    });
  };

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
  };

  const displayEmojis = searchTerm ? searchEmojis() : emojiCategories[activeCategory as keyof typeof emojiCategories].emojis;

  return (
    <div className="w-80 p-3">
      {/* شريط البحث */}
      <div className="relative mb-3">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث عن رمز تعبيري..."
          className="w-full pr-10 pl-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* فئات الرموز */}
      {!searchTerm && (
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {Object.entries(emojiCategories).map(([key, category]) => (
            <button
              key={key}
              className={cn(
                'flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap',
                activeCategory === key
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
              onClick={() => setActiveCategory(key)}
              title={category.name}
            >
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* شبكة الرموز التعبيرية */}
      <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
        {displayEmojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            onClick={() => insertEmoji(emoji)}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* رموز تعبيرية مستخدمة مؤخراً */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          مستخدمة مؤخراً
        </div>
        <div className="flex gap-1">
          {['😀', '❤️', '👍', '🎉', '🔥', '💯', '✨', '🌟'].map((emoji, index) => (
            <button
              key={`recent-${emoji}-${index}`}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              onClick={() => insertEmoji(emoji)}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* رموز تعبيرية مخصصة */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          رموز سريعة
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <button
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            onClick={() => insertEmoji('👏')}
          >
            👏 تصفيق
          </button>
          <button
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            onClick={() => insertEmoji('🤝')}
          >
            🤝 اتفاق
          </button>
          <button
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            onClick={() => insertEmoji('💪')}
          >
            💪 قوة
          </button>
          <button
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            onClick={() => insertEmoji('🙏')}
          >
            🙏 شكر
          </button>
        </div>
      </div>
    </div>
  );
}

