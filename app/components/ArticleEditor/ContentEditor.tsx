'use client';

import React, { useState } from 'react';
import { 
  Type, Quote, Image, Video, List, Link, Palette, Plus,
  ArrowUp, ArrowDown, Trash2, MessageSquare, Hash, Sparkles,
  Brain, RefreshCw, Upload, Play, ExternalLink
} from 'lucide-react';

interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'image' | 'video' | 'tweet' | 'list' | 'link' | 'highlight';
  content: any;
  order: number;
}

interface ContentEditorProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
  onGenerateTitle: () => void;
  onGenerateDescription: () => void;
  onGenerateKeywords: () => void;
  aiLoading: { [key: string]: boolean };
  onAddBlock: (type: ContentBlock['type']) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDeleteBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, content: any) => void;
}

export default function ContentEditor({
  formData,
  setFormData,
  categories,
  onGenerateTitle,
  onGenerateDescription,
  onGenerateKeywords,
  aiLoading,
  onAddBlock,
  onMoveBlock,
  onDeleteBlock,
  onUpdateBlock
}: ContentEditorProps) {
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  const blockTypes = [
    { type: 'paragraph', name: 'فقرة نصية', icon: Type, color: 'blue' },
    { type: 'heading', name: 'عنوان فرعي', icon: Hash, color: 'purple' },
    { type: 'quote', name: 'اقتباس', icon: Quote, color: 'gray' },
    { type: 'image', name: 'صورة', icon: Image, color: 'green' },
    { type: 'video', name: 'فيديو', icon: Video, color: 'red' },
    { type: 'tweet', name: 'تغريدة', icon: MessageSquare, color: 'cyan' },
    { type: 'list', name: 'قائمة', icon: List, color: 'orange' },
    { type: 'link', name: 'رابط', icon: Link, color: 'indigo' },
    { type: 'highlight', name: 'نص مميز', icon: Palette, color: 'yellow' }
  ] as const;

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    if (!draggedBlock || draggedBlock === targetBlockId) return;

    const blocks = [...formData.content_blocks];
    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock);
    const targetIndex = blocks.findIndex(b => b.id === targetBlockId);
    
    // نقل البلوك
    const [draggedItem] = blocks.splice(draggedIndex, 1);
    blocks.splice(targetIndex, 0, draggedItem);
    
    // إعادة ترقيم
    blocks.forEach((block, i) => block.order = i);
    
    setFormData(prev => ({ ...prev, content_blocks: blocks }));
    setDraggedBlock(null);
  };

  const getBlockIcon = (type: ContentBlock['type']) => {
    const blockType = blockTypes.find(bt => bt.type === type);
    return blockType ? blockType.icon : Type;
  };

  const getBlockColor = (type: ContentBlock['type']) => {
    const blockType = blockTypes.find(bt => bt.type === type);
    return blockType ? blockType.color : 'gray';
  };

  return (
    <div className="space-y-6">
      {/* الحقول الأساسية */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">المعلومات الأساسية</h2>
        
        <div className="space-y-6">
          {/* العنوان الرئيسي */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                العنوان الرئيسي <span className="text-red-500">*</span>
              </label>
              <button
                onClick={onGenerateTitle}
                disabled={aiLoading.title}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
              >
                {aiLoading.title ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                توليد بالذكاء الاصطناعي
              </button>
            </div>
            <textarea
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="اكتب عنواناً جذاباً ومميزاً..."
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {formData.title.length}/100 حرف
              </span>
              {formData.title.length > 60 && (
                <span className="text-sm text-amber-600">
                  العنوان طويل - يُنصح بأقل من 60 حرف
                </span>
              )}
            </div>
          </div>

          {/* العنوان الفرعي */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              العنوان الفرعي (اختياري)
            </label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="عنوان فرعي يوضح تفاصيل إضافية..."
              maxLength={150}
            />
          </div>

          {/* الوصف الموجز */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                الوصف الموجز (Meta Description)
              </label>
              <button
                onClick={onGenerateDescription}
                disabled={aiLoading.description}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
              >
                {aiLoading.description ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                توليد تلقائي
              </button>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="وصف موجز يظهر في نتائج البحث ووسائل التواصل..."
              maxLength={160}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {formData.description.length}/160 حرف
              </span>
              {formData.description.length > 155 && (
                <span className="text-sm text-red-600">
                  قارب على الحد الأقصى
                </span>
              )}
            </div>
          </div>

          {/* التصنيف */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                التصنيف الرئيسي <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>اختر التصنيف...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name_ar}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                التصنيف الفرعي (اختياري)
              </label>
              <select
                value={formData.subcategory_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory_id: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.category_id}
              >
                <option value="">بدون تصنيف فرعي</option>
                {/* سيتم تعبئتها حسب التصنيف الرئيسي */}
              </select>
            </div>
          </div>

          {/* خيارات سريعة */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_breaking}
                onChange={(e) => setFormData(prev => ({ ...prev, is_breaking: e.target.checked }))}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                🚨 خبر عاجل
              </span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                ⭐ خبر رئيسي
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* محرر المحتوى */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">محرر المحتوى</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formData.content_blocks.length} بلوك
            </span>
          </div>
        </div>

        {/* أزرار إضافة البلوكات */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-8 p-4 bg-gray-50 rounded-xl">
          {blockTypes.map((blockType) => {
            const Icon = blockType.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
              purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
              gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              green: 'bg-green-100 text-green-600 hover:bg-green-200',
              red: 'bg-red-100 text-red-600 hover:bg-red-200',
              cyan: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200',
              orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
              indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
              yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            };
            
            return (
              <button
                key={blockType.type}
                onClick={() => onAddBlock(blockType.type)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:scale-105 ${colorClasses[blockType.color]}`}
                title={blockType.name}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium hidden md:block">
                  {blockType.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* البلوكات */}
        <div className="space-y-4">
          {formData.content_blocks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Type className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">ابدأ بإضافة محتوى</p>
              <p className="text-sm">اختر نوع البلوك من الأزرار أعلاه لبدء الكتابة</p>
            </div>
          ) : (
            formData.content_blocks
              .sort((a, b) => a.order - b.order)
              .map((block, index) => (
                <ContentBlockEditor
                  key={block.id}
                  block={block}
                  index={index}
                  totalBlocks={formData.content_blocks.length}
                  onUpdate={onUpdateBlock}
                  onMove={onMoveBlock}
                  onDelete={onDeleteBlock}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={draggedBlock === block.id}
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
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const Icon = {
    paragraph: Type,
    heading: Hash,
    quote: Quote,
    image: Image,
    video: Video,
    tweet: MessageSquare,
    list: List,
    link: Link,
    highlight: Palette
  }[block.type] || Type;

  const colorClasses = {
    paragraph: 'border-blue-200 bg-blue-50/50',
    heading: 'border-purple-200 bg-purple-50/50',
    quote: 'border-gray-200 bg-gray-50/50',
    image: 'border-green-200 bg-green-50/50',
    video: 'border-red-200 bg-red-50/50',
    tweet: 'border-cyan-200 bg-cyan-50/50',
    list: 'border-orange-200 bg-orange-50/50',
    link: 'border-indigo-200 bg-indigo-50/50',
    highlight: 'border-yellow-200 bg-yellow-50/50'
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, block.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, block.id)}
      className={`border-2 border-dashed rounded-xl transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      } ${colorClasses[block.type] || 'border-gray-200 bg-gray-50/50'}`}
    >
      <div className="p-4">
        {/* هيدر البلوك */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {block.type === 'paragraph' ? 'فقرة نصية' :
                 block.type === 'heading' ? 'عنوان فرعي' :
                 block.type === 'quote' ? 'اقتباس' :
                 block.type === 'image' ? 'صورة' :
                 block.type === 'video' ? 'فيديو' :
                 block.type === 'tweet' ? 'تغريدة' :
                 block.type === 'list' ? 'قائمة' :
                 block.type === 'link' ? 'رابط' :
                 block.type === 'highlight' ? 'نص مميز' : 'بلوك'}
              </span>
            </div>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
              #{index + 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? '🔽' : '▶️'}
            </button>
            
            <button
              onClick={() => onMove(block.id, 'up')}
              disabled={index === 0}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-30"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onMove(block.id, 'down')}
              disabled={index === totalBlocks - 1}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-30"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onDelete(block.id)}
              className="p-1 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* محتوى البلوك */}
        {isExpanded && (
          <BlockContentEditor
            block={block}
            onUpdate={onUpdate}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
    </div>
  );
}

// محرر محتوى البلوك حسب النوع
function BlockContentEditor({ block, onUpdate, isEditing, setIsEditing }) {
  const handleUpdate = (newContent) => {
    onUpdate(block.id, newContent);
  };

  switch (block.type) {
    case 'paragraph':
      return (
        <textarea
          value={block.content.text || ''}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          placeholder="اكتب فقرة نصية..."
        />
      );

    case 'heading':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <select
              value={block.content.level || 2}
              onChange={(e) => handleUpdate({ ...block.content, level: Number(e.target.value) })}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
            <span className="text-sm text-gray-500">مستوى العنوان</span>
          </div>
          <input
            type="text"
            value={block.content.text || ''}
            onChange={(e) => handleUpdate({ ...block.content, text: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="اكتب العنوان الفرعي..."
          />
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-3">
          <textarea
            value={block.content.text || ''}
            onChange={(e) => handleUpdate({ ...block.content, text: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="اكتب الاقتباس..."
          />
          <input
            type="text"
            value={block.content.author || ''}
            onChange={(e) => handleUpdate({ ...block.content, author: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="مصدر الاقتباس (اختياري)"
          />
        </div>
      );

    case 'image':
      return (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {block.content.url ? (
              <div className="space-y-3">
                <img 
                  src={block.content.url} 
                  alt={block.content.alt || ''}
                  className="max-w-full h-auto rounded-lg mx-auto"
                />
                <button
                  onClick={() => handleUpdate({ ...block.content, url: '' })}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  إزالة الصورة
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-gray-600">اسحب صورة هنا أو</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  اختر من الجهاز
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={block.content.caption || ''}
              onChange={(e) => handleUpdate({ ...block.content, caption: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="وصف الصورة"
            />
            <input
              type="text"
              value={block.content.alt || ''}
              onChange={(e) => handleUpdate({ ...block.content, alt: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="النص البديل (Alt text)"
            />
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-red-600" />
            <input
              type="url"
              value={block.content.url || ''}
              onChange={(e) => handleUpdate({ ...block.content, url: e.target.value })}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="رابط الفيديو (YouTube, Vimeo, etc.)"
            />
          </div>
          <input
            type="text"
            value={block.content.caption || ''}
            onChange={(e) => handleUpdate({ ...block.content, caption: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="وصف الفيديو"
          />
        </div>
      );

    case 'list':
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`list-${block.id}`}
                checked={!block.content.ordered}
                onChange={() => handleUpdate({ ...block.content, ordered: false })}
                className="text-orange-600"
              />
              <span className="text-sm">قائمة نقطية</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`list-${block.id}`}
                checked={block.content.ordered}
                onChange={() => handleUpdate({ ...block.content, ordered: true })}
                className="text-orange-600"
              />
              <span className="text-sm">قائمة مرقمة</span>
            </label>
          </div>
          
          <div className="space-y-2">
            {(block.content.items || ['']).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-500 text-sm w-6">
                  {block.content.ordered ? `${index + 1}.` : '•'}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(block.content.items || [''])];
                    newItems[index] = e.target.value;
                    handleUpdate({ ...block.content, items: newItems });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                  placeholder={`العنصر ${index + 1}`}
                />
                <button
                  onClick={() => {
                    const newItems = [...(block.content.items || [''])];
                    newItems.splice(index, 1);
                    handleUpdate({ ...block.content, items: newItems.length ? newItems : [''] });
                  }}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => {
                const newItems = [...(block.content.items || ['']), ''];
                handleUpdate({ ...block.content, items: newItems });
              }}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              إضافة عنصر
            </button>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
          محرر هذا النوع من البلوكات قيد التطوير
        </div>
      );
  }
} 