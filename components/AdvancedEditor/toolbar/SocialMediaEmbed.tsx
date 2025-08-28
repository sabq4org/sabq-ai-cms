'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Twitter, 
  Instagram, 
  Facebook, 
  Youtube, 
  Linkedin,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialMediaEmbedProps {
  editor: Editor;
}

export function SocialMediaEmbed({ editor }: SocialMediaEmbedProps) {
  const [activeTab, setActiveTab] = useState<'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok'>('twitter');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // منصات وسائل التواصل الاجتماعي
  const socialPlatforms = {
    twitter: {
      name: 'تويتر / X',
      icon: <Twitter className="h-4 w-4" />,
      placeholder: 'https://twitter.com/username/status/...',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      examples: [
        'https://twitter.com/username/status/1234567890',
        'https://x.com/username/status/1234567890'
      ]
    },
    instagram: {
      name: 'إنستغرام',
      icon: <Instagram className="h-4 w-4" />,
      placeholder: 'https://www.instagram.com/p/...',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900',
      examples: [
        'https://www.instagram.com/p/ABC123/',
        'https://instagram.com/reel/ABC123/'
      ]
    },
    facebook: {
      name: 'فيسبوك',
      icon: <Facebook className="h-4 w-4" />,
      placeholder: 'https://www.facebook.com/...',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      examples: [
        'https://www.facebook.com/username/posts/123456',
        'https://www.facebook.com/watch/?v=123456'
      ]
    },
    youtube: {
      name: 'يوتيوب',
      icon: <Youtube className="h-4 w-4" />,
      placeholder: 'https://www.youtube.com/watch?v=...',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900',
      examples: [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ'
      ]
    },
    tiktok: {
      name: 'تيك توك',
      icon: <div className="w-4 h-4 bg-black dark:bg-white rounded-sm" />,
      placeholder: 'https://www.tiktok.com/@username/video/...',
      color: 'text-gray-900 dark:text-white',
      bgColor: 'bg-gray-50 dark:bg-gray-900',
      examples: [
        'https://www.tiktok.com/@username/video/1234567890',
        'https://vm.tiktok.com/ABC123/'
      ]
    }
  };

  const currentPlatform = socialPlatforms[activeTab];

  // استخراج معرف المحتوى من الرابط
  const extractContentId = (url: string, platform: string) => {
    try {
      const urlObj = new URL(url);
      
      switch (platform) {
        case 'twitter':
          const twitterMatch = url.match(/status\/(\d+)/);
          return twitterMatch ? twitterMatch[1] : null;
          
        case 'instagram':
          const instagramMatch = url.match(/\/p\/([^\/]+)/);
          return instagramMatch ? instagramMatch[1] : null;
          
        case 'facebook':
          const facebookMatch = url.match(/posts\/(\d+)|watch\/\?v=(\d+)/);
          return facebookMatch ? (facebookMatch[1] || facebookMatch[2]) : null;
          
        case 'youtube':
          const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
          return youtubeMatch ? youtubeMatch[1] : null;
          
        case 'tiktok':
          const tiktokMatch = url.match(/video\/(\d+)|vm\.tiktok\.com\/([^\/]+)/);
          return tiktokMatch ? (tiktokMatch[1] || tiktokMatch[2]) : null;
          
        default:
          return null;
      }
    } catch {
      return null;
    }
  };

  // تضمين المحتوى
  const embedContent = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    
    try {
      const contentId = extractContentId(url, activeTab);
      
      if (!contentId) {
        alert('رابط غير صحيح. يرجى التحقق من الرابط والمحاولة مرة أخرى.');
        return;
      }

      // إنشاء HTML للتضمين
      let embedHtml = '';
      
      switch (activeTab) {
        case 'twitter':
          embedHtml = `
            <div class="social-embed twitter-embed" data-platform="twitter" data-id="${contentId}">
              <blockquote class="twitter-tweet">
                <a href="${url}">تغريدة من تويتر</a>
              </blockquote>
              <script async src="https://platform.twitter.com/widgets.js"></script>
            </div>
          `;
          break;
          
        case 'instagram':
          embedHtml = `
            <div class="social-embed instagram-embed" data-platform="instagram" data-id="${contentId}">
              <blockquote class="instagram-media">
                <a href="${url}">منشور من إنستغرام</a>
              </blockquote>
              <script async src="//www.instagram.com/embed.js"></script>
            </div>
          `;
          break;
          
        case 'facebook':
          embedHtml = `
            <div class="social-embed facebook-embed" data-platform="facebook" data-id="${contentId}">
              <div class="fb-post" data-href="${url}"></div>
            </div>
          `;
          break;
          
        case 'youtube':
          embedHtml = `
            <div class="social-embed youtube-embed" data-platform="youtube" data-id="${contentId}">
              <iframe 
                width="560" 
                height="315" 
                src="https://www.youtube.com/embed/${contentId}" 
                frameborder="0" 
                allowfullscreen>
              </iframe>
            </div>
          `;
          break;
          
        case 'tiktok':
          embedHtml = `
            <div class="social-embed tiktok-embed" data-platform="tiktok" data-id="${contentId}">
              <blockquote class="tiktok-embed">
                <a href="${url}">فيديو من تيك توك</a>
              </blockquote>
              <script async src="https://www.tiktok.com/embed.js"></script>
            </div>
          `;
          break;
      }

      // إدراج المحتوى في المحرر
      editor.chain().focus().insertContent(embedHtml).run();
      
      // إعادة تعيين النموذج
      setUrl('');
      
    } catch (error) {
      console.error('خطأ في تضمين المحتوى:', error);
      alert('حدث خطأ أثناء تضمين المحتوى. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // نسخ مثال الرابط
  const copyExample = (exampleUrl: string) => {
    navigator.clipboard.writeText(exampleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-96 p-4">
      {/* عنوان */}
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        تضمين محتوى وسائل التواصل الاجتماعي
      </div>

      {/* تبويبات المنصات */}
      <div className="flex flex-wrap gap-1 mb-4">
        {Object.entries(socialPlatforms).map(([key, platform]) => (
          <button
            key={key}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
              activeTab === key
                ? `${platform.bgColor} ${platform.color}`
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
            onClick={() => setActiveTab(key as any)}
          >
            {platform.icon}
            <span>{platform.name}</span>
          </button>
        ))}
      </div>

      {/* إدخال الرابط */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            رابط {currentPlatform.name}
          </label>
          <input
            type="url"
            placeholder={currentPlatform.placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && embedContent()}
          />
        </div>

        {/* زر التضمين */}
        <button
          onClick={embedContent}
          disabled={!url.trim() || isLoading}
          className={cn(
            'w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
            !url.trim() || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          {isLoading ? 'جاري التضمين...' : `تضمين من ${currentPlatform.name}`}
        </button>
      </div>

      {/* أمثلة الروابط */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          أمثلة على الروابط:
        </div>
        <div className="space-y-2">
          {currentPlatform.examples.map((example, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs"
            >
              <code className="flex-1 text-gray-600 dark:text-gray-400 break-all">
                {example}
              </code>
              <button
                onClick={() => copyExample(example)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="نسخ المثال"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-500" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* نصائح */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          نصائح:
        </div>
        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <li>• انسخ الرابط مباشرة من المنصة</li>
          <li>• تأكد من أن المحتوى عام وقابل للمشاهدة</li>
          <li>• بعض المحتوى قد يحتاج وقت للتحميل</li>
          <li>• يمكنك تحرير المحتوى المضمن بعد الإدراج</li>
        </ul>
      </div>
    </div>
  );
}

