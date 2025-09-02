'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MessageCircle, Send, AlertCircle, Check, Bold, Italic, List, Link as LinkIcon, Code, User, Shield } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useDarkMode } from "@/hooks/useDarkMode";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

export default function NewTopicPage() {
  const router = useRouter();
  
  // استخدام useDarkMode hook
  const { darkMode } = useDarkMode();

  useEffect(() => {
    setMounted(true);
    // استخدام localStorage لتحديد الثيم
    const theme = localStorage.getItem('sabq-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(theme === 'dark' || (theme === null && systemPrefersDark));
  }, []);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.emailVerified) {
            setUser(data.user);
          } else if (data.user && !data.user.emailVerified) {
            toast.error('يجب تفعيل البريد الإلكتروني أولاً');
            router.push('/auth/verify');
          } else {
            router.push('/login?redirect=/forum/new-topic');
          }
        } else {
          router.push('/login?redirect=/forum/new-topic');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login?redirect=/forum/new-topic');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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

    if (user) {
      fetchCategories();
    }
  }, [user]);

  // التحقق من صحة البيانات
  const validateForm = () => {
    if (!formData.title.trim()) {
      const msg = 'عنوان الموضوع مطلوب';
      setError(msg);
      toast.error(msg);
      return false;
    }
    if (formData.title.trim().length < 5) {
      const msg = 'عنوان الموضوع يجب أن يكون أكثر من 5 أحرف';
      setError(msg);
      toast.error(msg);
      return false;
    }
    if (!formData.content.trim()) {
      const msg = 'محتوى الموضوع مطلوب';
      setError(msg);
      toast.error(msg);
      return false;
    }
    if (formData.content.trim().length < 10) {
      const msg = 'محتوى الموضوع يجب أن يكون أكثر من 10 أحرف';
      setError(msg);
      toast.error(msg);
      return false;
    }
    if (!formData.category_id) {
      const msg = 'يرجى اختيار فئة للموضوع';
      setError(msg);
      toast.error(msg);
      return false;
    }
    return true;
  };

  // إرسال الموضوع
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      router.push('/login?redirect=/forum/new-topic');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    // إظهار إشعار بدء العملية
    const loadingToast = toast.loading('جاري نشر الموضوع...');

    try {
      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // نجح الإنشاء
        toast.success('تم نشر الموضوع بنجاح! 🎉', { id: loadingToast });
        
        // الانتظار قليلاً قبل التوجيه
        setTimeout(() => {
          router.push(`/forum/topic/${data.id}`);
        }, 1000);
      } else {
        const errorMsg = data.error || 'حدث خطأ في إنشاء الموضوع';
        setError(errorMsg);
        toast.error(errorMsg, { id: loadingToast });
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      const errorMsg = 'حدث خطأ في الاتصال بالخادم';
      setError(errorMsg);
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من صلاحياتك...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم، لا تعرض شيئاً (سيتم التوجيه)
  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} dir="rtl">
      {/* الهيدر الرسمي للصحيفة */}
      
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
                  {/* شريط أدوات بسيط */}
                  <div className={`flex items-center gap-2 p-2 mb-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = formData.content.substring(start, end);
                        const newText = formData.content.substring(0, start) + '**' + selectedText + '**' + formData.content.substring(end);
                        setFormData({ ...formData, content: newText });
                      }}
                      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                      title="عريض"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = formData.content.substring(start, end);
                        const newText = formData.content.substring(0, start) + '*' + selectedText + '*' + formData.content.substring(end);
                        setFormData({ ...formData, content: newText });
                      }}
                      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                      title="مائل"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newText = formData.content + '\n- ';
                        setFormData({ ...formData, content: newText });
                      }}
                      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                      title="قائمة"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = formData.content.substring(start, end);
                        const newText = formData.content.substring(0, start) + '`' + selectedText + '`' + formData.content.substring(end);
                        setFormData({ ...formData, content: newText });
                      }}
                      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                      title="كود"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                    <div className={`h-6 w-px ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} mx-1`}></div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} ml-auto`}>
                      يدعم Markdown
                    </span>
                  </div>
                  
                  <Textarea
                    name="content"
                    placeholder="اكتب تفاصيل موضوعك هنا... كلما كان أكثر تفصيلاً، كان أفضل للمناقشة&#10;&#10;يمكنك استخدام Markdown للتنسيق:&#10;**نص عريض** | *نص مائل* | `كود` | - قائمة"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className={`w-full min-h-[300px] font-mono ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                    maxLength={5000}
                  />
                  <div className={`mt-2 flex items-center justify-between text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>{formData.content.length}/5000 حرف</span>
                    <span className="text-xs">نصيحة: اضغط Ctrl+B للنص العريض</span>
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

              {/* معلومات المستخدم */}
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`text-lg flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Shield className="w-5 h-5 text-green-500" />
                    معلومات النشر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : '؟'}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">حساب موثق</span>
                      </div>
                    </div>
                  </div>
                  <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      سيتم نشر الموضوع باسمك المسجل في النظام. لا يمكن تغيير اسم الناشر بعد النشر.
                    </p>
                  </div>
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