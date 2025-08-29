'use client';

import Link from 'next/link';
import { Plus, FileText, Sparkles } from 'lucide-react';

interface CreateNewsButtonProps {
  variant?: 'primary' | 'secondary' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  showDropdown?: boolean;
  className?: string;
}

export default function CreateNewsButton({ 
  variant = 'primary', 
  size = 'md',
  showDropdown = false,
  className = ''
}: CreateNewsButtonProps) {
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 
    font-medium rounded-lg transition-all duration-200
    hover:scale-105 active:scale-95
    ${sizeClasses[size]}
    ${className}
  `;

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Link href="/admin/news/unified">
          <button
            className={`${baseClasses} bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl`}
            title="إنشاء خبر جديد"
          >
            <Plus className="w-5 h-5" />
            {size === 'lg' && 'خبر جديد'}
          </button>
        </Link>
      </div>
    );
  }

  if (showDropdown) {
    return (
      <div className="relative group">
        <Link href="/admin/news/unified">
          <button
            className={`${baseClasses} ${
              variant === 'primary' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            إنشاء خبر جديد
          </button>
        </Link>
        
        {/* قائمة منسدلة للخيارات الإضافية */}
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-2">
            <Link href="/admin/news/unified" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <FileText className="w-4 h-4" />
              محرر موحد
            </Link>
            <Link href="/admin/news/smart-editor" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <Sparkles className="w-4 h-4" />
              محرر ذكي
            </Link>
            <Link href="/admin/news/create" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <Plus className="w-4 h-4" />
              محرر سريع
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href="/admin/news/unified">
      <button
        className={`${baseClasses} ${
          variant === 'primary' 
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Plus className="w-4 h-4" />
        إنشاء خبر جديد
      </button>
    </Link>
  );
}

// مكون إضافي للأزرار السريعة
export function QuickCreateButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/admin/news/unified">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          خبر جديد
        </button>
      </Link>
      
      <Link href="/admin/news/smart-editor">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Sparkles className="w-4 h-4" />
          محرر ذكي
        </button>
      </Link>
      
      <Link href="/admin/news/create">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <FileText className="w-4 h-4" />
          محرر سريع
        </button>
      </Link>
    </div>
  );
}

