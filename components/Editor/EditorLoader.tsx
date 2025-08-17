'use client';

import React from 'react';
import { Loader2, FileText, Sparkles } from 'lucide-react';

interface EditorLoaderProps {
  type?: 'default' | 'advanced' | 'realtime';
  message?: string;
}

const EditorLoader: React.FC<EditorLoaderProps> = ({ 
  type = 'default', 
  message 
}) => {
  const getLoaderConfig = () => {
    switch (type) {
      case 'advanced':
        return {
          icon: <Sparkles className="w-8 h-8 text-purple-600" />,
          title: 'تحميل المحرر المتقدم',
          description: 'جاري تحميل أدوات الذكاء الاصطناعي...',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800'
        };
      case 'realtime':
        return {
          icon: <FileText className="w-8 h-8 text-green-600" />,
          title: 'تحميل المحرر الفوري',
          description: 'جاري إعداد المزامنة الفورية...',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      default:
        return {
          icon: <FileText className="w-8 h-8 text-blue-600" />,
          title: 'تحميل المحرر',
          description: 'جاري تحميل مكونات المحرر...',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
    }
  };

  const config = getLoaderConfig();

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${config.bgColor} rounded-lg border-2 border-dashed ${config.borderColor}`}>
      <div className="text-center p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            {config.icon}
            <Loader2 className="w-4 h-4 animate-spin text-gray-600 absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {config.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {message || config.description}
        </p>
        
        <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          قد يستغرق هذا بضع ثوانٍ...
        </div>
      </div>
    </div>
  );
};

export default EditorLoader;