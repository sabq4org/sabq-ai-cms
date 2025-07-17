'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp?: string;
}

export default function InteractionsFixPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState('test-user-1');
  const [currentArticle, setCurrentArticle] = useState('test-article-1');
  const [users, setUsers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);

  const addResult = (test: string, status: 'success' | 'error', message: string) => {
    setResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date().toLocaleString('ar')
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // اختبار 1: جلب حالة النظام
  const testSystemStatus = async () => {
    try {
      const response = await fetch('/api/interactions-debug?action=status');
      const data = await response.json();
      
      if (response.ok) {
        addResult('حالة النظام', 'success', `النظام يعمل - ${data.status.interactions_count} تفاعل`);
      } else {
        addResult('حالة النظام', 'error', data.error);
      }
    } catch (error: any) {
      addResult('حالة النظام', 'error', 'خطأ في الشبكة');
    }
  };

  // اختبار 2: جلب المستخدمين والمقالات
  const loadTestData = async () => {
    try {
      // جلب المستخدمين
      const usersResponse = await fetch('/api/interactions-debug?action=users');
      const usersData = await usersResponse.json();
      
      if (usersResponse.ok) {
        setUsers(usersData.users);
        addResult('جلب المستخدمين', 'success', usersData.message);
      } else {
        addResult('جلب المستخدمين', 'error', usersData.error);
        return;
      }

      // جلب المقالات
      const articlesResponse = await fetch('/api/interactions-debug?action=articles');
      const articlesData = await articlesResponse.json();
      
      if (articlesResponse.ok) {
        setArticles(articlesData.articles);
        addResult('جلب المقالات', 'success', articlesData.message);
      } else {
        addResult('جلب المقالات', 'error', articlesData.error);
      }
    } catch (error: any) {
      addResult('جلب البيانات', 'error', 'خطأ في الشبكة');
    }
  };

  // اختبار 3: إضافة إعجاب
  const testAddLike = async () => {
    try {
      const response = await fetch('/api/interactions-debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser,
          articleId: currentArticle,
          type: 'like',
          action: 'add'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addResult('إضافة إعجاب', 'success', `${data.message} - إعجابات: ${data.article_stats?.likes || 0}`);
        toast.success('✅ تم إضافة الإعجاب!');
        await loadInteractions();
      } else {
        addResult('إضافة إعجاب', 'error', data.error);
        toast.error('❌ فشل إضافة الإعجاب');
      }
    } catch (error: any) {
      addResult('إضافة إعجاب', 'error', 'خطأ في الشبكة');
      toast.error('❌ خطأ في الشبكة');
    }
  };

  // اختبار 4: إضافة حفظ
  const testAddSave = async () => {
    try {
      const response = await fetch('/api/interactions-debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser,
          articleId: currentArticle,
          type: 'save',
          action: 'add'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addResult('إضافة حفظ', 'success', `${data.message} - محفوظات: ${data.article_stats?.saves || 0}`);
        toast.success('✅ تم حفظ المقال!');
        await loadInteractions();
      } else {
        addResult('إضافة حفظ', 'error', data.error);
        toast.error('❌ فشل حفظ المقال');
      }
    } catch (error: any) {
      addResult('إضافة حفظ', 'error', 'خطأ في الشبكة');
      toast.error('❌ خطأ في الشبكة');
    }
  };

  // اختبار 5: جلب حالة التفاعلات
  const testGetInteractionState = async () => {
    try {
      const response = await fetch(`/api/interactions-debug?action=interactions&userId=${currentUser}&articleId=${currentArticle}`);
      const data = await response.json();
      
      if (response.ok) {
        const state = data.data;
        addResult('حالة التفاعلات', 'success', 
          `إعجاب: ${state.liked ? 'نعم' : 'لا'}, حفظ: ${state.saved ? 'نعم' : 'لا'}, مشاركة: ${state.shared ? 'نعم' : 'لا'}`
        );
      } else {
        addResult('حالة التفاعلات', 'error', data.error);
      }
    } catch (error: any) {
      addResult('حالة التفاعلات', 'error', 'خطأ في الشبكة');
    }
  };

  // اختبار 6: حذف التفاعلات
  const testRemoveInteraction = async (type: 'like' | 'save') => {
    try {
      const response = await fetch('/api/interactions-debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser,
          articleId: currentArticle,
          type: type,
          action: 'remove'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addResult(`حذف ${type}`, 'success', `${data.message} - ${type === 'like' ? 'إعجابات' : 'محفوظات'}: ${data.article_stats?.[type === 'like' ? 'likes' : 'saves'] || 0}`);
        toast.success(`✅ تم حذف ${type === 'like' ? 'الإعجاب' : 'الحفظ'}!`);
        await loadInteractions();
      } else {
        addResult(`حذف ${type}`, 'error', data.message || data.error);
        toast.error(`❌ ${data.message || 'فشل الحذف'}`);
      }
    } catch (error: any) {
      addResult(`حذف ${type}`, 'error', 'خطأ في الشبكة');
      toast.error('❌ خطأ في الشبكة');
    }
  };

  // جلب جميع التفاعلات
  const loadInteractions = async () => {
    try {
      const response = await fetch('/api/interactions-debug?action=interactions');
      const data = await response.json();
      
      if (response.ok) {
        setInteractions(data.interactions);
      }
    } catch (error) {
      console.error('خطأ في جلب التفاعلات:', error);
    }
  };

  // اختبار شامل
  const runFullTest = async () => {
    setIsLoading(true);
    clearResults();
    
    await testSystemStatus();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await loadTestData();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAddLike();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAddSave();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testGetInteractionState();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await loadInteractions();
    
    setIsLoading(false);
    toast.success('🏁 تم الانتهاء من الاختبار الشامل!');
  };

  // مسح جميع البيانات
  const clearAllData = async () => {
    if (!confirm('هل أنت متأكد من مسح جميع البيانات التجريبية؟')) {
      return;
    }

    try {
      const response = await fetch('/api/interactions-debug?confirm=true', {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok) {
        addResult('مسح البيانات', 'success', data.message);
        setInteractions([]);
        await loadTestData(); // إعادة تحميل البيانات الأساسية
        toast.success('🗑️ تم مسح جميع البيانات!');
      } else {
        addResult('مسح البيانات', 'error', data.error);
        toast.error('❌ فشل مسح البيانات');
      }
    } catch (error: any) {
      addResult('مسح البيانات', 'error', 'خطأ في الشبكة');
      toast.error('❌ خطأ في الشبكة');
    }
  };

  useEffect(() => {
    loadTestData();
    loadInteractions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* العنوان الرئيسي */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            🔧 إصلاح نظام التفاعلات
          </h1>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">المشكلة:</h2>
            <p className="text-red-700 dark:text-red-300">
              المستخدم يشكو من أن الإعجابات والحفظ لا تتم بشكل صحيح، وأن البيانات تختفي بعد تحديث الصفحة.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">الحل:</h2>
            <p className="text-blue-700 dark:text-blue-300">
              نستخدم نظام تشخيص مبسط لاختبار التفاعلات بدون الاعتماد على قاعدة البيانات المعطلة.
            </p>
          </div>
        </div>

        {/* أدوات التحكم */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🎛️ أدوات التحكم</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">المستخدم:</label>
              <select 
                value={currentUser} 
                onChange={(e) => setCurrentUser(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">المقال:</label>
              <select 
                value={currentArticle} 
                onChange={(e) => setCurrentArticle(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {articles.map(article => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={runFullTest}
                disabled={isLoading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'جاري الاختبار...' : '🏁 اختبار شامل'}
              </button>
            </div>
          </div>

          {/* أزرار الاختبار */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button onClick={testSystemStatus} className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
              📊 حالة النظام
            </button>
            <button onClick={testAddLike} className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700">
              ❤️ إضافة إعجاب
            </button>
            <button onClick={testAddSave} className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
              📑 إضافة حفظ
            </button>
            <button onClick={testGetInteractionState} className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700">
              🔍 حالة التفاعلات
            </button>
            <button onClick={() => testRemoveInteraction('like')} className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
              💔 حذف إعجاب
            </button>
            <button onClick={() => testRemoveInteraction('save')} className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
              🗑️ حذف حفظ
            </button>
            <button onClick={clearAllData} className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600">
              🗑️ مسح الكل
            </button>
            <button onClick={clearResults} className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600">
              🧹 مسح النتائج
            </button>
          </div>
        </div>

        {/* النتائج والتفاعلات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* نتائج الاختبارات */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📊 نتائج الاختبارات ({results.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
                      : 'bg-red-50 border-red-500 dark:bg-red-900/20'
                  }`}
                >
                  <h3 className="font-semibold">
                    {result.status === 'success' ? '✅' : '❌'} {result.test}
                  </h3>
                  <p className="text-sm mt-1">{result.message}</p>
                  {result.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
                  )}
                </div>
              ))}
              {results.length === 0 && (
                <p className="text-gray-500 text-center py-8">لا توجد نتائج بعد</p>
              )}
            </div>
          </div>

          {/* التفاعلات الحالية */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📋 التفاعلات المحفوظة ({interactions.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {interactions.map((interaction, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      interaction.type === 'like' 
                        ? 'bg-red-100 text-red-800' 
                        : interaction.type === 'save'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {interaction.type === 'like' ? '❤️ إعجاب' : interaction.type === 'save' ? '📑 حفظ' : interaction.type}
                    </span>
                    <div className="text-xs text-gray-500">
                      {new Date(interaction.created_at).toLocaleString('ar')}
                    </div>
                  </div>
                  <div className="text-sm mt-1">
                    المستخدم: {users.find(u => u.id === interaction.user_id)?.name || interaction.user_id}
                  </div>
                  <div className="text-sm">
                    المقال: {articles.find(a => a.id === interaction.article_id)?.title || interaction.article_id}
                  </div>
                </div>
              ))}
              {interactions.length === 0 && (
                <p className="text-gray-500 text-center py-8">لا توجد تفاعلات محفوظة</p>
              )}
            </div>
          </div>
        </div>

        {/* إحصائيات المقالات */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">📈 إحصائيات المقالات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map(article => (
              <div key={article.id} className="border rounded-lg p-4 dark:border-gray-600">
                <h3 className="font-semibold mb-2">{article.title}</h3>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-red-600 font-bold">{article.likes}</div>
                    <div className="text-gray-500">إعجاب</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-bold">{article.saves}</div>
                    <div className="text-gray-500">حفظ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 font-bold">{article.shares}</div>
                    <div className="text-gray-500">مشاركة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-600 font-bold">{article.views}</div>
                    <div className="text-gray-500">مشاهدة</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 