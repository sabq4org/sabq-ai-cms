'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { 
  Sparkles, Brain, RefreshCw, Type, Plus, ArrowUp, ArrowDown, 
  Trash2, Image, Video, Quote, Hash, List, Link, Palette, MessageSquare,
  ChevronDown, ChevronRight, FileText, Tag, AlignLeft, Layers,
  PenTool, Wand2, BookOpen, Award, Zap, Target
} from 'lucide-react';

interface ContentEditorProps {
  formData: any;
  setFormData: (data: any | ((prev: any) => any)) => void;
  categories: any[];
  onGenerateTitle: () => void;
  onGenerateDescription: () => void;
  aiLoading: { [key: string]: boolean };
}

export default function ContentEditor({
  formData,
  setFormData,
  categories,
  onGenerateTitle,
  onGenerateDescription,
  aiLoading
}: ContentEditorProps) {

  // دوال AI الجديدة
  const generateCategorySuggestion = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({ ...prev, aiLoading: { ...prev.aiLoading, category: true } }));
    try {
      // محاكاة استدعاء AI لتحليل المحتوى واقتراح التصنيف
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // تحليل المحتوى الموجود
      const contentText = formData.content_blocks
        ?.filter((b: any) => b.type === 'paragraph')
        .map((b: any) => b.content?.text || '')
        .join(' ');
      
      // اقتراح التصنيف بناءً على المحتوى
      let suggestedCategoryId = 1; // افتراضي
      let suggestedCategoryName = '';
      
      if (contentText.includes('تقنية') || contentText.includes('ذكاء اصطناعي')) {
        suggestedCategoryId = categories.find((c: any) => c.name_ar.includes('تقنية'))?.id || 1;
        suggestedCategoryName = 'التقنية والابتكار';
      } else if (contentText.includes('رياضة') || contentText.includes('دوري')) {
        suggestedCategoryId = categories.find((c: any) => c.name_ar.includes('رياضة'))?.id || 2;
        suggestedCategoryName = 'الرياضة';
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData((prev: any) => ({ 
        ...prev, 
        category_id: suggestedCategoryId,
        ai_category_suggestion: suggestedCategoryName
      }));
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData((prev: any) => ({ ...prev, aiLoading: { ...prev.aiLoading, category: false } }));
    }
  };

  const generateAISummary = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({ ...prev, aiLoading: { ...prev.aiLoading, summary: true } }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // جمع المحتوى من جميع البلوكات
      const contentText = formData.content_blocks
        ?.filter((b: any) => b.type === 'paragraph')
        .map((b: any) => b.content?.text || '')
        .join(' ');
      
      // توليد ملخص ذكي
      const summary = contentText.length > 100 
        ? `ملخص تلقائي: ${contentText.substring(0, 150)}...`
        : 'يحتاج المقال إلى محتوى أكثر لتوليد ملخص دقيق';
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData((prev: any) => ({ ...prev, ai_summary: summary }));
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData((prev: any) => ({ ...prev, aiLoading: { ...prev.aiLoading, summary: false } }));
    }
  };

  // دوال إدارة البلوكات الحقيقية
  const addBlock = (type: string) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      order: (formData.content_blocks || []).length
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      content_blocks: [...(prev.content_blocks || []), newBlock]
    }));
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'paragraph': return { text: '' };
      case 'heading': return { text: '', level: 2 };
      case 'quote': return { text: '', author: '' };
      case 'image': return { url: '', caption: '', alt: '' };
      case 'video': return { url: '', caption: '' };
      case 'tweet': return { url: '' };
      case 'list': return { items: [''], ordered: false };
      case 'link': return { url: '', text: '' };
      case 'highlight': return { text: '', color: '#FEF3C7' };
      default: return {};
    }
  };

  const updateBlock = (blockId: string, content: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      content_blocks: (prev.content_blocks || []).map((b: any) => 
        b.id === blockId ? { ...b, content } : b
      )
    }));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...(formData.content_blocks || [])];
    const index = blocks.findIndex((b: any) => b.id === blockId);
    
    if (direction === 'up' && index > 0) {
      [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }
    
    // إعادة ترقيم البلوكات
    blocks.forEach((block: any, i: number) => block.order = i);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({ ...prev, content_blocks: blocks }));
  };

  const deleteBlock = (blockId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      content_blocks: (prev.content_blocks || []).filter((b: any) => b.id !== blockId)
    }));
  };
  return (
    <div className="space-y-6">
      {/* معلومات المقال الأساسية - تصميم محسن مثل تاب AI */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header مميز */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">معلومات المقال الأساسية</h2>
              <p className="text-blue-100">املأ البيانات الأساسية لمقالك الجديد</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* العنوان الرئيسي */}
            <div className="md:col-span-2">
              <div className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">العنوان الرئيسي</h3>
                      <p className="text-sm text-gray-600">عنوان جذاب يلفت انتباه القراء</p>
                    </div>
                  </div>
                  <button
                    onClick={onGenerateTitle}
                    disabled={aiLoading.title}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {aiLoading.title ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    توليد بـ AI
                  </button>
                </div>
                <textarea
                  value={formData.title}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300"
                  rows={2}
                  placeholder="اكتب عنواناً جذاباً ومميزاً..."
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{formData.title.length}/100 حرف</span>
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          formData.title.length < 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                          formData.title.length <= 60 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          formData.title.length <= 80 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${(formData.title.length / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                  {formData.title.length > 60 && (
                    <span className="text-sm text-amber-600 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      العنوان طويل نسبياً
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* العنوان الفرعي */}
            <div>
              <div className="group relative bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200 hover:shadow-lg transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <AlignLeft className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">العنوان الفرعي</h3>
                    <p className="text-sm text-gray-600">معلومات إضافية (اختياري)</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="عنوان فرعي توضيحي..."
                  maxLength={150}
                />
              </div>
            </div>

            {/* الوصف الموجز */}
            <div>
              <div className="group relative bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">الوصف الموجز</h3>
                      <p className="text-sm text-gray-600">يظهر في نتائج البحث</p>
                    </div>
                  </div>
                  <button
                    onClick={onGenerateDescription}
                    disabled={aiLoading.description}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {aiLoading.description ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Brain className="w-3 h-3" />
                    )}
                    AI
                  </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-300"
                  rows={3}
                  placeholder="وصف موجز يلخص محتوى المقال..."
                  maxLength={160}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-600">
                    {formData.description.length}/160 حرف
                  </span>
                  {formData.description.length > 155 && (
                    <span className="text-sm text-red-600">
                      قارب على الحد الأقصى
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* التصنيف */}
            <div>
              <div className="group relative bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">التصنيف الرئيسي</h3>
                      <p className="text-sm text-gray-600">حدد قسم المقال</p>
                    </div>
                  </div>
                  <button
                    onClick={generateCategorySuggestion}
                    disabled={aiLoading?.category}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {aiLoading?.category ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Brain className="w-3 h-3" />
                    )}
                    اقتراح
                  </button>
                </div>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, category_id: Number(e.target.value) }))}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'left 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingLeft: '3rem'
                  }}
                >
                  <option value="">اختر التصنيف...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name_ar}
                    </option>
                  ))}
                </select>
                {formData.ai_category_suggestion && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      اقتراح AI: {formData.ai_category_suggestion}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* التصنيف الفرعي */}
            <div>
              <div className="group relative bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">التصنيف الفرعي</h3>
                    <p className="text-sm text-gray-600">تصنيف أكثر دقة</p>
                  </div>
                </div>
                <select
                  value={formData.subcategory_id || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, subcategory_id: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={!formData.category_id}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'left 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingLeft: '3rem'
                  }}
                >
                  <option value="">بدون تصنيف فرعي</option>
                </select>
              </div>
            </div>

            {/* الصورة المميزة */}
            <div className="md:col-span-2">
              <div className="group relative bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">الصورة المميزة</h3>
                    <p className="text-sm text-gray-600">تظهر في واجهة المستخدم وقوائم المقالات</p>
                  </div>
                </div>
                
                {formData.featured_image ? (
                  <div className="relative">
                    <img 
                      src={formData.featured_image} 
                      alt="الصورة المميزة" 
                      className="w-full h-64 object-cover rounded-xl shadow-md"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => setFormData((prev: any) => ({ ...prev, featured_image: '' }))}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-4 p-4 bg-white/80 rounded-xl">
                      <input
                        type="text"
                        value={formData.featured_image_alt || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, featured_image_alt: e.target.value }))}
                        className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                        placeholder="النص البديل للصورة (لتحسين SEO)"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-all duration-300">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">اسحب وأفلت الصورة هنا أو</p>
                      <label className="cursor-pointer">
                        <span className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 inline-block shadow-md hover:shadow-lg transform hover:scale-105">
                          اختر صورة
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // في بيئة حقيقية، سترفع الملف إلى السيرفر
                              // هنا سنستخدم URL مؤقت للمعاينة
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData((prev: any) => ({ 
                                  ...prev, 
                                  featured_image: reader.result as string 
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gradient-to-r from-pink-50 to-purple-50 text-gray-600">أو</span>
                      </div>
                    </div>
                    
                    <div>
                      <input
                        type="url"
                        value={formData.featured_image_url || ''}
                        onChange={(e) => {
                          const url = e.target.value;
                          setFormData((prev: any) => ({ 
                            ...prev, 
                            featured_image_url: url,
                            featured_image: url // استخدم URL مباشرة
                          }));
                        }}
                        className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                        placeholder="أدخل رابط الصورة..."
                        dir="ltr"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        يُفضل استخدام صور بحجم 1200x630 بكسل لأفضل عرض
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* خيارات العرض المميز */}
            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  خيارات العرض المميز
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="group relative bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_breaking}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, is_breaking: e.target.checked }))}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">خبر عاجل</h4>
                        <p className="text-sm text-gray-600">عرض في الشريط العاجل</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="group relative bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">خبر رئيسي</h4>
                        <p className="text-sm text-gray-600">إبراز في الصفحة الرئيسية</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ملخص AI */}
            {formData.content_blocks?.length > 0 && (
              <div className="md:col-span-2">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-indigo-600" />
                      ملخص ذكي بواسطة AI
                    </h3>
                    <button
                      onClick={generateAISummary}
                      disabled={aiLoading?.summary}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      {aiLoading?.summary ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      توليد ملخص
                    </button>
                  </div>
                  {formData.ai_summary && (
                    <div className="p-4 bg-white/70 rounded-xl">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{formData.ai_summary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* محرر المحتوى */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <PenTool className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">محرر المحتوى الذكي</h2>
            <p className="text-gray-600">أنشئ محتوى احترافي بأدوات متقدمة</p>
          </div>
        </div>

        {/* أزرار إضافة البلوكات - تصميم محسن */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            أضف عناصر المحتوى
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'paragraph', name: 'فقرة نصية', icon: Type, color: 'from-blue-500 to-blue-600', desc: 'نص عادي' },
              { type: 'heading', name: 'عنوان فرعي', icon: Hash, color: 'from-purple-500 to-purple-600', desc: 'H1-H4' },
              { type: 'quote', name: 'اقتباس', icon: Quote, color: 'from-green-500 to-green-600', desc: 'نص مميز' },
              { type: 'image', name: 'صورة', icon: Image, color: 'from-orange-500 to-orange-600', desc: 'JPG/PNG' },
              { type: 'video', name: 'فيديو', icon: Video, color: 'from-red-500 to-red-600', desc: 'YouTube' },
              { type: 'list', name: 'قائمة', icon: List, color: 'from-cyan-500 to-cyan-600', desc: 'نقاط/أرقام' },
              { type: 'link', name: 'رابط', icon: Link, color: 'from-indigo-500 to-indigo-600', desc: 'URL' },
              { type: 'highlight', name: 'تمييز', icon: Palette, color: 'from-yellow-500 to-yellow-600', desc: 'نص ملون' }
            ].map((blockType) => {
              const Icon = blockType.icon;
              return (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className={`group relative bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-transparent hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${blockType.color} opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-10 h-10 bg-gradient-to-r ${blockType.color} rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:bg-white/20`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-white">{blockType.name}</h4>
                    <p className="text-xs text-gray-500 group-hover:text-white/80 mt-1">{blockType.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* منطقة المحتوى */}
        <div className="space-y-4">
          {(!formData.content_blocks || formData.content_blocks.length === 0) ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-12 text-center">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full blur-3xl"></div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <PenTool className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">ابدأ كتابة محتوى مميز</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">اختر نوع المحتوى من الأزرار أعلاه لبدء إنشاء مقال احترافي</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => addBlock('paragraph')}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Type className="w-5 h-5" />
                    إضافة فقرة
                  </button>
                  <button
                    onClick={() => addBlock('heading')}
                    className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Hash className="w-5 h-5" />
                    إضافة عنوان
                  </button>
                </div>
              </div>
            </div>
          ) : (
            formData.content_blocks.map((block: any, index: number) => (
              <ContentBlockEditor
                key={block.id}
                block={block}
                index={index}
                totalBlocks={formData.content_blocks.length}
                onUpdate={updateBlock}
                onMove={moveBlock}
                onDelete={deleteBlock}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// مكون محرر البلوك الفردي
function ContentBlockEditor({ 
  block, 
  index, 
  totalBlocks, 
  onUpdate, 
  onMove, 
  onDelete 
}: {
  block: any;
  index: number;
  totalBlocks: number;
  onUpdate: (blockId: string, content: any) => void;
  onMove: (blockId: string, direction: 'up' | 'down') => void;
  onDelete: (blockId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getBlockInfo = (type: string) => {
    const blockTypes: any = {
      paragraph: { name: 'فقرة نصية', icon: Type },
      heading: { name: 'عنوان فرعي', icon: Hash },
      quote: { name: 'اقتباس', icon: Quote },
      image: { name: 'صورة', icon: Image },
      video: { name: 'فيديو', icon: Video },
      list: { name: 'قائمة', icon: List },
      link: { name: 'رابط', icon: Link }
    };
    return blockTypes[type] || blockTypes.paragraph;
  };

  const blockInfo = getBlockInfo(block.type);
  const Icon = blockInfo.icon;

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="p-4">
        {/* هيدر البلوك */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">{blockInfo.name}</h3>
              <p className="text-xs text-gray-500">البلوك #{index + 1}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded"
            >
              {isExpanded ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => onMove(block.id, 'up')}
              disabled={index === 0}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onMove(block.id, 'down')}
              disabled={index === totalBlocks - 1}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onDelete(block.id)}
              className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* محتوى البلوك */}
        {isExpanded && (
          <div className="border-t border-gray-100 pt-4">
            <BlockContentEditor
              block={block}
              onUpdate={onUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// محرر محتوى البلوك حسب النوع
function BlockContentEditor({ block, onUpdate }: { block: any; onUpdate: (blockId: string, content: any) => void }) {
  const handleUpdate = (newContent: any) => {
    onUpdate(block.id, newContent);
  };

  switch (block.type) {
    case 'paragraph':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">محتوى الفقرة:</label>
          <textarea
            value={block.content?.text || ''}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            placeholder="اكتب محتوى الفقرة هنا..."
          />
          <div className="text-xs text-gray-500">
            {block.content?.text?.length || 0} حرف
          </div>
        </div>
      );

    case 'heading':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">مستوى العنوان:</label>
            <select
              value={block.content?.level || 2}
              onChange={(e) => handleUpdate({ ...block.content, level: Number(e.target.value) })}
              className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">نص العنوان:</label>
            <input
              type="text"
              value={block.content?.text || ''}
              onChange={(e) => handleUpdate({ ...block.content, text: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="اكتب العنوان الفرعي..."
            />
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">نص الاقتباس:</label>
            <textarea
              value={block.content?.text || ''}
              onChange={(e) => handleUpdate({ ...block.content, text: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              placeholder="اكتب الاقتباس..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">مصدر الاقتباس:</label>
            <input
              type="text"
              value={block.content?.author || ''}
              onChange={(e) => handleUpdate({ ...block.content, author: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="اسم الشخص أو المصدر (اختياري)"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-50 rounded-md text-center border border-gray-200">
          <Type className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-800 mb-1">محرر هذا النوع قيد التطوير</h3>
          <p className="text-xs text-gray-600">سيتم إضافة المزيد من الأنواع قريباً</p>
        </div>
      );
  }
}

 