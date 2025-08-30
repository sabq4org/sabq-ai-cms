'use client'

import React, { useState } from 'react'
import { AdvancedEditor } from '@/components/ui/advanced-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditorTestPage() {
  const [content, setContent] = useState('')

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🚀 اختبار المحرر المتقدم مع رفع الصور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdvancedEditor
            value={content}
            onChange={setContent}
            placeholder="اكتب مقالك هنا... يمكنك إضافة الصور والإيموجي والنصوص المنسقة"
            className="min-h-96"
          />
        </CardContent>
      </Card>

      {/* معاينة المحتوى */}
      {content && (
        <Card>
          <CardHeader>
            <CardTitle>معاينة المحتوى</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-arabic max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>
      )}

      {/* إحصائيات */}
      <Card>
        <CardHeader>
          <CardTitle>الإحصائيات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {content.replace(/<[^>]*>/g, '').length}
              </div>
              <div className="text-sm text-gray-500">حرف</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-500">كلمة</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {(content.match(/<img/g) || []).length}
              </div>
              <div className="text-sm text-gray-500">صورة</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.ceil(content.replace(/<[^>]*>/g, '').length / 1000)}
              </div>
              <div className="text-sm text-gray-500">دقيقة قراءة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
