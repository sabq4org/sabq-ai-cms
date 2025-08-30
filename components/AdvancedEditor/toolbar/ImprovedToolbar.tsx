'use client';

import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Table,
  Image, Link, Youtube, Code, Upload,
  Palette, Smile, Undo, Redo, Type,
  Twitter, Facebook, Instagram
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ImprovedToolbarProps {
  editor: Editor;
}

export function ImprovedToolbar({ editor }: ImprovedToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearchTerm, setEmojiSearchTerm] = useState('');
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showSocialPicker, setShowSocialPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ألوان النص المحسنة
  const textColors = [
    { name: 'أسود', value: '#000000' },
    { name: 'رمادي غامق', value: '#374151' },
    { name: 'رمادي', value: '#6B7280' },
    { name: 'أحمر', value: '#DC2626' },
    { name: 'أحمر فاتح', value: '#EF4444' },
    { name: 'برتقالي', value: '#EA580C' },
    { name: 'أصفر', value: '#D97706' },
    { name: 'أخضر', value: '#16A34A' },
    { name: 'أخضر فاتح', value: '#22C55E' },
    { name: 'أزرق', value: '#2563EB' },
    { name: 'أزرق فاتح', value: '#3B82F6' },
    { name: 'بنفسجي', value: '#9333EA' },
    { name: 'وردي', value: '#E11D48' },
    { name: 'بني', value: '#A3A3A3' },
    { name: 'أبيض', value: '#FFFFFF' },
    { name: 'إزالة اللون', value: 'unset' }
  ];

  // خطوط عربية وإنجليزية
  const fonts = [
    { name: 'الافتراضي', value: 'inherit' },
    { name: 'تاهوما', value: 'Tahoma, sans-serif' },
    { name: 'أريال', value: 'Arial, sans-serif' },
    { name: 'نوتو العربية', value: '"Noto Sans Arabic", sans-serif' },
    { name: 'أميري', value: 'Amiri, serif' },
    { name: 'الرقعة', value: '"Ruqaa One", cursive' },
    { name: 'كوفي', value: '"Kufam", cursive' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' }
  ];

  // رموز تعبيرية شائعة ومنظمة بشكل شامل
  const emojiCategories = {
    'وجوه سعيدة': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    'وجوه متنوعة': ['😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫'],
    'وجوه خاصة': ['🤤', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎭', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
    'إيماءات اليدين': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '�', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '�👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    'أجزاء الجسم': ['💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'],
    'أشخاص ومهن': ['👶', '🧒', '👦', '👧', '🧑', '�', '👨', '🧔', '👩', '�', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '👨‍⚖️', '👩‍⚖️', '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳'],
    'قلوب ورومانسية': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '💒', '💐', '🌹', '🥀', '🌷', '🌺', '🌸', '💮', '🏵️'],
    'حيوانات الوجه': ['🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗'],
    'حيوانات أخرى': ['🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡'],
    'طيور': ['🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜'],
    'مخلوقات بحرية': ['🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🪰', '🪱', '🦠'],
    'طبيعة ونباتات': ['🌱', '🪴', '🌿', '☘️', '🍀', '🎍', '🪵', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🪨', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘'],
    'طعام وفواكه': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐'],
    'أكلات متنوعة': ['🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛'],
    'حلويات ومشروبات': ['🍱', '🍘', '🍙', '🍚', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶'],
    'رياضة وأنشطة': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏑', '🏒', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿'],
    'سفر ومواصلات': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛼', '🚁', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛸', '🚂', '🚆', '🚄', '🚅'],
    'مباني وأماكن': ['🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛱️', '🏕️', '🗻', '🏔️', '⛰️', '🏜️', '🏖️'],
    'أشياء وكتب': ['📱', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️'],
    'رموز وعلامات': ['💯', '�', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '💢', '💡', '�', '💱', '💰', '💸', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩'],
    'احتفالات ورموز': ['🎉', '🎊', '🎈', '🎁', '🎀', '🪅', '🪆', '🎗️', '🥇', '🥈', '🥉', '🏆', '🏅', '🎖️', '🏵️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🥁', '🪘', '🎷'],
    'طقس وكواكب': ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌀', '🌈', '⚡', '❄️', '☄️', '🪐', '🌍', '🌎', '🌏', '🌕', '🌖'],
    'علوم وطب': ['🧪', '🧫', '🦠', '💉', '🩸', '💊', '🩹', '🩺', '🫀', '🫁', '🧠', '🦷', '🦴', '👁️', '👂', '👃', '👅', '⚗️', '🔬', '🔭', '📡', '🛰️', '🧬', '🦠', '💎', '🪨', '🌡️', '🧯', '🧲', '⚛️', '🔋', '🔌']
  };

  const applyColor = (color: string) => {
    if (color === 'unset' || color === '#000000') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
    setShowColorPicker(false);
  };

  const applyFont = (font: string) => {
    if (font === 'inherit') {
      // إزالة نمط الخط - استخدام unsetMark بدلاً من unsetFontFamily
      editor.chain().focus().unsetMark('textStyle').run();
    } else {
      // تطبيق الخط الجديد - استخدام setMark مع TextStyle
      editor.chain().focus().setMark('textStyle', { fontFamily: font }).run();
    }
    setShowFontPicker(false);
  };

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
    setEmojiSearchTerm(''); // إعادة تعيين البحث عند الإدراج
  };

  // فلترة الإيموجي حسب البحث
  const filteredEmojiCategories = React.useMemo(() => {
    if (!emojiSearchTerm.trim()) return emojiCategories;
    
    const filtered: Record<string, string[]> = {};
    Object.entries(emojiCategories).forEach(([category, emojis]) => {
      const matchingEmojis = emojis.filter(emoji => {
        // بحث في اسم الفئة أو الإيموجي نفسه
        return category.toLowerCase().includes(emojiSearchTerm.toLowerCase()) ||
               emoji.includes(emojiSearchTerm);
      });
      if (matchingEmojis.length > 0) {
        filtered[category] = matchingEmojis;
      }
    });
    return filtered;
  }, [emojiSearchTerm]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading('🔄 جاري رفع الصورة...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'article');

      // محاولة رفع عبر Cloudinary أولاً
      let response = await fetch('/api/upload-cloudinary', {
        method: 'POST',
        body: formData,
      });

      // إذا فشل Cloudinary، جرب الرفع المحلي
      if (!response.ok) {
        response = await fetch('/api/upload-editor', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.url) {
        editor.chain().focus().setImage({ 
          src: result.url,
          alt: file.name,
          title: file.name
        }).run();

        toast.dismiss(uploadToast);
        toast.success('تم رفع الصورة بنجاح!');
      } else {
        throw new Error(result.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      toast.dismiss(uploadToast);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const insertImageUrl = () => {
    const url = window.prompt('رابط الصورة:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('رابط:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertYoutube = () => {
    const url = window.prompt('رابط YouTube:');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  };

  const insertSocialEmbed = (platform: string) => {
    let url: string | null = '';
    let embedCode = '';
    
    switch (platform) {
      case 'twitter':
        url = window.prompt('رابط التغريدة:');
        if (url) {
          embedCode = `<div class="twitter-embed" style="border: 1px solid #e1e8ed; border-radius: 12px; padding: 16px; margin: 16px 0; background: #f7f9fa;">
            <p style="color: #1da1f2; font-weight: bold; margin-bottom: 8px;">🐦 تغريدة من Twitter</p>
            <p style="margin-bottom: 8px;">عرض التغريدة: <a href="${url}" target="_blank" style="color: #1da1f2;">${url}</a></p>
            <small style="color: #657786;">سيتم عرض التغريدة بشكل كامل عند النشر</small>
          </div>`;
        }
        break;
      case 'facebook':
        url = window.prompt('رابط منشور Facebook:');
        if (url) {
          embedCode = `<div class="facebook-embed" style="border: 1px solid #4267b2; border-radius: 8px; padding: 16px; margin: 16px 0; background: #f0f2f5;">
            <p style="color: #4267b2; font-weight: bold; margin-bottom: 8px;">📘 منشور من Facebook</p>
            <p style="margin-bottom: 8px;">عرض المنشور: <a href="${url}" target="_blank" style="color: #4267b2;">${url}</a></p>
            <small style="color: #65676b;">سيتم عرض المنشور بشكل كامل عند النشر</small>
          </div>`;
        }
        break;
      case 'instagram':
        url = window.prompt('رابط منشور Instagram:');
        if (url) {
          embedCode = `<div class="instagram-embed" style="border: 1px solid #e4405f; border-radius: 8px; padding: 16px; margin: 16px 0; background: #fafafa;">
            <p style="color: #e4405f; font-weight: bold; margin-bottom: 8px;">📷 منشور من Instagram</p>
            <p style="margin-bottom: 8px;">عرض المنشور: <a href="${url}" target="_blank" style="color: #e4405f;">${url}</a></p>
            <small style="color: #8e8e8e;">سيتم عرض المنشور بشكل كامل عند النشر</small>
          </div>`;
        }
        break;
    }
    
    if (embedCode && url) {
      editor.chain().focus().insertContent(embedCode).run();
    }
    setShowSocialPicker(false);
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-20">
      <div className="flex flex-wrap items-center gap-1 p-3">
        
        {/* أدوات التنسيق الأساسية */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('bold') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="عريض (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('italic') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="مائل (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('underline') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="تحته خط (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('strike') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="يتوسطه خط"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('code') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="كود"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* نوع الخط */}
        <div className="relative border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
          <button
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="نوع الخط"
          >
            <Type className="w-4 h-4" />
          </button>
          
          {showFontPicker && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-30 w-64">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اختر نوع الخط</div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => applyFont(font.value)}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* أدوات المحاذاة */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: 'right' }) && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="محاذاة يمين"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: 'center' }) && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="محاذاة وسط"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: 'left' }) && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="محاذاة يسار"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: 'justify' }) && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="ضبط"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* القوائم والاقتباس */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('bulletList') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="قائمة نقطية"
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('orderedList') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="قائمة مرقمة"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('blockquote') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="اقتباس"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* الألوان */}
        <div className="relative border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="ألوان النص"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-30 w-80">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">اختر لون النص</div>
              <div className="grid grid-cols-4 gap-3">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all',
                      editor.isActive('textStyle', { color: color.value }) && 'ring-2 ring-blue-500'
                    )}
                    onClick={() => applyColor(color.value)}
                  >
                    <div
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ 
                        backgroundColor: color.value === 'unset' ? 'transparent' : color.value,
                        backgroundImage: color.value === 'unset' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                        backgroundSize: color.value === 'unset' ? '8px 8px' : 'auto',
                        backgroundPosition: color.value === 'unset' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto'
                      }}
                    />
                    <span className="text-xs text-center">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* الرموز التعبيرية */}
        <div className="relative border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="رموز تعبيرية"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-30 w-96">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Smile className="w-4 h-4" />
                اختر رمز تعبيري ({Object.values(filteredEmojiCategories).flat().length} من {Object.values(emojiCategories).flat().length})
              </div>
              
              {/* مربع البحث */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="البحث في الرموز التعبيرية... 🔍"
                  value={emojiSearchTerm}
                  onChange={(e) => setEmojiSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dir="rtl"
                />
              </div>
              
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {Object.keys(filteredEmojiCategories).length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Smile className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد رموز تطابق بحثك</p>
                    <p className="text-xs mt-1">جرب كلمات أخرى مثل "وجه" أو "قلب" أو "حيوان"</p>
                  </div>
                ) : (
                  Object.entries(filteredEmojiCategories).map(([category, emojis]) => (
                    <div key={category} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-b-0">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 px-2 bg-gray-50 dark:bg-gray-700/50 rounded py-1">
                        {category} ({emojis.length})
                      </div>
                      <div className="grid grid-cols-10 gap-1">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => insertEmoji(emoji)}
                            className="p-1.5 text-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-110 rounded transition-all duration-200 hover:shadow-sm"
                            title={`إدراج ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  💡 تلميح: استخدم مربع البحث أعلاه للعثور على الرموز بسرعة
                </div>
              </div>
            </div>
          )}
        </div>

        {/* الوسائط */}
        <div className="flex items-center gap-2 border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
          {/* زر رفع الصورة المحسن */}
          <div className="relative group">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                "hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm",
                "border border-blue-200 dark:border-blue-800",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
              title="رفع صورة من جهازك (PNG, JPG, WEBP)"
            >
              {isUploading ? (
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">رفع صورة</span>
            </button>
            
            {/* tooltip محسن */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              📤 رفع صورة من جهازك
              <br />
              <span className="text-gray-300">يدعم: PNG, JPG, WEBP حتى 5MB</span>
            </div>
          </div>
          
          {/* زر رابط الصورة المحسن */}
          <div className="relative group">
            <button
              onClick={insertImageUrl}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                "hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm",
                "border border-gray-200 dark:border-gray-700"
              )}
              title="إدراج صورة من رابط خارجي"
            >
              <Image className="w-3 h-3" />
              <span className="hidden sm:inline">رابط صورة</span>
            </button>
            
            {/* tooltip محسن */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              🔗 إدراج صورة من رابط
              <br />
              <span className="text-gray-300">أدخل رابط الصورة مباشرة</span>
            </div>
          </div>
          
          <button
            onClick={insertLink}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('link') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="إدراج رابط"
          >
            <Link className="w-4 h-4" />
          </button>
          
          <button
            onClick={insertYoutube}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="إدراج فيديو YouTube"
          >
            <Youtube className="w-4 h-4" />
          </button>
          
          <button
            onClick={insertTable}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="إدراج جدول"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>

        {/* وسائل التواصل الاجتماعي */}
        <div className="relative border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
          <button
            onClick={() => setShowSocialPicker(!showSocialPicker)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="تضمين وسائل التواصل"
          >
            <Twitter className="w-4 h-4" />
          </button>
          
          {showSocialPicker && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-30 w-48">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تضمين من:</div>
              <div className="space-y-1">
                <button
                  onClick={() => insertSocialEmbed('twitter')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Twitter className="w-4 h-4 text-blue-400" />
                  Twitter
                </button>
                <button
                  onClick={() => insertSocialEmbed('facebook')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </button>
                <button
                  onClick={() => insertSocialEmbed('instagram')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram
                </button>
              </div>
            </div>
          )}
        </div>

        {/* التراجع والإعادة */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="تراجع (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="إعادة (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* مدخل رفع الملفات المخفي */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* إغلاق القوائم المنبثقة عند النقر خارجها */}
      {(showColorPicker || showEmojiPicker || showFontPicker || showSocialPicker) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowColorPicker(false);
            setShowEmojiPicker(false);
            setShowFontPicker(false);
            setShowSocialPicker(false);
            setEmojiSearchTerm(''); // تنظيف البحث عند الإغلاق
          }}
        />
      )}
    </div>
  );
}

