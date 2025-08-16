'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SimpleInteractionButtons from '@/components/article/SimpleInteractionButtons';
import { Heart, Bookmark, TestTube } from 'lucide-react';

export default function TestInteractionsPage() {
  // مقالات تجريبية للاختبار
  const testArticles = [
    {
      id: 'test-article-1',
      title: 'مقال تجريبي للاختبار',
      initialLikes: 5,
      initialSaves: 3
    },
    {
      id: 'test-article-2', 
      title: 'مقال آخر للاختبار',
      initialLikes: 12,
      initialSaves: 8
    },
    {
      id: 'test-article-3',
      title: 'مقال ثالث للتجربة',
      initialLikes: 0,
      initialSaves: 0
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-4">
          <TestTube className="w-8 h-8 text-green-600" />
          اختبار نظام الإعجاب والحفظ
        </h1>
        <p className="text-gray-600">
          صفحة لاختبار نظام الإعجاب والحفظ الجديد
        </p>
      </div>

      {/* تعليمات الاختبار */}
      <Card className="mb-8 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            تعليمات الاختبار
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>تأكد من تسجيل الدخول أولاً</li>
            <li>اضغط على أزرار الإعجاب والحفظ أدناه</li>
            <li>ستظهر رسائل التأكيد أعلى الشاشة</li>
            <li>تحقق من الملف الشخصي لرؤية المقالات المعجب بها والمحفوظة</li>
            <li>جرب إزالة الإعجاب والحفظ</li>
          </ol>
        </CardContent>
      </Card>

      {/* المقالات التجريبية */}
      <div className="grid gap-6">
        {testArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{article.title}</span>
                <div className="text-sm text-gray-500">
                  ID: {article.id}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  هذا مقال تجريبي لاختبار نظام الإعجاب والحفظ. يمكنك الضغط على الأزرار أدناه لتجربة الوظائف.
                </p>
                
                <SimpleInteractionButtons
                  articleId={article.id}
                  initialLikes={article.initialLikes}
                  initialSaves={article.initialSaves}
                  className="justify-start"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* روابط سريعة */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">روابط سريعة للاختبار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/profile/liked"
              className="flex items-center gap-2 p-4 bg-white rounded-lg border hover:shadow-md transition-all"
            >
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium">المقالات المعجب بها</div>
                <div className="text-sm text-gray-500">رؤية جميع الإعجابات</div>
              </div>
            </a>
            
            <a
              href="/profile/saved"
              className="flex items-center gap-2 p-4 bg-white rounded-lg border hover:shadow-md transition-all"
            >
              <Bookmark className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">المقالات المحفوظة</div>
                <div className="text-sm text-gray-500">رؤية جميع المحفوظات</div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* معلومات تقنية */}
      <Card className="mt-8 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">معلومات تقنية</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">APIs المستخدمة:</h4>
              <ul className="space-y-1">
                <li>• <code>/api/interactions/like</code> - للإعجاب</li>
                <li>• <code>/api/interactions/bookmark</code> - للحفظ</li>
                <li>• <code>/api/articles/[id]/status</code> - لحالة المقال</li>
                <li>• <code>/api/user/likes</code> - للإعجابات</li>
                <li>• <code>/api/user/saved</code> - للمحفوظات</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">المكونات:</h4>
              <ul className="space-y-1">
                <li>• <code>SimpleInteractionButtons</code></li>
                <li>• <code>LikedArticlesPage</code></li>
                <li>• <code>SavedArticlesPage</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
