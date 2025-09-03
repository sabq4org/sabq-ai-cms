'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Eye, EyeOff, Sparkles, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface SmartLink {
  entityId: string;
  matchedText: string;
  startPos: number;
  endPos: number;
  confidence: number;
  entity: {
    id: string;
    name: string;
    name_ar: string;
    entity_type: {
      name: string;
      name_ar: string;
      icon: string;
      color: string;
    };
    description: string;
    importance_score: number;
    slug: string;
    official_website: string;
  };
  suggestedLink: {
    type: 'entity' | 'tooltip' | 'modal' | 'external';
    url?: string;
    tooltip_content?: string;
  };
}

interface SmartLinksPanelProps {
  isAnalyzing: boolean;
  suggestedLinks: SmartLink[];
  onAnalyzeText: () => void;
  onApplyLink: (link: SmartLink) => void;
  onRejectLink: (linkId: string) => void;
  onToggleLinks: (enabled: boolean) => void;
  isEnabled: boolean;
}

export default function SmartLinksPanel({
  isAnalyzing,
  suggestedLinks,
  onAnalyzeText,
  onApplyLink,
  onRejectLink,
  onToggleLinks,
  isEnabled
}: SmartLinksPanelProps) {
  const { darkMode } = useDarkModeContext();
  const [appliedLinks, setAppliedLinks] = useState<Set<string>>(new Set());
  const [rejectedLinks, setRejectedLinks] = useState<Set<string>>(new Set());

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getImportanceStars = (score: number) => {
    return '⭐'.repeat(Math.min(Math.max(Math.round(score / 2), 1), 5));
  };

  const handleApplyLink = (link: SmartLink) => {
    setAppliedLinks(prev => new Set([...prev, link.entityId]));
    onApplyLink(link);
  };

  const handleRejectLink = (linkId: string) => {
    setRejectedLinks(prev => new Set([...prev, linkId]));
    onRejectLink(linkId);
  };

  const visibleLinks = suggestedLinks.filter(
    link => !rejectedLinks.has(link.entityId)
  );

  return (
    <Card className={`w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>الروابط الذكية</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleLinks(!isEnabled)}
              className={`${isEnabled ? 'text-green-600' : 'text-gray-400'}`}
            >
              {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isEnabled ? 'مفعل' : 'معطل'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* زر التحليل */}
        <Button
          onClick={onAnalyzeText}
          disabled={isAnalyzing || !isEnabled}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري التحليل...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 mr-2" />
              تحليل النص وإيجاد الروابط
            </>
          )}
        </Button>

        {/* إحصائيات */}
        {visibleLinks.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="font-bold text-lg">{visibleLinks.length}</div>
              <div className="text-gray-500">مقترح</div>
            </div>
            <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="font-bold text-lg text-green-600">{appliedLinks.size}</div>
              <div className="text-gray-500">مطبق</div>
            </div>
            <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="font-bold text-lg text-red-600">{rejectedLinks.size}</div>
              <div className="text-gray-500">مرفوض</div>
            </div>
          </div>
        )}

        {/* قائمة الروابط المقترحة */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {visibleLinks.map((link) => {
            const isApplied = appliedLinks.has(link.entityId);
            
            return (
              <div
                key={link.entityId}
                className={`p-3 rounded-lg border transition-all ${
                  isApplied 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : darkMode 
                      ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* معلومات الكيان */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{link.entity.entity_type.icon}</span>
                      <span className="font-semibold text-sm">
                        "{link.matchedText}"
                      </span>
                                             <Badge
                         variant="outline"
                         className="text-xs"
                       >
                         {link.entity.entity_type.name_ar}
                       </Badge>
                    </div>
                    
                    <div className="text-sm font-medium mb-1">
                      {link.entity.name_ar || link.entity.name}
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {link.entity.description}
                    </div>

                    {/* معلومات إضافية */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className={`flex items-center gap-1 ${getConfidenceColor(link.confidence)}`}>
                        <span>الثقة:</span>
                        <span className="font-bold">{(link.confidence * 100).toFixed(0)}%</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span>الأهمية:</span>
                        <span>{getImportanceStars(link.entity.importance_score)}</span>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {link.suggestedLink.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراء */}
                <div className="flex gap-2 mt-3">
                  {!isApplied ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApplyLink(link)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        تطبيق
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectLink(link.entityId)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        رفض
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full py-2 text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      تم التطبيق
                    </div>
                  )}
                  
                  {/* زر الزيارة للروابط الخارجية */}
                  {link.entity.official_website && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(link.entity.official_website, '_blank')}
                      className="px-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* رسالة عدم وجود روابط */}
        {!isAnalyzing && visibleLinks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد روابط ذكية مقترحة</p>
            <p className="text-sm">اضغط على "تحليل النص" لإيجاد روابط ذكية</p>
          </div>
        )}

        {/* إعدادات سريعة */}
        {visibleLinks.length > 0 && (
          <div className="border-t pt-3 mt-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  visibleLinks.forEach(link => {
                    if (!appliedLinks.has(link.entityId)) {
                      handleApplyLink(link);
                    }
                  });
                }}
                className="flex-1 text-green-600 border-green-300"
              >
                تطبيق الكل
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  visibleLinks.forEach(link => {
                    if (!appliedLinks.has(link.entityId)) {
                      handleRejectLink(link.entityId);
                    }
                  });
                }}
                className="flex-1 text-red-600 border-red-300"
              >
                رفض الباقي
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 