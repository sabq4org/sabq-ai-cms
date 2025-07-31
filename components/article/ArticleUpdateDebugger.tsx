'use client';

import { useEffect } from 'react';

/**
 * مكون لتصحيح مشاكل تحديث المقالات
 * يضيف وظائف تصحيح للنافذة لاستخدامها في Console
 */
export function ArticleUpdateDebugger() {
  useEffect(() => {
    // إضافة وظائف تصحيح للنافذة
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.debugArticleUpdate = async (articleId: string, data: any) => {
        console.group('🔍 تصحيح تحديث المقال');
        console.log('🆔 معرف المقال:', articleId);
        console.log('📤 البيانات المرسلة:', data);
        console.time('⏱️ وقت الطلب');

        try {
          const response = await fetch(`/api/articles/${articleId}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'X-Debug-Mode': 'true'
            },
            body: JSON.stringify(data)
          });

          const result = await response.json();
          
          console.log('📥 حالة الاستجابة:', response.status);
          console.log('📥 البيانات المستلمة:', result);
          
          if (!response.ok) {
            console.error('❌ خطأ:', result.error);
            console.error('📝 التفاصيل:', result.details);
          } else {
            console.log('✅ نجح التحديث');
          }
          
          console.timeEnd('⏱️ وقت الطلب');
          console.groupEnd();
          
          return result;
        } catch (error) {
          console.error('❌ خطأ في الاتصال:', error);
          console.groupEnd();
          throw error;
        }
      };

      // @ts-ignore
      window.testArticleUpdate = async (articleId: string) => {
        console.log('🧪 اختبار تحديث المقال:', articleId);
        
        const tests = [
          {
            name: 'تحديث العنوان',
            data: { title: 'عنوان اختباري' }
          },
          {
            name: 'إزالة التمييز',
            data: { is_featured: false }
          },
          {
            name: 'تحديث فارغ',
            data: {}
          }
        ];

        for (const test of tests) {
          console.log(`\n🔸 ${test.name}:`);
          try {
            // @ts-ignore
            await window.debugArticleUpdate(articleId, test.data);
          } catch (error) {
            console.error('فشل الاختبار');
          }
        }
      };

      // @ts-ignore
      window.interceptFormSubmit = () => {
        console.log('🎯 تفعيل اعتراض نماذج التحديث...');
        
        // اعتراض جميع نماذج submit
        document.addEventListener('submit', async (e) => {
          const form = e.target as HTMLFormElement;
          const action = form.action;
          
          if (action && action.includes('/api/articles/')) {
            e.preventDefault();
            console.group('🚦 اعتراض نموذج التحديث');
            console.log('📋 النموذج:', form);
            
            // جمع البيانات من النموذج
            const formData = new FormData(form);
            const data: any = {};
            formData.forEach((value, key) => {
              data[key] = value;
            });
            
            console.log('📤 بيانات النموذج:', data);
            console.groupEnd();
            
            // السماح للمستخدم بتعديل البيانات
            const proceed = window.confirm(
              'تم اعتراض النموذج. راجع Console للتفاصيل.\n\nهل تريد المتابعة بإرسال النموذج؟'
            );
            
            if (proceed) {
              form.submit();
            }
          }
        }, true);
        
        console.log('✅ تم تفعيل اعتراض النماذج');
      };

      // رسالة ترحيب
      console.log(
        '%c🛠️ أدوات تصحيح تحديث المقالات متاحة!',
        'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;'
      );
      console.log('الأوامر المتاحة:');
      console.log('1. debugArticleUpdate(articleId, data) - اختبار تحديث مقال');
      console.log('2. testArticleUpdate(articleId) - تشغيل اختبارات متعددة');
      console.log('3. interceptFormSubmit() - اعتراض نماذج التحديث');
      console.log('\nمثال:');
      console.log('debugArticleUpdate("article_1753871540813_vlvief9dk", { title: "عنوان جديد" })');
    }

    // تنظيف عند إلغاء التحميل
    return () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        delete window.debugArticleUpdate;
        // @ts-ignore
        delete window.testArticleUpdate;
        // @ts-ignore
        delete window.interceptFormSubmit;
      }
    };
  }, []);

  return null;
}

/**
 * Hook لتسجيل محاولات التحديث
 */
export function useArticleUpdateLogger() {
  const logUpdateAttempt = (articleId: string, data: any, response: any, error?: any) => {
    if (typeof window === 'undefined') return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      articleId,
      data,
      response,
      error,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // حفظ في localStorage للمراجعة لاحقاً
    const logs = JSON.parse(localStorage.getItem('articleUpdateLogs') || '[]');
    logs.push(logEntry);
    
    // الاحتفاظ بآخر 50 محاولة فقط
    if (logs.length > 50) {
      logs.shift();
    }
    
    localStorage.setItem('articleUpdateLogs', JSON.stringify(logs));
    
    // طباعة في Console
    if (error) {
      console.error('❌ فشل تحديث المقال:', logEntry);
    } else {
      console.log('📝 محاولة تحديث المقال:', logEntry);
    }
  };

  const getUpdateLogs = () => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('articleUpdateLogs') || '[]');
  };

  const clearUpdateLogs = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('articleUpdateLogs');
    console.log('✅ تم مسح سجلات التحديث');
  };

  return {
    logUpdateAttempt,
    getUpdateLogs,
    clearUpdateLogs
  };
}