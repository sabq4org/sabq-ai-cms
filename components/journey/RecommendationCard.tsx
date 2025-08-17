import React from 'react';
import { Clock } from 'lucide-react';
import Image from 'next/image';

interface RecommendationCardProps {
  title: string;
  category: string;
  readTime: string;
  url: string;
  excerpt?: string;
  featured_image?: string;
  reason: string;
}

export function RecommendationCard({
  title,
  category,
  readTime,
  url,
  excerpt,
  featured_image,
  reason
}: RecommendationCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      {featured_image && (
        <div className="relative h-48 w-full">
          <Image
            src={featured_image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100 line-clamp-2">
          {title}
        </h3>
        
        {excerpt && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {excerpt}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            {category}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 ml-1" />
            {readTime}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">
          {reason}
        </p>
        
        <a 
          href={url}
          className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition"
        >
          اقرأ الآن
        </a>
      </div>
    </div>
  );
} 