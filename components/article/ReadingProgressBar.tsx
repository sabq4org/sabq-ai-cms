'use client';

import { useEffect, useState } from 'react';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      setProgress(scrollProgress);
      
      // تحديث CSS variable للتأثيرات
      document.documentElement.style.setProperty('--scroll-progress', `${scrollProgress}%`);
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // تحديث أولي

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <>
      {/* شريط التقدم العلوي */}
      <div className="reading-progress" />
      
      {/* مؤشر النسبة المئوية */}
      {progress > 5 && (
        <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-full shadow-lg p-3 transition-opacity duration-300">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                className="text-blue-600 dark:text-blue-400 transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 