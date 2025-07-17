'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
  timestamp?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Article {
  id: string;
  title: string;
  status: string;
}

interface Interaction {
  id: string;
  user_id: string;
  article_id: string;
  type: string;
  created_at: string;
}

export default function InteractionsTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentArticleId, setCurrentArticleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', message: string, details?: any) => {
    setResults(prev => [...prev, {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // 1. اختبار اتصال قاعدة البيانات
  const testDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      
      if (response.ok) {
        addResult('اتصال قاعدة البيانات', 'success', 'تم الاتصال بنجاح', data);
      } else {
        addResult('اتصال قاعدة البيانات', 'error', data.error || 'فشل الاتصال', data);
      }
    } catch (error) {
      addResult('اتصال قاعدة البيانات', 'error', 'خطأ في الشبكة', error);
    }
  };

  // 2. جلب المستخدمين
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?limit=10');
      const data = await response.json();
      
      if (response.ok && data.users) {
        setUsers(data.users);
        if (data.users.length > 0) {
          setCurrentUserId(data.users[0].id);
        }
        addResult('جلب المستخدمين', 'success', `تم جلب ${data.users.length} مستخدم`, data.users);
      } else {
        addResult('جلب المستخدمين', 'error', 'فشل جلب المستخدمين', data);
      }
    } catch (error) {
      addResult('جلب المستخدمين', 'error', 'خطأ في الشبكة', error);
    }
  };

  // 3. جلب المقالات
  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?limit=10');
      const data = await response.json();
      
      if (response.ok && data.articles) {
        setArticles(data.articles);
        if (data.articles.length > 0) {
          setCurrentArticleId(data.articles[0].id);
        }
        addResult('جلب المقالات', 'success', `تم جلب ${data.articles.length} مقال`, data.articles);
      } else {
        addResult('جلب المقالات', 'error', 'فشل جلب المقالات', data);
      }
    } catch (error) {
      addResult('جلب المقالات', 'error', 'خطأ في الشبكة', error);
    }
  };

  // 4. اختبار إضافة إعجاب
  const testAddLike = async () => {
    if (!currentUserId || !currentArticleId) {
      addResult('إضافة إعجاب', 'error', 'يجب اختيار مستخدم ومقال');
      return;
    }

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          articleId: currentArticleId,
          type: 'like',
          action: 'add'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('إضافة إعجاب', 'success', data.message, data);
        toast.success('✅ تم إضافة الإعجاب بنجاح!');
      } else {
        addResult('إضافة إعجاب', 'error', data.error || 'فشل إضافة الإعجاب', data);
        toast.error('❌ فشل إضافة الإعجاب');
      }
    } catch (error) {
      addResult('إضافة إعجاب', 'error', 'خطأ في الشبكة', error);
      toast.error('❌ خطأ في الشبكة');
    }
  };

  // 5. اختبار إضافة حفظ
  const testAddSave = async () => {
    if (!currentUserId || !currentArticleId) {
      addResult('إضافة حفظ', 'error', 'يجب اختيار مستخدم ومقال');
      return;
    }

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          articleId: currentArticleId,
          type: 'save',
          action: 'add'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('إضافة حفظ', 'success', data.message, data);
        toast.success('✅ تم حفظ المقال بنجاح!');
      } else {
        addResult('إضافة حفظ', 'error', data.error || 'فشل حفظ المقال', data);
        toast.error('❌ فشل حفظ المقال');
      }
    } catch (error) {
      addResult('إضافة حفظ', 'error', 'خطأ في الشبكة', error);
      toast.error('❌ خطأ في الشبكة');
    }
  };

  // 6. اختبار جلب التفاعلات
  const testFetchInteractions = async () => {
    if (!currentUserId || !currentArticleId) {
      addResult('جلب التفاعلات', 'error', 'يجب اختيار مستخدم ومقال');
      return;
    }

    try {
      const response = await fetch(`/api/interactions/user-article?userId=${currentUserId}&articleId=${currentArticleId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('جلب التفاعلات', 'success', `الحالة: الإعجاب=${data.data.liked}, الحفظ=${data.data.saved}`, data);
      } else {
        addResult('جلب التفاعلات', 'error', data.error || 'فشل جلب التفاعلات', data);
      }
    } catch (error) {
      addResult('جلب التفاعلات', 'error', 'خطأ في الشبكة', error);
    }
  };

  // 7. جلب جميع التفاعلات من قاعدة البيانات
  const fetchAllInteractions = async () => {
    try {
      const response = await fetch('/api/interactions?all=true');
      const data = await response.json();
      
      if (response.ok) {
        setInteractions(data.interactions || []);
        addResult('جلب جميع التفاعلات', 'success', `تم جلب ${data.interactions?.length || 0} تفاعل`, data);
      } else {
        addResult('جلب جميع التفاعلات', 'error', 'فشل جلب التفاعلات', data);
      }
    } catch (error) {
      addResult('جلب جميع التفاعلات', 'error', 'خطأ في الشبكة', error);
    }
  };

  // 8. اختبار حذف التفاعل
  const testRemoveInteraction = async (type: 'like' | 'save') => {
    if (!currentUserId || !currentArticleId) {
      addResult(`حذف ${type}`, 'error', 'يجب اختيار مستخدم ومقال');
      return;
    }

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          articleId: currentArticleId,
          type: type,
          action: 'remove'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult(`حذف ${type}`, 'success', data.message, data);
        toast.success(`✅ تم حذف ${type === 'like' ? 'الإعجاب' : 'الحفظ'} بنجاح!`);
      } else {
        addResult(`حذف ${type}`, 'error', data.error || `فشل حذف ${type}`, data);
        toast.error(`❌ فشل حذف ${type === 'like' ? 'الإعجاب' : 'الحفظ'}`);
      }
    } catch (error) {
      addResult(`حذف ${type}`, 'error', 'خطأ في الشبكة', error);
      toast.error('❌ خطأ في الشبكة');
    }
  };

  // 9. اختبار شامل
  const runFullTest = async () => {
    setIsLoading(true);
    clearResults();
    
    await testDatabaseConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await fetchUsers();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await fetchArticles();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testAddLike();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testAddSave();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testFetchInteractions();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await fetchAllInteractions();
    
    setIsLoading(false);
    toast.success('🏁 تم الانتهاء من الاختبار الشامل!');
  };

  useEffect(() => {
    fetchUsers();
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            🚨 تشخيص مشكلة التفاعلات (الإعجاب والحفظ)
          </h1>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">المشكلة المبلغ عنها:</h2>
            <ul className="text-red-700 dark:text-red-300 space-y-1">
              <li>• الإعجابات لا تُحفظ بعد تحديث الصفحة</li>
              <li>• المقالات المحفوظة تختفي</li>
              <li>• صفحة الإعجابات فارغة</li>
              <li>• صفحة المحفوظات فارغة</li>
              <li>• الإحصائيات الشخصية صفر</li>
            </ul>
          </div>

          {/* أدوات التحكم */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">المستخدم الحالي:</label>
              <select 
                value={currentUserId} 
                onChange={(e) => setCurrentUserId(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">اختر مستخدم</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">المقال الحالي:</label>
              <select 
                value={currentArticleId} 
                onChange={(e) => setCurrentArticleId(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">اختر مقال</option>
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

          {/* أزرار الاختبار الفردية */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            <button onClick={testDatabaseConnection} className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
              📊 قاعدة البيانات
            </button>
            <button onClick={testAddLike} className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700">
              ❤️ إضافة إعجاب
            </button>
            <button onClick={testAddSave} className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
              📑 إضافة حفظ
            </button>
            <button onClick={testFetchInteractions} className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700">
              🔍 جلب التفاعلات
            </button>
            <button onClick={() => testRemoveInteraction('like')} className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
              💔 حذف إعجاب
            </button>
            <button onClick={() => testRemoveInteraction('save')} className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
              🗑️ حذف حفظ
            </button>
            <button onClick={fetchAllInteractions} className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700">
              📋 جميع التفاعلات
            </button>
            <button onClick={clearResults} className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600">
              🗑️ مسح النتائج
            </button>
          </div>
        </div>

        {/* النتائج */}
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {result.status === 'success' ? '✅' : '❌'} {result.test}
                      </h3>
                      <p className="text-sm mt-1">{result.message}</p>
                      {result.timestamp && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(result.timestamp).toLocaleString('ar')}
                        </p>
                      )}
                    </div>
                  </div>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">عرض التفاصيل</summary>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
              {results.length === 0 && (
                <p className="text-gray-500 text-center py-8">لا توجد نتائج بعد. قم بتشغيل الاختبارات.</p>
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
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        interaction.type === 'like' 
                          ? 'bg-red-100 text-red-800' 
                          : interaction.type === 'save'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {interaction.type === 'like' ? '❤️ إعجاب' : interaction.type === 'save' ? '📑 حفظ' : interaction.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(interaction.created_at).toLocaleString('ar')}
                    </div>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-gray-600">المستخدم:</span> {interaction.user_id}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">المقال:</span> {interaction.article_id}
                  </div>
                </div>
              ))}
              {interactions.length === 0 && (
                <p className="text-gray-500 text-center py-8">لا توجد تفاعلات محفوظة</p>
              )}
            </div>
          </div>
        </div>

        {/* ملخص الحالة */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">📈 ملخص حالة النظام</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">مستخدم</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{articles.length}</div>
              <div className="text-sm text-green-800 dark:text-green-200">مقال</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{interactions.length}</div>
              <div className="text-sm text-purple-800 dark:text-purple-200">تفاعل</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {results.filter(r => r.status === 'success').length}/{results.length}
              </div>
              <div className="text-sm text-red-800 dark:text-red-200">نجح/المجموع</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 