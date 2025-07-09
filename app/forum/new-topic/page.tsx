'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MessageCircle, Send, AlertCircle, Check } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

export default function NewTopicPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // جلب الفئات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/forum/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('حدث خطأ في جلب الفئات');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // التحقق من صحة البيانات
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('عنوان الموضوع مطلوب');
      return false;
    }
    if (formData.title.trim().length < 5) {
      setError('عنوان الموضوع يجب أن يكون أكثر من 5 أحرف');
      return false;
    }
    if (!formData.content.trim()) {
      setError('محتوى الموضوع مطلوب');
      return false;
    }
    if (formData.content.trim().length < 10) {
      setError('محتوى الموضوع يجب أن يكون أكثر من 10 أحرف');
      return false;
    }
    if (!formData.category_id) {
      setError('يرجى اختيار فئة للموضوع');
      return false;
    }
    return true;
  };

  // إرسال الموضوع
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: إضافة token المصادقة هنا
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // نجح الإنشاء - توجه للموضوع الجديد
        router.push(`/forum/topic/${data.id}`);
      } else {
        setError(data.error || 'حدث خطأ في إنشاء الموضوع');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} dir="rtl">
      {/* الهيدر الرسمي للصحيفة */}
      <Header />
      
      {/* رأس الصفحة */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/forum" className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} transition-colors`}>
              <ArrowRight className="w-4 h-4" />
              العودة للمنتدى
            </Link>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'
              } shadow-md`}>
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>موضوع جديد</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>شارك أفكارك مع المجتمع</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نموذج إنشاء الموضوع */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* عرض الأخطاء */}
          {error && (
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* النموذج الرئيسي */}
            <div className="lg:col-span-2 space-y-6">
              {/* عنوان الموضوع */}
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>عنوان الموضوع</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="اكتب عنواناً واضحاً ومفيداً للموضوع..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full text-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                    maxLength={200}
                  />
                  <div className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formData.title.length}/200 حرف
                  </div>
                </CardContent>
              </Card>

              {/* محتوى الموضوع */}
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>محتوى الموضوع</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="اكتب تفاصيل موضوعك هنا... كلما كان أكثر تفصيلاً، كان أفضل للمناقشة"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className={`w-full min-h-[300px] ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                    maxLength={5000}
                  />
                  <div className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formData.content.length}/5000 حرف
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الشريط الجانبي */}
            <div className="space-y-6">
              {/* اختيار الفئة */}
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>اختر الفئة</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className={`h-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
                  ) : (
                                         <select 
                       value={formData.category_id} 
                       onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                       className={`w-full p-3 rounded-lg border ${
                         darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                       }`}
                     >
                       <option value="">اختر فئة مناسبة</option>
                       {categories.map((category) => (
                         <option key={category.id} value={category.id}>
                           {category.name}
                         </option>
                       ))}
                     </select>
                  )}
                  
                                     {selectedCategory && (
                     <div className="mt-3">
                       <div 
                         className="inline-flex items-center px-2 py-1 text-xs text-white rounded-md"
                         style={{ backgroundColor: selectedCategory.color }}
                       >
                         {selectedCategory.name}
                       </div>
                       {selectedCategory.description && (
                         <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                           {selectedCategory.description}
                         </p>
                       )}
                     </div>
                   )}
                </CardContent>
              </Card>

              {/* إرشادات النشر */}
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>إرشادات النشر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      اختر عنواناً واضحاً يصف موضوعك
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      اكتب تفاصيل كافية لبدء نقاش مفيد
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      اختر الفئة المناسبة لموضوعك
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      كن مهذباً واحترم آراء الآخرين
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* أزرار الإجراءات */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري النشر...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      نشر الموضوع
                    </div>
                  )}
                </Button>
                
                <Link href="/forum">
                  <Button variant="outline" className="w-full" type="button">
                    إلغاء
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}