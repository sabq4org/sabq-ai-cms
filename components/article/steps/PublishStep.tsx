'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, AlertCircle, Zap, Star, Globe, Home, Info } from 'lucide-react';

interface PublishStepProps {
  formData: any;
  setFormData: (data: any) => void;
  darkMode: boolean;
}

export function PublishStep({
  formData,
  setFormData,
  darkMode
}: PublishStepProps) {
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          إعدادات النشر
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          حدد توقيت وطريقة نشر المقال
        </p>
      </div>

      {/* توقيت النشر */}
      <div>
        <Label className="text-base font-medium mb-3 block">توقيت النشر</Label>
        
        <div className="space-y-3">
          <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
            formData.publishType === 'now' 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              value="now"
              checked={formData.publishType === 'now'}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, publishType: e.target.value }))}
              className="w-5 h-5 text-green-600"
            />
            <div className="flex-1">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                نشر فوري
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                سيتم نشر المقال فور الحفظ
              </div>
            </div>
            <Zap className="w-6 h-6 text-green-600" />
          </label>
          
          <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
            formData.publishType === 'scheduled' 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              value="scheduled"
              checked={formData.publishType === 'scheduled'}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, publishType: e.target.value }))}
              className="w-5 h-5 text-blue-600"
            />
            <div className="flex-1">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                جدولة النشر
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                تحديد وقت محدد للنشر
              </div>
            </div>
            <Clock className="w-6 h-6 text-blue-600" />
          </label>
        </div>

        {/* حقل التاريخ والوقت للنشر المجدول */}
        {formData.publishType === 'scheduled' && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Label htmlFor="scheduled-date" className="block mb-2">
              تاريخ ووقت النشر
            </Label>
            <input
              id="scheduled-date"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, scheduledDate: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className={`w-full p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        )}
      </div>

      {/* خيارات العرض */}
      <div>
        <Label className="text-base font-medium mb-3 block">خيارات العرض</Label>
        
        <div className="space-y-3">
          <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
            formData.isBreaking 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }`}>
            <input
              type="checkbox"
              checked={formData.isBreaking}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, isBreaking: e.target.checked }))}
              className="w-5 h-5 text-red-600 rounded"
            />
            <div className="flex-1">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                خبر عاجل
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                سيظهر شريط أحمر مع تنبيه خاص
              </div>
            </div>
            <AlertCircle className="w-6 h-6 text-red-600" />
          </label>
          
          <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
            formData.isFeatured 
              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }`}>
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-5 h-5 text-yellow-600 rounded"
            />
            <div className="flex-1">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                مقال مميز
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                سيظهر في قسم الأخبار البارزة بالصفحة الرئيسية
              </div>
            </div>
            <Star className="w-6 h-6 text-yellow-600" />
          </label>
        </div>
      </div>

      {/* نوع المقال */}
      <div>
        <Label className="text-base font-medium mb-3 block">نطاق المقال</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData((prev: any) => ({ ...prev, type: 'local' }))}
            className={`p-4 rounded-lg border transition-all ${
              formData.type === 'local'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <Home className={`w-6 h-6 mx-auto mb-2 ${
              formData.type === 'local' ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div className={`font-medium ${
              formData.type === 'local' 
                ? 'text-blue-600 dark:text-blue-400' 
                : darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              محلي
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData((prev: any) => ({ ...prev, type: 'international' }))}
            className={`p-4 rounded-lg border transition-all ${
              formData.type === 'international'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <Globe className={`w-6 h-6 mx-auto mb-2 ${
              formData.type === 'international' ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div className={`font-medium ${
              formData.type === 'international' 
                ? 'text-blue-600 dark:text-blue-400' 
                : darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              دولي
            </div>
          </button>
        </div>
      </div>

      {/* نصائح */}
      <Alert className={darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}>
        <Info className="h-4 w-4" />
        <AlertDescription className={darkMode ? 'text-blue-200' : 'text-blue-800'}>
          <strong>نصائح للنشر:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• أفضل أوقات النشر بين 8-10 صباحاً و 6-8 مساءً</li>
            <li>• الأخبار العاجلة تحصل على أولوية في العرض</li>
            <li>• المقالات المميزة تظهر لفترة أطول في الصفحة الرئيسية</li>
            <li>• يمكن تعديل هذه الخيارات بعد النشر</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
} 