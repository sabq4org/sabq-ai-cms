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
      {/* الحقول الأساسية - التصميم المحسن */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-2xl border border-blue-100/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <PenTool className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">معلومات المقال الأساسية</h2>
              <p className="text-blue-100 text-sm mt-1">املأ المعلومات الأساسية لمقالك بدقة</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* العنوان الرئيسي */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-900">
                        العنوان الرئيسي <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500">عنوان جذاب يلفت انتباه القراء</p>
                    </div>
                  </div>
                  <button
                    onClick={onGenerateTitle}
                    disabled={aiLoading.title}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 shadow-md"
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300"
                  rows={2}
                  placeholder="اكتب عنواناً جذاباً ومميزاً..."
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                      {formData.title.length}/100 حرف
                    </span>
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          formData.title.length < 50 ? 'bg-yellow-500' :
                          formData.title.length <= 60 ? 'bg-green-500' :
                          formData.title.length <= 80 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(formData.title.length / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                  {formData.title.length > 60 && (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      العنوان طويل نسبياً
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* العنوان الفرعي */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <AlignLeft className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900">العنوان الفرعي</label>
                    <p className="text-xs text-gray-500">معلومات إضافية (اختياري)</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="عنوان فرعي توضيحي..."
                  maxLength={150}
                />
              </div>
            </div>

            {/* الوصف الموجز */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-900">الوصف الموجز</label>
                      <p className="text-xs text-gray-500">يظهر في نتائج البحث</p>
                    </div>
                  </div>
                  <button
                    onClick={onGenerateDescription}
                    disabled={aiLoading.description}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
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
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-300"
                  rows={3}
                  placeholder="وصف موجز يلخص محتوى المقال..."
                  maxLength={160}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">
                    {formData.description.length}/160 حرف
                  </span>
                  {formData.description.length > 155 && (
                    <span className="text-xs text-red-600">
                      قارب على الحد الأقصى
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* التصنيف */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-900">
                        التصنيف الرئيسي <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500">حدد قسم المقال</p>
                    </div>
                  </div>
                  <button
                    onClick={generateCategorySuggestion}
                    disabled={aiLoading?.category}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50"
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
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'left 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingLeft: '3rem'
                  }}
                >
                  <option value={0}>اختر التصنيف...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name_ar}
                    </option>
                  ))}
                </select>
                {formData.ai_category_suggestion && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-700 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      اقتراح AI: {formData.ai_category_suggestion}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* التصنيف الفرعي */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900">التصنيف الفرعي</label>
                    <p className="text-xs text-gray-500">تصنيف أكثر دقة</p>
                  </div>
                </div>
                <select
                  value={formData.subcategory_id || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, subcategory_id: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
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

            {/* خيارات سريعة */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  خيارات العرض المميز
                </h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.is_breaking}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, is_breaking: e.target.checked }))}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-gray-800">خبر عاجل</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-800">خبر رئيسي</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ملخص AI - جديد */}
            {formData.content_blocks?.length > 0 && (
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-indigo-600" />
                      ملخص ذكي بواسطة AI
                    </h3>
                    <button
                      onClick={generateAISummary}
                      disabled={aiLoading?.summary}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">محرر المحتوى</h2>
        </div>

        {/* أزرار إضافة البلوكات */}
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
          {[
            { type: 'paragraph', name: 'فقرة', icon: Type },
            { type: 'heading', name: 'عنوان', icon: Hash },
            { type: 'quote', name: 'اقتباس', icon: Quote },
            { type: 'image', name: 'صورة', icon: Image },
            { type: 'video', name: 'فيديو', icon: Video },
            { type: 'list', name: 'قائمة', icon: List },
            { type: 'link', name: 'رابط', icon: Link }
          ].map((blockType) => {
            const Icon = blockType.icon;
            return (
              <button
                key={blockType.type}
                onClick={() => addBlock(blockType.type)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
                title={blockType.name}
              >
                <Icon className="w-4 h-4" />
                <span>{blockType.name}</span>
              </button>
            );
          })}
        </div>

        {/* منطقة المحتوى */}
        <div className="space-y-3">
          {(!formData.content_blocks || formData.content_blocks.length === 0) ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ابدأ كتابة مقالك</h3>
              <p className="text-gray-600 mb-4">اختر نوع المحتوى من الأزرار أعلاه</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => addBlock('paragraph')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Type className="w-4 h-4" />
                  إضافة فقرة
                </button>
                <button
                  onClick={() => addBlock('heading')}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Hash className="w-4 h-4" />
                  إضافة عنوان
                </button>
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

 