'use client';

import React, { useState, useEffect } from 'react';
import { Save, Settings, Shield, Brain, Database, Search, Palette, CheckCircle, Upload, Download, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // إعدادات الموقع العامة
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'صحيفة سبق الإلكترونية',
    siteDescription: 'أخبار المملكة العربية السعودية والعالم',
    contactEmail: 'info@sabq.org',
    supportPhone: '+966-11-123456',
    timezone: 'Asia/Riyadh',
    language: 'ar',
    currency: 'SAR'
  });

  // إعدادات الذكاء الاصطناعي
  const [aiSettings, setAiSettings] = useState({
    openaiKey: '',
    anthropicKey: '',
    enableAutoSummary: true,
    enableAutoTagging: true,
    enableSmartTranslation: true
  });

  // إعدادات SEO
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: 'صحيفة سبق الإلكترونية',
    metaDescription: 'آخر الأخبار من المملكة العربية السعودية والعالم',
    keywords: 'سبق, أخبار, السعودية, عاجل',
    analyticsId: '',
    searchConsoleId: '',
    ogImage: '/og-image.jpg',
    twitterCard: 'summary_large_image'
  });

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  const showSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const testOpenAIConnection = async () => {
    if (!aiSettings.openaiKey) {
      setTestResult({ success: false, message: 'يرجى إدخال مفتاح OpenAI أولاً' });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult({ success: true, message: 'تم الاتصال بنجاح! المفتاح صالح.' });
    } catch (error) {
      setTestResult({ success: false, message: 'فشل الاتصال. تحقق من صحة المفتاح.' });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveSettings = (section) => {
    localStorage.setItem(`settings_${section}`, JSON.stringify(eval(`${section}Settings`)));
    showSuccess();
  };

  const tabs = [
    { id: 'general', name: 'إعدادات عامة', icon: Settings },
    { id: 'brand', name: 'الهوية البصرية', icon: Palette },
    { id: 'ai', name: 'الذكاء الاصطناعي', icon: Brain },
    { id: 'security', name: 'الأمان', icon: Shield },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: Database },
    { id: 'seo', name: 'SEO', icon: Search }
  ];

  return (
    <div className={`p-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : ''}`}>
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-5 h-5" />
          تم حفظ الإعدادات بنجاح!
        </div>
      )}

      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>إعدادات الصحيفة</h1>
        <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>إدارة الإعدادات العامة لصحيفة سبق الإلكترونية</p>
      </div>

      {/* Navigation Tabs - نفس التصميم المعتمد في الموقع */}
      <div className={`rounded-2xl p-2 shadow-sm border mb-8 w-full transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex gap-2 justify-start pr-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-48 flex flex-col items-center justify-center gap-2 py-4 pb-3 px-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md border-b-4 border-blue-600'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 border-b-4 border-transparent hover:border-gray-600'
                      : 'text-gray-600 hover:bg-gray-50 border-b-4 border-transparent hover:border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* محتوى التبويبات */}
      <div className={`rounded-2xl shadow-sm border transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="p-6">
          
          {/* تبويب الإعدادات العامة */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>الإعدادات العامة للموقع</h3>
                  <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>إعدادات أساسية لإدارة الموقع</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>اسم الموقع</label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني للتواصل</label>
                  <input
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>رقم الهاتف</label>
                  <input
                    type="text"
                    value={generalSettings.supportPhone}
                    onChange={(e) => setGeneralSettings({...generalSettings, supportPhone: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>المنطقة الزمنية</label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                    <option value="Asia/Mecca">مكة المكرمة (GMT+3)</option>
                    <option value="Asia/Kuwait">الكويت (GMT+3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>وصف الموقع</label>
                <textarea
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <button 
                onClick={() => saveSettings('general')}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Save className="w-5 h-5" />
                حفظ الإعدادات العامة
              </button>
            </div>
          )}

          {/* تبويب الذكاء الاصطناعي */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>🧠 إعدادات الذكاء الاصطناعي</h3>
                  <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>إدارة مفاتيح API والميزات الذكية</p>
                </div>
              </div>
              
              <div className={`p-6 rounded-xl border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>🔥 مفاتيح API</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>OpenAI API Key</label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={aiSettings.openaiKey}
                          onChange={(e) => setAiSettings({...aiSettings, openaiKey: e.target.value})}
                          placeholder="sk-..."
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                      <button 
                        onClick={() => saveSettings('ai')}
                        className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-1 transition-all duration-300"
                      >
                        <Save className="w-4 h-4" />
                        حفظ
                      </button>
                      <button 
                        onClick={testOpenAIConnection}
                        disabled={isTestingConnection}
                        className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-1 transition-all duration-300 disabled:opacity-50"
                      >
                        {isTestingConnection ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        اختبار الاتصال
                      </button>
                    </div>
                    
                    {testResult && (
                      <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {testResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>🚀 الميزات النشطة</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={aiSettings.enableAutoSummary}
                      onChange={(e) => setAiSettings({...aiSettings, enableAutoSummary: e.target.checked})}
                      className="mr-3 w-4 h-4"
                    />
                    <span className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>التلخيص التلقائي للمقالات</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={aiSettings.enableAutoTagging}
                      onChange={(e) => setAiSettings({...aiSettings, enableAutoTagging: e.target.checked})}
                      className="mr-3 w-4 h-4"
                    />
                    <span className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الوسم التلقائي للمحتوى</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={aiSettings.enableSmartTranslation}
                      onChange={(e) => setAiSettings({...aiSettings, enableSmartTranslation: e.target.checked})}
                      className="mr-3 w-4 h-4"
                    />
                    <span className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الترجمة الذكية</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* تبويب SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>🔍 إعدادات SEO</h3>
                  <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>تحسين محركات البحث والتسويق الرقمي</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>عنوان الموقع (Meta Title)</label>
                  <input
                    type="text"
                    value={seoSettings.metaTitle}
                    onChange={(e) => setSeoSettings({...seoSettings, metaTitle: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>وصف الموقع (Meta Description)</label>
                  <textarea
                    value={seoSettings.metaDescription}
                    onChange={(e) => setSeoSettings({...seoSettings, metaDescription: e.target.value})}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الكلمات المفتاحية</label>
                  <input
                    type="text"
                    value={seoSettings.keywords}
                    onChange={(e) => setSeoSettings({...seoSettings, keywords: e.target.value})}
                    placeholder="كلمة1, كلمة2, كلمة3"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Google Analytics ID</label>
                    <input
                      type="text"
                      value={seoSettings.analyticsId}
                      onChange={(e) => setSeoSettings({...seoSettings, analyticsId: e.target.value})}
                      placeholder="G-XXXXXXXXXX"
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Search Console ID</label>
                    <input
                      type="text"
                      value={seoSettings.searchConsoleId}
                      onChange={(e) => setSeoSettings({...seoSettings, searchConsoleId: e.target.value})}
                      placeholder="googleXXXXXXXXXXXXXXXX.html"
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => saveSettings('seo')}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Save className="w-5 h-5" />
                حفظ إعدادات SEO
              </button>
            </div>
          )}

          {/* تبويبات أخرى */}
          {(activeTab === 'brand' || activeTab === 'security' || activeTab === 'backup') && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>قيد التطوير</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>هذا القسم قيد التطوير وسيكون متاحاً قريباً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
