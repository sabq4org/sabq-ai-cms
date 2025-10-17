'use client';

/**
 * 🔗 الشريط الجانبي لاقتراحات الروابط الذكية
 * 
 * يعرض اقتراحات الروابط للمحرر مع إمكانية:
 * - قبول الاقتراح
 * - رفض الاقتراح  
 * - إنشاء صفحة كيان جديدة
 * - معاينة الرابط
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Info, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';

// ========================================
// Types
// ========================================

interface LinkSuggestion {
  id: string;
  text: string;
  normalized: string;
  type: string;
  position: number;
  endPosition: number;
  context: string;
  confidence: number;
  suggestedUrl?: string;
  suggestedEntity?: {
    title: string;
    description?: string;
    sourceType: string;
  };
  action: 'auto' | 'suggest' | 'skip';
  reason: string;
}

interface SmartLinksSidebarProps {
  articleId: string;
  suggestions: LinkSuggestion[];
  onAccept: (suggestion: LinkSuggestion) => void;
  onReject: (suggestion: LinkSuggestion) => void;
  onCreatePage: (suggestion: LinkSuggestion) => void;
  onPreview: (suggestion: LinkSuggestion) => void;
  isLoading?: boolean;
}

// ========================================
// Helper Functions
// ========================================

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'text-green-600 bg-green-50';
  if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 0.9) return 'عالية جداً';
  if (confidence >= 0.7) return 'جيدة';
  return 'منخفضة';
};

const getEntityTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    PERSON: '👤',
    ORGANIZATION: '🏛️',
    PLACE: '📍',
    EVENT: '📅',
    TERM: '📚',
    TOPIC: '💡',
    OTHER: '🔗'
  };
  return icons[type] || '🔗';
};

const getEntityTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    PERSON: 'bg-blue-100 text-blue-800',
    ORGANIZATION: 'bg-green-100 text-green-800',
    PLACE: 'bg-orange-100 text-orange-800',
    EVENT: 'bg-red-100 text-red-800',
    TERM: 'bg-cyan-100 text-cyan-800',
    TOPIC: 'bg-purple-100 text-purple-800',
    OTHER: 'bg-gray-100 text-gray-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

// ========================================
// Components
// ========================================

const SuggestionCard: React.FC<{
  suggestion: LinkSuggestion;
  onAccept: () => void;
  onReject: () => void;
  onCreatePage: () => void;
  onPreview: () => void;
}> = ({ suggestion, onAccept, onReject, onCreatePage, onPreview }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{getEntityTypeIcon(suggestion.type)}</span>
            <h4 className="font-semibold text-gray-900 text-sm">
              {suggestion.text}
            </h4>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* نوع الكيان */}
            <span className={`text-xs px-2 py-0.5 rounded-full ${getEntityTypeColor(suggestion.type)}`}>
              {suggestion.type}
            </span>
            
            {/* مستوى الثقة */}
            <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(suggestion.confidence)}`}>
              {getConfidenceLabel(suggestion.confidence)} ({Math.round(suggestion.confidence * 100)}%)
            </span>
            
            {/* نوع الإجراء */}
            {suggestion.action === 'auto' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                تلقائي
              </span>
            )}
          </div>
        </div>
      </div>

      {/* السبب */}
      <p className="text-xs text-gray-600 mb-3 flex items-start gap-1">
        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <span>{suggestion.reason}</span>
      </p>

      {/* السياق */}
      {isExpanded && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-700 border-r-2 border-blue-400">
          <span className="font-semibold">السياق:</span> "{suggestion.context}"
        </div>
      )}

      {/* الكيان المقترح */}
      {suggestion.suggestedEntity && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-900 mb-1">
                {suggestion.suggestedEntity.title}
              </p>
              {suggestion.suggestedEntity.description && (
                <p className="text-xs text-blue-700 line-clamp-2">
                  {suggestion.suggestedEntity.description}
                </p>
              )}
            </div>
            <button
              onClick={onPreview}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="معاينة"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* الأزرار */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          قبول
        </button>
        
        {!suggestion.suggestedEntity && (
          <button
            onClick={onCreatePage}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            قبول + إنشاء صفحة
          </button>
        )}
        
        <button
          onClick={onReject}
          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          title="رفض"
        >
          <XCircle className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-xs"
        >
          {isExpanded ? 'أقل' : 'المزيد'}
        </button>
      </div>
    </div>
  );
};

// ========================================
// Main Component
// ========================================

export const SmartLinksSidebar: React.FC<SmartLinksSidebarProps> = ({
  articleId,
  suggestions,
  onAccept,
  onReject,
  onCreatePage,
  onPreview,
  isLoading = false
}) => {
  const [filter, setFilter] = useState<'all' | 'auto' | 'suggest'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'position'>('confidence');

  // تصفية وترتيب الاقتراحات
  const filteredSuggestions = suggestions
    .filter(s => filter === 'all' || s.action === filter)
    .sort((a, b) => {
      if (sortBy === 'confidence') {
        return b.confidence - a.confidence;
      }
      return a.position - b.position;
    });

  // إحصائيات
  const stats = {
    total: suggestions.length,
    auto: suggestions.filter(s => s.action === 'auto').length,
    suggest: suggestions.filter(s => s.action === 'suggest').length,
    avgConfidence: suggestions.length > 0
      ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
      : 0
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            اقتراحات الروابط الذكية
          </h3>
          {isLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-700">إجمالي</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.auto}</div>
            <div className="text-xs text-green-700">تلقائي</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.suggest}</div>
            <div className="text-xs text-yellow-700">مقترح</div>
          </div>
        </div>

        {/* متوسط الثقة */}
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <div className="text-sm text-gray-600">
            متوسط الثقة: <span className="font-bold">{Math.round(stats.avgConfidence * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-700">تصفية:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('auto')}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              filter === 'auto'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            تلقائي
          </button>
          <button
            onClick={() => setFilter('suggest')}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              filter === 'suggest'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            مقترح
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">ترتيب:</span>
          <button
            onClick={() => setSortBy('confidence')}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              sortBy === 'confidence'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            حسب الثقة
          </button>
          <button
            onClick={() => setSortBy('position')}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              sortBy === 'position'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            حسب الموقع
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {isLoading ? 'جاري التحليل...' : 'لا توجد اقتراحات'}
            </p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion, index) => (
            <SuggestionCard
              key={`${suggestion.position}-${index}`}
              suggestion={suggestion}
              onAccept={() => onAccept(suggestion)}
              onReject={() => onReject(suggestion)}
              onCreatePage={() => onCreatePage(suggestion)}
              onPreview={() => onPreview(suggestion)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{filteredSuggestions.length} اقتراح</span>
          <a
            href="/admin/smart-links/settings"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            الإعدادات
          </a>
        </div>
      </div>
    </div>
  );
};

export default SmartLinksSidebar;

