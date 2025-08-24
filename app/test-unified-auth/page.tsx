"use client";

/**
 * صفحة اختبار نظام المصادقة الموحد
 * لاختبار حل مشاكل التضارب بين الأنظمة
 */

import React, { useState } from 'react';
import UnifiedLayout from '@/components/layout/UnifiedLayout';
import UnifiedCommentSystem from '@/components/comments/UnifiedCommentSystem';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  MessageSquare,
  LogIn,
  LogOut,
  AlertTriangle
} from 'lucide-react';

export default function TestUnifiedAuthPage() {
  const { user, loading, isAuthenticated, isAdmin, refreshUser, logout } = useUnifiedAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  const runAuthTests = async () => {
    const results = [];
    
    // اختبار 1: حالة المصادقة
    results.push({
      test: 'حالة المصادقة',
      status: isAuthenticated ? 'نجح' : 'فشل',
      details: `المستخدم ${isAuthenticated ? 'مسجل دخول' : 'غير مسجل دخول'}`,
      success: true // هذا اختبار معلوماتي فقط
    });

    // اختبار 2: بيانات المستخدم
    results.push({
      test: 'بيانات المستخدم',
      status: user ? 'نجح' : 'فشل',
      details: user ? `الاسم: ${user.name}, البريد: ${user.email}` : 'لا توجد بيانات مستخدم',
      success: !!user
    });

    // اختبار 3: صلاحيات الإدارة
    results.push({
      test: 'صلاحيات الإدارة',
      status: isAdmin ? 'مدير' : 'مستخدم عادي',
      details: `الدور: ${user?.role || 'غير محدد'}`,
      success: true // هذا اختبار معلوماتي فقط
    });

    // اختبار 4: API المصادقة
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      const apiResult = await response.json();
      
      results.push({
        test: 'API المصادقة',
        status: response.ok ? 'نجح' : 'فشل',
        details: response.ok ? `API يتعرف على المستخدم: ${apiResult.user?.name || 'مجهول'}` : 'API لا يتعرف على المستخدم',
        success: response.ok && apiResult.success
      });
    } catch (error) {
      results.push({
        test: 'API المصادقة',
        status: 'خطأ',
        details: `خطأ في الاتصال: ${error}`,
        success: false
      });
    }

    // اختبار 5: تزامن التخزين المحلي
    const localUser = localStorage.getItem('user');
    const localUserId = localStorage.getItem('user_id');
    
    results.push({
      test: 'التخزين المحلي',
      status: localUser && localUserId ? 'متزامن' : 'غير متزامن',
      details: `المستخدم المحلي: ${localUserId || 'غير موجود'}`,
      success: !!(localUser && localUserId && user)
    });

    setTestResults(results);
  };

  const handleRefreshUser = async () => {
    try {
      await refreshUser();
      await runAuthTests();
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await runAuthTests();
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  React.useEffect(() => {
    if (!loading) {
      runAuthTests();
    }
  }, [loading, user, isAuthenticated]);

  if (loading) {
    return (
      <UnifiedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">جاري تحميل نظام المصادقة...</p>
            </div>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            🔐 اختبار نظام المصادقة الموحد
          </h1>
          <p className="text-gray-600 mb-6">
            هذه الصفحة تختبر حل مشاكل تضارب أنظمة المصادقة بين الهيدر والتعليقات ولوحة التحكم.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={runAuthTests}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة اختبار
            </button>
            
            <button
              onClick={handleRefreshUser}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              تحديث المستخدم
            </button>
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            )}
          </div>
        </div>

        {/* حالة المستخدم الحالية */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            حالة المستخدم الحالية
          </h2>
          
          {isAuthenticated && user ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">{user.name}</h3>
                  <p className="text-green-600">{user.email}</p>
                </div>
                {isAdmin && (
                  <div className="mr-auto">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      مدير
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">الدور:</span>
                  <span className="text-green-600 mr-2">{user.role || 'مستخدم'}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">الحالة:</span>
                  <span className="text-green-600 mr-2">{user.is_verified ? 'مفعل' : 'غير مفعل'}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">نقاط الولاء:</span>
                  <span className="text-green-600 mr-2">{user.loyalty_points || 0}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">اللغة المفضلة:</span>
                  <span className="text-green-600 mr-2">{user.preferred_language || 'ar'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">غير مسجل دخول</h3>
                  <p className="text-yellow-600">يرجى تسجيل الدخول لاختبار النظام بالكامل</p>
                </div>
                <div className="mr-auto">
                  <a
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    تسجيل الدخول
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* نتائج الاختبارات */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              نتائج اختبارات المصادقة
            </h2>
            
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <h4 className={`font-medium ${
                          result.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {result.test}
                        </h4>
                        <p className={`text-sm ${
                          result.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.details}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.success
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* اختبار نظام التعليقات */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            اختبار نظام التعليقات الموحد
          </h2>
          <p className="text-gray-600 mb-6">
            يجب أن يعكس نظام التعليقات نفس حالة تسجيل الدخول الظاهرة في الهيدر.
          </p>
          
          <UnifiedCommentSystem
            articleId="test_article_123"
            articleTitle="مقال اختبار نظام المصادقة الموحد"
            articleSlug="test-unified-auth-article"
            initialComments={[]}
            enableRealTime={false}
            moderationEnabled={true}
          />
        </div>

        {/* معلومات إضافية */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ℹ️ معلومات مهمة
          </h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <p>• يجب أن تكون حالة تسجيل الدخول متطابقة في الهيدر ونظام التعليقات</p>
            <p>• عند تسجيل الدخول كمدير، يجب أن تظهر روابط لوحة التحكم في الهيدر</p>
            <p>• عند النقر على "تسجيل الدخول" في التعليقات، يجب التوجه لصفحة دخول المستخدمين وليس الإداريين</p>
            <p>• يجب أن تعمل الجلسات بشكل موحد بين جميع أجزاء الموقع</p>
          </div>
        </div>

      </div>
    </UnifiedLayout>
  );
}
