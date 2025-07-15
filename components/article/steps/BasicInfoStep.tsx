'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BasicInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
  authors: any[];
  darkMode: boolean;
  isAILoading: boolean;
  setIsAILoading: (loading: boolean) => void;
  goToStep: (step: number) => void;
}

export function BasicInfoStep({
  formData,
  setFormData,
  categories,
  authors,
  darkMode,
  isAILoading,
  setIsAILoading,
  goToStep
}: BasicInfoStepProps) {
  
  // اقتراح عناوين بالذكاء الاصطناعي
  const suggestTitles = async () => {
    if (!formData.excerpt) {
      toast.error('يرجى كتابة الموجز أولاً');
      return;
    }
    
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'title', 
          content: formData.excerpt 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const titles = data.result?.split('\n').filter((t: string) => t.trim());
        if (titles?.length > 0) {
          // عرض العناوين المقترحة
          const selectedTitle = await new Promise<string>((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50';
            modal.innerHTML = `
              <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h3 class="text-lg font-bold mb-4">اختر عنواناً:</h3>
                <div class="space-y-2 mb-4">
                  ${titles.map((title: string, i: number) => `
                    <button class="w-full text-right p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-title="${title}">
                      ${title}
                    </button>
                  `).join('')}
                </div>
                <button class="w-full p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                  إلغاء
                </button>
              </div>
            `;
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e: any) => {
              if (e.target.dataset.title) {
                resolve(e.target.dataset.title);
                modal.remove();
              } else if (e.target === modal || e.target.textContent === 'إلغاء') {
                resolve('');
                modal.remove();
              }
            });
          });
          
          if (selectedTitle) {
            setFormData((prev: any) => ({ ...prev, title: selectedTitle }));
            toast.success('تم اختيار العنوان');
          }
        }
      }
    } catch (error) {
      console.error('Error suggesting titles:', error);
      toast.error('حدث خطأ في اقتراح العناوين');
    } finally {
      setIsAILoading(false);
    }
  };

  // تحليل جودة الموجز
  const analyzeExcerpt = (excerpt: string) => {
    const minLength = 50;
    const maxLength = 160;
    const idealLength = 120;
    
    if (excerpt.length < minLength) {
      return { 
        quality: 'poor', 
        message: `الموجز قصير جداً (${excerpt.length} حرف). يُفضل ${minLength} حرف على الأقل.`,
        color: 'text-red-600'
      };
    } else if (excerpt.length > maxLength) {
      return { 
        quality: 'poor', 
        message: `الموجز طويل جداً (${excerpt.length} حرف). الحد الأقصى ${maxLength} حرف.`,
        color: 'text-red-600'
      };
    } else if (excerpt.length >= idealLength - 20 && excerpt.length <= idealLength + 20) {
      return { 
        quality: 'excellent', 
        message: `ممتاز! (${excerpt.length} حرف)`,
        color: 'text-green-600'
      };
    } else {
      return { 
        quality: 'good', 
        message: `جيد (${excerpt.length} حرف)`,
        color: 'text-yellow-600'
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          المعلومات الأساسية
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          ابدأ بإدخال المعلومات الأساسية للمقال
        </p>
      </div>

      {/* العنوان */}
      <div>
        <Label htmlFor="title" className="text-base font-medium mb-2 block">
          العنوان الرئيسي <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
            placeholder="أدخل عنوان المقال..."
            className="flex-1"
            required
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={suggestTitles}
            disabled={isAILoading || !formData.excerpt}
            title="اقتراح عناوين بناءً على الموجز"
          >
            {isAILoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="mr-1 hidden sm:inline">اقتراح</span>
          </Button>
        </div>
      </div>

      {/* العنوان الفرعي */}
      <div>
        <Label htmlFor="subtitle" className="text-base font-medium mb-2 block">
          العنوان الفرعي (اختياري)
        </Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, subtitle: e.target.value }))}
          placeholder="عنوان فرعي يوضح المزيد..."
        />
      </div>

      {/* الموجز */}
      <div>
        <Label htmlFor="excerpt" className="text-base font-medium mb-2 block">
          الموجز / Lead <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, excerpt: e.target.value }))}
          placeholder="اكتب موجزاً قصيراً يلخص المقال (يظهر في صفحة المقال وفي نتائج البحث)"
          rows={4}
          required
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            {formData.excerpt.length} / 160 حرف (الموصى به)
          </p>
          {formData.excerpt.length > 0 && (
            <p className={`text-sm font-medium ${analyzeExcerpt(formData.excerpt).color}`}>
              {analyzeExcerpt(formData.excerpt).message}
            </p>
          )}
        </div>
      </div>

      {/* التصنيف والكاتب */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* التصنيف */}
        <div>
          <Label htmlFor="category" className="text-base font-medium mb-2 block">
            التصنيف <span className="text-red-500">*</span>
          </Label>
          <select
            id="category"
            value={formData.categoryId}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, categoryId: e.target.value }))}
            className={`w-full p-3 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          >
            <option value="">اختر التصنيف...</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* الكاتب */}
        <div>
          <Label htmlFor="author" className="text-base font-medium mb-2 block">
            المراسل/الكاتب <span className="text-red-500">*</span>
          </Label>
          <select
            id="author"
            value={formData.authorId}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, authorId: e.target.value }))}
            className={`w-full p-3 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          >
            <option value="">اختر المراسل...</option>
            {authors.map(author => (
              <option key={author.id} value={author.id}>
                {author.name} {author.role ? `(${author.role})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* نصائح */}
      <Alert className={darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}>
        <Info className="h-4 w-4" />
        <AlertDescription className={darkMode ? 'text-blue-200' : 'text-blue-800'}>
          <strong>نصائح للعنوان الجيد:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• استخدم كلمات واضحة ومباشرة</li>
            <li>• تجنب العناوين الطويلة جداً (أقل من 70 حرف)</li>
            <li>• اجعل العنوان جذاباً ويحتوي على الكلمات المفتاحية</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
} 