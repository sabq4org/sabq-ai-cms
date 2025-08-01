'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ArticleRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;

  useEffect(() => {
    if (articleId) {
      // إعادة توجيه فورية للمسار الصحيح
      router.replace(`/admin/articles/unified/${articleId}`);
    }
  }, [articleId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري إعادة التوجيه لصفحة تعديل المقال...</p>
      </div>
    </div>
  );
}