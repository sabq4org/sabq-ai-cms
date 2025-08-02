/**
 * صفحة تجربة المحرر الذكي
 * Smart Editor Demo Page
 */

'use client';

import { CollaborativeEditor, CommentsSystem, getUserColor, type User } from '@/components/Editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, FileText, MessageCircle, Save, Settings, Users } from 'lucide-react';
import React, { useState } from 'react';

const SmartEditorDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'comments'>('editor');
  const [documentTitle, setDocumentTitle] = useState('تجربة المحرر الذكي');
  const [saving, setSaving] = useState(false);

  // مستخدم تجريبي
  const demoUser: User = {
    id: 'demo-user-1',
    name: 'محرر تجريبي',
    email: 'demo@sabq.org',
    color: getUserColor('demo-user-1')
  };

  const handleSave = async () => {
    setSaving(true);
    // محاكاة عملية الحفظ
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل العلوي */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة
              </Button>

              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-semibold">المحرر الذكي - تجربة</h1>
                <Badge variant="secondary">Demo</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 ml-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>

              <Button size="sm">
                <Eye className="w-4 h-4 ml-2" />
                معاينة
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex">
        {/* المنطقة الرئيسية */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* عنوان المستند */}
            <Card>
              <CardContent className="p-6">
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full text-2xl font-bold border-none outline-none bg-transparent"
                  placeholder="عنوان المستند..."
                />
              </CardContent>
            </Card>

            {/* التبويبات */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                المحرر التعاوني
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'comments'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                التعليقات
              </button>
            </div>

            {/* محتوى التبويبات */}
            {activeTab === 'editor' && (
              <Card>
                <CardContent className="p-0">
                  <CollaborativeEditor
                    documentId="demo-document-123"
                    currentUser={demoUser}
                    initialContent={{
                      type: 'doc',
                      content: [
                        {
                          type: 'paragraph',
                          content: [
                            {
                              type: 'text',
                              text: 'مرحباً بك في المحرر الذكي! 🎉'
                            }
                          ]
                        },
                        {
                          type: 'paragraph',
                          content: [
                            {
                              type: 'text',
                              text: 'هذا مثال على المحرر التعاوني المتقدم. يمكنك:'
                            }
                          ]
                        },
                        {
                          type: 'bulletList',
                          content: [
                            {
                              type: 'listItem',
                              content: [
                                {
                                  type: 'paragraph',
                                  content: [
                                    {
                                      type: 'text',
                                      text: 'الكتابة والتنسيق بطرق متقدمة'
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              type: 'listItem',
                              content: [
                                {
                                  type: 'paragraph',
                                  content: [
                                    {
                                      type: 'text',
                                      text: 'التعاون مع الفريق في الوقت الفعلي'
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              type: 'listItem',
                              content: [
                                {
                                  type: 'paragraph',
                                  content: [
                                    {
                                      type: 'text',
                                      text: 'إضافة التعليقات والملاحظات'
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }}
                    onSave={(content) => console.log('💾 تم حفظ المحتوى:', content)}
                    className="min-h-[500px]"
                  />
                </CardContent>
              </Card>
            )}

            {activeTab === 'comments' && (
              <Card>
                <CardContent className="p-0">
                  <CommentsSystem
                    documentId="demo-document-123"
                    currentUser={demoUser}
                    className="min-h-[500px]"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* الشريط الجانبي */}
        <div className="w-80 bg-white border-l p-6 space-y-6">
          {/* معلومات التجربة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4" />
                معلومات التجربة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 space-y-2">
                <p>🎯 <strong>الهدف:</strong> عرض قدرات المحرر الذكي</p>
                <p>⚡ <strong>المزايا:</strong> تحرير تعاوني، تعليقات فورية، حفظ تلقائي</p>
                <p>🔧 <strong>التقنيات:</strong> Tiptap, Y.js, Supabase</p>
              </div>
            </CardContent>
          </Card>

          {/* المستخدمون النشطون */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                المستخدمون النشطون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: demoUser.color }}
                  >
                    {demoUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{demoUser.name}</p>
                    <p className="text-xs text-gray-500">أنت (متصل الآن)</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                  💡 في البيئة الحقيقية، ستشاهد جميع أعضاء الفريق المتصلين هنا
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">إحصائيات التجربة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>الكلمات:</span>
                <span className="font-medium">42</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>وقت القراءة:</span>
                <span className="font-medium">1 دقيقة</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>آخر تحديث:</span>
                <span className="font-medium text-xs">الآن</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartEditorDemo;
