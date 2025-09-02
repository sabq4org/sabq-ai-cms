'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useDarkMode } from "@/hooks/useDarkMode";
import { 
  Loader2, ExternalLink, Eye, EyeOff, Sparkles, BarChart3, 
  CheckCircle, XCircle, Brain, Globe, Users, TrendingUp,
  Network, Zap, Target, BookOpen, Settings2
} from 'lucide-react';

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
  personalizedScore?: number;
  isPersonalized?: boolean;
}

interface EnhancedAnalysisData {
  entities: SmartLink[];
  terms: any[];
  totalMatches: number;
  processingTime: number;
  aiSuggestions?: any[];
  knowledgeGraph?: {
    nodes: any[];
    edges: any[];
    totalConnections: number;
    centralNodes: any[];
  };
  personalization?: {
    personalizedEntities: SmartLink[];
    userInterests: any[];
  };
  analytics?: {
    totalInteractions: number;
    topTrending: any[];
    clickRates: any[];
    avgClickRate: number;
  };
  metadata?: {
    language: string;
    languageName: string;
    enabledFeatures: {
      ai: boolean;
      personalization: boolean;
      knowledgeGraph: boolean;
      analytics: boolean;
    };
    textStats: {
      originalLength: number;
      cleanedLength: number;
      wordsCount: number;
    };
  };
}

interface EnhancedSmartLinksPanelProps {
  isAnalyzing: boolean;
  analysisData: EnhancedAnalysisData | null;
  onAnalyzeText: () => void;
  onApplyLink: (link: SmartLink) => void;
  onRejectLink: (linkId: string) => void;
  onToggleLinks: (enabled: boolean) => void;
  isEnabled: boolean;
  
  // إعدادات متقدمة
  settings: {
    enableAI: boolean;
    enablePersonalization: boolean;
    maxSuggestions: number;
    language: 'ar' | 'en';
  };
  onSettingsChange: (settings: any) => void;
}

