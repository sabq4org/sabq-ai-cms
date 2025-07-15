'use client';

import React, { useState, memo } from 'react';
import { Calendar, Clock, Zap, Globe, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PublishStepEnhancedProps {
  formData: {
    publishType: 'now' | 'scheduled';
    scheduledDate: string;
    isBreaking: boolean;
    isFeatured: boolean;
    type: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  darkMode: boolean;
}

const PublishStepEnhanced = memo(({ formData, setFormData, darkMode }: PublishStepEnhancedProps) => {
  const [showDatePicker, setShowDatePicker] = useState(formData.publishType === 'scheduled');

  // الحصول على التاريخ والوقت الحالي
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handlePublishTypeChange = (type: 'now' | 'scheduled') => {
    setFormData((prev: any) => ({ ...prev, publishType: type }));
    setShowDatePicker(type === 'scheduled');
    
    if (type === 'scheduled' && !formData.scheduledDate) {
      // تعيين وقت افتراضي بعد ساعة من الآن
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      const year = defaultTime.getFullYear();
      const month = String(defaultTime.getMonth() + 1).padStart(2, '0');
      const day = String(defaultTime.getDate()).padStart(2, '0');
      const hours = String(defaultTime.getHours()).padStart(2, '0');
      const minutes = String(defaultTime.getMinutes()).padStart(2, '0');
      setFormData((prev: any) => ({ 
        ...prev, 
        scheduledDate: `${year}-${month}-${day}T${hours}:${minutes}` 
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* توقيت النشر */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          توقيت النشر
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* نشر فوري */}
          <button
            onClick={() => handlePublishTypeChange('now')}
            className={cn(
              "p-4 rounded-lg border-2 text-right transition-all duration-200",
              formData.publishType === 'now'
                ? darkMode
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-blue-500 bg-blue-50"
                : darkMode
                ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
                : "border-gray-300 bg-white hover:bg-gray-50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 mt-0.5",
                formData.publishType === 'now'
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-400"
              )}>
                {formData.publishType === 'now' && (
                  <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">نشر فوري</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  سيتم نشر المقال فور الحفظ
                </p>
              </div>
            </div>
          </button>

          {/* نشر مجدول */}
          <button
            onClick={() => handlePublishTypeChange('scheduled')}
            className={cn(
              "p-4 rounded-lg border-2 text-right transition-all duration-200",
              formData.publishType === 'scheduled'
                ? darkMode
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-blue-500 bg-blue-50"
                : darkMode
                ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
                : "border-gray-300 bg-white hover:bg-gray-50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 mt-0.5",
                formData.publishType === 'scheduled'
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-400"
              )}>
                {formData.publishType === 'scheduled' && (
                  <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">نشر مجدول</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  حدد وقت النشر المستقبلي
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* حقل التاريخ والوقت */}
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <label className="block text-sm font-medium mb-2">
              تاريخ ووقت النشر
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, scheduledDate: e.target.value }))}
              min={getCurrentDateTime()}
              className={cn(
                "w-full px-4 py-3 border rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              )}
            />
          </motion.div>
        )}
      </div>

      {/* خيارات العرض */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          خيارات العرض
        </h3>

        <div className="space-y-3">
          {/* خبر عاجل */}
          <label className={cn(
            "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200",
            darkMode
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-gray-50 hover:bg-gray-100"
          )}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn(
                "w-5 h-5",
                formData.isBreaking ? "text-red-500" : "text-gray-400"
              )} />
              <div>
                <p className="font-medium">خبر عاجل</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  عرض المقال كخبر عاجل في أعلى الصفحة
                </p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isBreaking}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, isBreaking: e.target.checked }))}
                className="sr-only"
              />
              <div className={cn(
                "w-11 h-6 rounded-full transition-colors duration-200",
                formData.isBreaking
                  ? "bg-red-500"
                  : darkMode
                  ? "bg-gray-600"
                  : "bg-gray-300"
              )}>
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  formData.isBreaking ? "translate-x-5" : "translate-x-0",
                  "mt-0.5 mr-0.5"
                )} />
              </div>
            </div>
          </label>

          {/* خبر مميز */}
          <label className={cn(
            "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200",
            darkMode
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-gray-50 hover:bg-gray-100"
          )}>
            <div className="flex items-center gap-3">
              <Zap className={cn(
                "w-5 h-5",
                formData.isFeatured ? "text-yellow-500" : "text-gray-400"
              )} />
              <div>
                <p className="font-medium">خبر مميز</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  إبراز المقال في القسم المميز
                </p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, isFeatured: e.target.checked }))}
                className="sr-only"
              />
              <div className={cn(
                "w-11 h-6 rounded-full transition-colors duration-200",
                formData.isFeatured
                  ? "bg-yellow-500"
                  : darkMode
                  ? "bg-gray-600"
                  : "bg-gray-300"
              )}>
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  formData.isFeatured ? "translate-x-5" : "translate-x-0",
                  "mt-0.5 mr-0.5"
                )} />
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* نطاق المقال */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          نطاق المقال
        </h3>

        <select
          value={formData.type}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, type: e.target.value }))}
          className={cn(
            "w-full px-4 py-3 border rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            darkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-300 text-gray-900"
          )}
        >
          <option value="local">محلي</option>
          <option value="regional">إقليمي</option>
          <option value="international">دولي</option>
        </select>
      </div>

      {/* معلومات إضافية */}
      <div className={cn(
        "p-4 rounded-lg border",
        darkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-blue-50 border-blue-200"
      )}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              ملاحظات مهمة:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-0.5">
              <li>• الأخبار العاجلة تظهر لمدة 24 ساعة فقط</li>
              <li>• المقالات المميزة تظهر في الصفحة الرئيسية</li>
              <li>• يمكن تغيير هذه الإعدادات بعد النشر</li>
              <li>• المقالات المجدولة تُنشر تلقائياً في الوقت المحدد</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

PublishStepEnhanced.displayName = 'PublishStepEnhanced';

export default PublishStepEnhanced; 