'use client';

import React from 'react';
import { Star, CheckCircle, AlertTriangle, XCircle, Target, FileText, Image, Hash } from 'lucide-react';

interface QualityPanelProps {
  qualityScore: number;
}

export default function QualityPanel({ qualityScore }: QualityPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertTriangle;
    return XCircle;
  };

  const ScoreIcon = getScoreIcon(qualityScore);

  const qualityChecks = [
    {
      name: 'العنوان',
      icon: FileText,
      passed: qualityScore >= 20,
      weight: 20,
      description: 'عنوان جذاب ومناسب للسيو'
    },
    {
      name: 'الوصف',
      icon: Hash,
      passed: qualityScore >= 35,
      weight: 15,
      description: 'وصف موجز وواضح'
    },
    {
      name: 'المحتوى',
      icon: FileText,
      passed: qualityScore >= 65,
      weight: 30,
      description: 'محتوى كافي ومفيد'
    },
    {
      name: 'الصور',
      icon: Image,
      passed: qualityScore >= 80,
      weight: 15,
      description: 'صور توضيحية مناسبة'
    },
    {
      name: 'التصنيف',
      icon: Target,
      passed: qualityScore >= 90,
      weight: 10,
      description: 'تصنيف مناسب'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-3xl p-6 shadow-xl border border-green-100/50 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">🎯 تحليل الجودة الذكي</h3>
          <p className="text-gray-600 text-sm">تقييم شامل لمحتوى مقالك</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl font-bold text-lg shadow-lg ${getScoreColor(qualityScore)}`}>
          <ScoreIcon className="w-6 h-6" />
          {qualityScore}%
        </div>
      </div>

      {/* مؤشر الجودة */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">النقاط الإجمالية</span>
          <span className="text-sm text-gray-500">{qualityScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              qualityScore >= 80 ? 'bg-green-500' :
              qualityScore >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${qualityScore}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {qualityScore >= 80 ? '🎉 ممتاز! المقال جاهز للنشر' :
           qualityScore >= 60 ? '⚠️ جيد، لكن يمكن تحسينه' :
           '❌ يحتاج تحسينات قبل النشر'}
        </div>
      </div>

      {/* قائمة فحص الجودة */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">معايير التقييم:</h4>
        {qualityChecks.map((check, index) => {
          const Icon = check.icon;
          return (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                check.passed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {check.passed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{check.name}</span>
                  <span className="text-xs text-gray-500">{check.weight} نقطة</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{check.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* نصائح للتحسين */}
      {qualityScore < 80 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 نصائح للتحسين:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {qualityScore < 20 && <li>• أضف عنوان جذاب وواضح</li>}
            {qualityScore < 35 && <li>• اكتب وصف موجز يلخص المقال</li>}
            {qualityScore < 65 && <li>• أضف المزيد من الفقرات والمحتوى</li>}
            {qualityScore < 80 && <li>• أضف صورة توضيحية واحدة على الأقل</li>}
            {qualityScore < 90 && <li>• تأكد من اختيار التصنيف المناسب</li>}
          </ul>
        </div>
      )}
    </div>
  );
} 