export default function EnhancedSmartLinksPanel({
  isAnalyzing,
  analysisData,
  onAnalyzeText,
  onApplyLink,
  onRejectLink,
  onToggleLinks,
  isEnabled,
  settings,
  onSettingsChange
}: EnhancedSmartLinksPanelProps) {
  const { darkMode } = useDarkMode();
  const [appliedLinks, setAppliedLinks] = useState<Set<string>>(new Set());
  const [rejectedLinks, setRejectedLinks] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('links');

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

  const visibleLinks = analysisData?.entities.filter(
    link => !rejectedLinks.has(link.entityId)
  ) || [];

  const renderEntityCard = (link: SmartLink) => (
    <div 
      key={link.entityId}
      className={`p-4 rounded-lg border transition-all ${
        darkMode 
          ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' 
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      } ${link.isPersonalized ? 'ring-2 ring-purple-400' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{link.entity.entity_type.icon}</span>
          <div>
            <h4 className="font-semibold text-sm">{link.entity.name_ar}</h4>
            <p className="text-xs text-gray-500">{link.entity.entity_type.name_ar}</p>
          </div>
          {link.isPersonalized && (
            <Badge variant="secondary" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              مخصص لك
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold ${getConfidenceColor(link.confidence)}`}>
            {Math.round(link.confidence * 100)}%
          </span>
          <span className="text-xs">
            {getImportanceStars(link.entity.importance_score)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {link.entity.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ borderColor: link.entity.entity_type.color }}
          >
            "{link.matchedText}"
          </Badge>
        </div>

        <div className="flex gap-1">
          {!appliedLinks.has(link.entityId) ? (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApplyLink(link)}
                className="text-xs px-2 py-1 h-auto"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                موافق
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectLink(link.entityId)}
                className="text-xs px-2 py-1 h-auto"
              >
                <XCircle className="w-3 h-3 mr-1" />
                رفض
              </Button>
            </>
          ) : (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              تم التطبيق
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  const renderKnowledgeGraph = () => {
    if (!analysisData?.knowledgeGraph) return null;

    const { nodes, edges, totalConnections, centralNodes } = analysisData.knowledgeGraph;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">الكيانات</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{nodes.length}</p>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">الروابط</span>
            </div>
            <p className="text-lg font-bold text-green-600">{totalConnections}</p>
          </div>
        </div>

        {centralNodes.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              الكيانات المحورية
            </h4>
            <div className="space-y-2">
              {centralNodes.slice(0, 3).map((node: any) => (
                <div key={node.id} className={`p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{node.label}</span>
                    <Badge variant="outline" style={{ color: node.color }}>
                      أهمية {node.importance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analysisData?.analytics) return null;

    const { totalInteractions, topTrending, avgClickRate } = analysisData.analytics;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">إجمالي التفاعل</span>
            </div>
            <p className="text-lg font-bold text-purple-600">{totalInteractions}</p>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-orange-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">معدل النقر</span>
            </div>
            <p className="text-lg font-bold text-orange-600">{avgClickRate.toFixed(1)}%</p>
          </div>
        </div>

        {topTrending.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              الأكثر رواجاً
            </h4>
            <div className="space-y-2">
              {topTrending.slice(0, 3).map((trend: any, index: number) => (
                <div key={trend.entity_id} className={`p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">الكيان #{index + 1}</span>
                    <Badge variant="secondary">
                      {trend._count.entity_id} تفاعل
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAISuggestions = () => {
    if (!analysisData?.aiSuggestions?.length) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="font-medium">اقتراحات الذكاء الاصطناعي</span>
          <Badge variant="secondary" className="text-xs">GPT-4</Badge>
        </div>
        
        {analysisData.aiSuggestions.map((suggestion: any, index: number) => (
          <div key={index} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">
                {suggestion.type}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">{suggestion.text}</p>
                <p className="text-xs text-gray-500 mt-1">{suggestion.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    أهمية: {suggestion.importance}/10
                  </Badge>
                  <span className="text-xs text-gray-500">{suggestion.context}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span className="text-sm font-medium">الذكاء الاصطناعي</span>
        </div>
        <Switch 
          checked={settings.enableAI}
          onCheckedChange={(checked) => 
            onSettingsChange({ ...settings, enableAI: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium">التخصيص الشخصي</span>
        </div>
        <Switch 
          checked={settings.enablePersonalization}
          onCheckedChange={(checked) => 
            onSettingsChange({ ...settings, enablePersonalization: checked })
          }
        />
      </div>

      <div>
        <label className="text-sm font-medium flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" />
          عدد الاقتراحات القصوى
        </label>
        <input
          type="range"
          min="5"
          max="20"
          value={settings.maxSuggestions}
          onChange={(e) => 
            onSettingsChange({ ...settings, maxSuggestions: parseInt(e.target.value) })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5</span>
          <span>{settings.maxSuggestions}</span>
          <span>20</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4" />
          اللغة
        </label>
        <select
          value={settings.language}
          onChange={(e) => 
            onSettingsChange({ ...settings, language: e.target.value })
          }
          className={`w-full p-2 rounded border ${
            darkMode 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );

  return (
    <Card className={`w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>الروابط الذكية المتقدمة</span>
            {analysisData?.metadata?.enabledFeatures && (
              <div className="flex gap-1">
                {analysisData.metadata.enabledFeatures.ai && (
                  <Badge variant="secondary" className="text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
                {analysisData.metadata.enabledFeatures.personalization && (
                  <Badge variant="secondary" className="text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    مخصص
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleLinks(!isEnabled)}
              className={`text-xs ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}
            >
              {isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* شريط التحليل */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={onAnalyzeText}
            disabled={isAnalyzing || !isEnabled}
            size="sm"
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري التحليل المتقدم...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                تحليل ذكي متقدم
              </>
            )}
          </Button>
        </div>

        {/* معلومات التحليل */}
        {analysisData?.metadata && (
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between text-xs">
              <span>اللغة: {analysisData.metadata.languageName}</span>
              <span>الكلمات: {analysisData.metadata.textStats.wordsCount}</span>
              <span>الوقت: {analysisData.processingTime}ms</span>
            </div>
          </div>
        )}

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="links" className="text-xs">
              الروابط ({visibleLinks.length})
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="graph" className="text-xs">
              <Network className="w-3 h-3 mr-1" />
              الشبكة
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              التحليلات
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings2 className="w-3 h-3 mr-1" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-3">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>جاري التحليل المتقدم...</span>
              </div>
            ) : visibleLinks.length > 0 ? (
              <>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {visibleLinks.map(renderEntityCard)}
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {visibleLinks.length} من {analysisData?.totalMatches} مطابقة
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>لا توجد روابط ذكية مقترحة</p>
                <p className="text-sm">اضغط على "تحليل ذكي متقدم" لإيجاد روابط</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai">
            {renderAISuggestions()}
          </TabsContent>

          <TabsContent value="graph">
            {renderKnowledgeGraph()}
          </TabsContent>

          <TabsContent value="analytics">
            {renderAnalytics()}
          </TabsContent>

          <TabsContent value="settings">
            {renderSettings()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}