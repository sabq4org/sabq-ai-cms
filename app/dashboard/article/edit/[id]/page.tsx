'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id || '';

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          العودة
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          تعديل المقال
        </h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 mb-4">
            معرف المقال: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{articleId}</span>
          </p>
          
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              صفحة تعديل المقال قيد التطوير...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 