'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  SparklesIcon,
  LightBulbIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface PersonalizationSettings {
  showStatisticsBlock: boolean
  showSmartRecommendations: boolean
  smartContentSource: 'auto' | 'curated' | 'off'
  aiGeneratedTips: boolean
  interactiveQuestions: boolean
  showGrowthRate: boolean
}

export default function PersonalizationSettings() {
  const [settings, setSettings] = useState<PersonalizationSettings>({
    showStatisticsBlock: true,
    showSmartRecommendations: true,
    smartContentSource: 'auto',
    aiGeneratedTips: true,
    interactiveQuestions: true,
    showGrowthRate: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/personalization')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: keyof PersonalizationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* العنوان */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Cog6ToothIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات التخصيص</h1>
          <p className="text-gray-600">تحكم في عرض المحتوى والتفاعلات في صفحات المقالات</p>
        </div>
      </div>

      {/* الإعدادات */}
      <div className="space-y-6">
        
        {/* بلوك الإحصائيات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  بلوك الإحصائيات التفاعلية
                </h3>
                <p className="text-gray-600 mb-4">
                  عرض إحصائيات المقال مثل المشاهدات والإعجابات والمشاركات مع إمكانية التفاعل المباشر
                </p>
                
                {/* الخيارات الفرعية */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.showGrowthRate}
                      onChange={(e) => updateSetting('showGrowthRate', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      disabled={!settings.showStatisticsBlock}
                    />
                    <span className="text-sm text-gray-700">عرض معدل النمو مقارنة بالمقالات الأخرى</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* المفتاح */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {settings.showStatisticsBlock ? 'مفعل' : 'معطل'}
              </span>
              <button
                onClick={() => updateSetting('showStatisticsBlock', !settings.showStatisticsBlock)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.showStatisticsBlock ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showStatisticsBlock ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* التوصيات الذكية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  التوصيات الذكية
                </h3>
                <p className="text-gray-600 mb-4">
                  عرض محتوى مخصص للقارئ بناء على اهتماماته وسلوك التصفح
                </p>
                
                {/* خيارات مصدر المحتوى */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مصدر المحتوى
                    </label>
                    <select
                      value={settings.smartContentSource}
                      onChange={(e) => updateSetting('smartContentSource', e.target.value)}
                      disabled={!settings.showSmartRecommendations}
                      className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="auto">ذكي (تلقائي)</option>
                      <option value="curated">مخصص يدوياً</option>
                      <option value="off">معطل</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.aiGeneratedTips}
                      onChange={(e) => updateSetting('aiGeneratedTips', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      disabled={!settings.showSmartRecommendations}
                    />
                    <span className="text-sm text-gray-700">النصائح المولدة بالذكاء الاصطناعي</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.interactiveQuestions}
                      onChange={(e) => updateSetting('interactiveQuestions', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      disabled={!settings.showSmartRecommendations}
                    />
                    <span className="text-sm text-gray-700">الأسئلة التفاعلية لتشجيع النقاش</span>
                  </label>
                </div>

                {/* تحذير الذكاء الاصطناعي */}
                {settings.smartContentSource === 'auto' && settings.showSmartRecommendations && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <LightBulbIcon className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        استخدام الذكاء الاصطناعي قد يؤثر على سرعة تحميل الصفحة
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* المفتاح */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {settings.showSmartRecommendations ? 'مفعل' : 'معطل'}
              </span>
              <button
                onClick={() => updateSetting('showSmartRecommendations', !settings.showSmartRecommendations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  settings.showSmartRecommendations ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showSmartRecommendations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* زر الحفظ */}
      <div className="flex justify-end gap-4 mt-8">
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-green-600"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">تم الحفظ بنجاح!</span>
          </motion.div>
        )}
        
        <button
          onClick={saveSettings}
          disabled={isLoading}
          className={`
            px-6 py-3 rounded-lg font-medium text-white transition-all duration-200
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
            }
          `}
        >
          {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* معاينة التأثير */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة التغييرات</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            {settings.showStatisticsBlock ? (
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-red-500" />
            )}
            <span>بلوك الإحصائيات سيظهر أسفل كل مقال</span>
          </div>
          <div className="flex items-center gap-2">
            {settings.showSmartRecommendations ? (
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-red-500" />
            )}
            <span>التوصيات الذكية ستظهر تحت الإحصائيات</span>
          </div>
          <div className="flex items-center gap-2">
            {settings.aiGeneratedTips && settings.showSmartRecommendations ? (
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-red-500" />
            )}
            <span>النصائح المولدة بالذكاء الاصطناعي ستظهر في التوصيات</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
