// مكون موافقة الخصوصية - سبق الذكية
'use client';

import React, { useState, useEffect } from 'react';
import { PrivacyManager, PrivacyLevel, SensitiveDataType } from '@/lib/tracking/privacy-manager';
import { X, Shield, Eye, MapPin, Monitor, BarChart3, FileText, Check, AlertTriangle } from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (settings: any) => void;
  forcedUpdate?: boolean;
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  forcedUpdate = false
}) => {
  const [selectedLevel, setSelectedLevel] = useState<PrivacyLevel>(PrivacyLevel.BALANCED);
  const [customSettings, setCustomSettings] = useState({
    dataRetentionDays: 365,
    allowedDataTypes: [SensitiveDataType.BEHAVIOR, SensitiveDataType.CONTENT],
    anonymizeData: true,
    encryptData: true,
    shareWithThirdParties: false,
    geoLocationTracking: false,
    crossSiteTracking: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      // تحميل الإعدادات الحالية
      const currentPolicy = PrivacyManager.loadPrivacySettings();
      setSelectedLevel(currentPolicy.level);
      setCustomSettings({
        dataRetentionDays: currentPolicy.dataRetentionDays,
        allowedDataTypes: currentPolicy.allowedDataTypes,
        anonymizeData: currentPolicy.anonymizeData,
        encryptData: currentPolicy.encryptData,
        shareWithThirdParties: currentPolicy.shareWithThirdParties,
        geoLocationTracking: currentPolicy.geoLocationTracking,
        crossSiteTracking: currentPolicy.crossSiteTracking
      });
    }
  }, [isOpen]);

  const handleAccept = () => {
    const policy = {
      level: selectedLevel,
      userConsent: true,
      consentTimestamp: new Date(),
      consentVersion: '2.0',
      ...customSettings
    };

    PrivacyManager.savePrivacySettings(policy);
    onAccept(policy);
    onClose();
  };

  const handleReject = () => {
    const policy = {
      level: PrivacyLevel.OFF,
      userConsent: false,
      dataRetentionDays: 0,
      allowedDataTypes: [],
      anonymizeData: true,
      encryptData: true,
      shareWithThirdParties: false,
      geoLocationTracking: false,
      crossSiteTracking: false,
      consentTimestamp: new Date(),
      consentVersion: '2.0'
    };

    PrivacyManager.savePrivacySettings(policy);
    onAccept(policy);
    onClose();
  };

  const privacyLevels = [
    {
      level: PrivacyLevel.MINIMAL,
      title: 'الحد الأدنى',
      description: 'جمع البيانات الأساسية فقط المطلوبة لتشغيل الموقع',
      icon: <Shield className="w-6 h-6 text-green-500" />,
      features: ['بيانات وظيفية أساسية', 'لا توجد بيانات شخصية', 'لا تتبع للموقع', 'إخفاء هوية كامل']
    },
    {
      level: PrivacyLevel.BALANCED,
      title: 'متوازن (موصى به)',
      description: 'توازن بين الخصوصية وتحسين تجربة المستخدم',
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
      features: ['تتبع سلوك القراءة', 'تحسين المحتوى', 'تشفير البيانات', 'إخفاء الهوية']
    },
    {
      level: PrivacyLevel.FULL,
      title: 'كامل',
      description: 'جمع جميع البيانات لتقديم أفضل تجربة مخصصة',
      icon: <Monitor className="w-6 h-6 text-orange-500" />,
      features: ['تخصيص كامل', 'تحليلات متقدمة', 'توصيات ذكية', 'جمع شامل للبيانات']
    }
  ];

  const dataTypeOptions = [
    {
      type: SensitiveDataType.BEHAVIOR,
      title: 'سلوك القراءة',
      description: 'وقت القراءة، التمرير، التفاعل مع المحتوى',
      icon: <Eye className="w-5 h-5" />,
      required: false
    },
    {
      type: SensitiveDataType.CONTENT,
      title: 'تفاعل المحتوى',
      description: 'الإعجاب، الحفظ، المشاركة، التعليقات',
      icon: <FileText className="w-5 h-5" />,
      required: false
    },
    {
      type: SensitiveDataType.DEVICE,
      title: 'معلومات الجهاز',
      description: 'نوع الجهاز، المتصفح، نظام التشغيل',
      icon: <Monitor className="w-5 h-5" />,
      required: false
    },
    {
      type: SensitiveDataType.LOCATION,
      title: 'بيانات الموقع',
      description: 'الدولة، المدينة (بدون إحداثيات دقيقة)',
      icon: <MapPin className="w-5 h-5" />,
      required: false
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* الرأس */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            إعدادات الخصوصية
            {forcedUpdate && (
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                تحديث مطلوب
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* المحتوى */}
        <div className="p-6">
          {/* الخطوة الأولى: مستوى الخصوصية */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  اختر مستوى الخصوصية المناسب لك
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  يمكنك تغيير هذه الإعدادات في أي وقت من خلال إعدادات الحساب
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {privacyLevels.map((option) => (
                  <div
                    key={option.level}
                    onClick={() => setSelectedLevel(option.level)}
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${selectedLevel === option.level
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {option.icon}
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {option.title}
                      </h4>
                      {selectedLevel === option.level && (
                        <Check className="w-5 h-5 text-blue-500 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {option.description}
                    </p>
                    <ul className="space-y-1">
                      {option.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* إعدادات متقدمة */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  {showAdvanced ? 'إخفاء' : 'إظهار'} الإعدادات المتقدمة
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      تخصيص البيانات المجمعة
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {dataTypeOptions.map((option) => (
                        <label key={option.type} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customSettings.allowedDataTypes.includes(option.type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCustomSettings(prev => ({
                                  ...prev,
                                  allowedDataTypes: [...prev.allowedDataTypes, option.type]
                                }));
                              } else {
                                setCustomSettings(prev => ({
                                  ...prev,
                                  allowedDataTypes: prev.allowedDataTypes.filter(t => t !== option.type)
                                }));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {option.icon}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {option.title}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {option.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={customSettings.anonymizeData}
                          onChange={(e) => setCustomSettings(prev => ({
                            ...prev,
                            anonymizeData: e.target.checked
                          }))}
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          إخفاء الهوية عن البيانات الشخصية
                        </span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={customSettings.encryptData}
                          onChange={(e) => setCustomSettings(prev => ({
                            ...prev,
                            encryptData: e.target.checked
                          }))}
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          تشفير البيانات الحساسة
                        </span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={customSettings.geoLocationTracking}
                          onChange={(e) => setCustomSettings(prev => ({
                            ...prev,
                            geoLocationTracking: e.target.checked
                          }))}
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          السماح بتتبع الموقع الجغرافي
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        مدة الاحتفاظ بالبيانات (أيام)
                      </label>
                      <input
                        type="number"
                        min="30"
                        max="730"
                        value={customSettings.dataRetentionDays}
                        onChange={(e) => setCustomSettings(prev => ({
                          ...prev,
                          dataRetentionDays: parseInt(e.target.value) || 365
                        }))}
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        من 30 يوم إلى 730 يوم (سنتان)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* تحذير مهم */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  معلومات مهمة
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• نحن نحترم خصوصيتك ولا نبيع بياناتك لأطراف ثالثة</li>
                  <li>• يمكنك تغيير هذه الإعدادات أو حذف بياناتك في أي وقت</li>
                  <li>• البيانات تُستخدم فقط لتحسين تجربتك في موقع سبق</li>
                  <li>• يمكنك رفض جميع أنواع التتبع وستظل قادراً على استخدام الموقع</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex justify-between items-center p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            رفض جميع أنواع التتبع
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                       rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              إلغاء
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                       flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              موافق على الإعدادات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsentModal;
