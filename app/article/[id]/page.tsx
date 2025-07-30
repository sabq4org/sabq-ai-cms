'use client';

import { ArticleData } from '@/lib/article-api';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getArticleError, logArticleError, isValidArticleId } from '@/lib/utils/article-error-handler';

// تحميل ديناميكي للمكون لتجنب مشاكل SSR
const ArticleClientComponent = dynamic(() => import('./ArticleClientComponent'), {
  ssr: false,
  loading: () => (
    <div style={{
      padding: '3rem', 
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{color: '#6b7280'}}>جاري تحميل المقال...</p>
      </div>
    </div>
  )
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArticlePage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      try {
        const resolved = await params;
        setResolvedParams(resolved);
        
        console.log(`⏳ جاري جلب المقال: ${resolved.id}`);
        
        // التحقق من صلاحية معرف المقال
        if (!isValidArticleId(resolved.id)) {
          console.error(`❌ معرف المقال غير صالح: ${resolved.id}`);
          const error = getArticleError(null, null, null, resolved.id);
          logArticleError(error);
          setError(error.message + '. ' + (error.details || ''));
          setArticle(null);
          return;
        }
        
        // إضافة timeout لتجنب الانتظار اللانهائي
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني
        
        let response: Response | null = null;
        let responseData: any = null;
        
        try {
          // جلب المقال
          response = await fetch(`/api/articles/${resolved.id}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          console.log(`📊 حالة الاستجابة: ${response.status}`);
          
          if (response.ok) {
            responseData = await response.json();
            console.log('📦 البيانات المستلمة:', responseData);
            
            if (!responseData || responseData.success === false || !responseData.id) {
              const error = getArticleError(response.status, responseData, null, resolved.id);
              logArticleError(error);
              setError(error.message + '. ' + (error.details || ''));
              setArticle(null);
            } else {
              setArticle(responseData);
            }
          } else {
            // محاولة قراءة تفاصيل الخطأ من الاستجابة
            try {
              responseData = await response.json();
              console.log('📦 تفاصيل الخطأ:', responseData);
              
              // استخدام رسالة الخطأ المخصصة من الخادم
              if (responseData.error) {
                setError(responseData.error + '. ' + (responseData.details || ''));
              } else {
                const error = getArticleError(response.status, responseData, null, resolved.id);
                logArticleError(error);
                setError(error.message + '. ' + (error.details || ''));
              }
            } catch {
              // إذا فشلت قراءة JSON، استخدم رسالة الخطأ الافتراضية
              const error = getArticleError(response.status, null, null, resolved.id);
              logArticleError(error);
              setError(error.message + '. ' + (error.details || ''));
            }
            setArticle(null);
          }
        } catch (fetchError) {
          const error = getArticleError(
            response?.status || null,
            responseData,
            fetchError,
            resolved.id
          );
          logArticleError(error);
          setError(error.message + '. ' + (error.details || ''));
          setArticle(null);
        }
      } catch (err) {
        console.error('❌ خطأ في تحميل المقال:', err);
        setError('حدث خطأ في تحميل المقال');
      } finally {
        setLoading(false);
      }
    };

    loadParams();
  }, [params]);

  if (loading) {
    return (
      <div style={{
        padding: '3rem', 
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{color: '#6b7280'}}>جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (error || !article || !resolvedParams) {
    // تحديد نوع الخطأ بناءً على الرسالة
    let errorIcon = '📄';
    let errorTitle = 'عذراً، المقال غير موجود';
    let errorMessage = error || 'المقال الذي تبحث عنه غير متوفر حالياً.';
    let errorDetails = 'قد يكون المقال قد تم نقله أو حذفه.';
    let errorColor = '#dc2626'; // أحمر للأخطاء العامة
    
    if (error?.includes('غير منشور') || error?.includes('قيد المراجعة')) {
      errorIcon = '⏳';
      errorTitle = 'المقال قيد المراجعة';
      errorDetails = 'هذا المقال لم يتم نشره بعد أو يخضع للمراجعة حالياً.';
      errorColor = '#f59e0b'; // برتقالي للمراجعة
    } else if (error?.includes('البيانات المستلمة غير صالحة') || error?.includes('غير مكتملة')) {
      errorIcon = '⚠️';
      errorTitle = 'خطأ في تحميل البيانات';
      errorDetails = 'حدث خطأ في استرجاع بيانات المقال. يرجى المحاولة مرة أخرى.';
      errorColor = '#ef4444'; // أحمر للأخطاء التقنية
    } else if (error?.includes('انتهت مهلة الانتظار') || error?.includes('خطأ في الاتصال')) {
      errorIcon = '🌐';
      errorTitle = 'مشكلة في الاتصال';
      errorDetails = 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى.';
      errorColor = '#6366f1'; // بنفسجي لأخطاء الشبكة
    } else if (error?.includes('تم حذفه') || error?.includes('تمت أرشفته')) {
      errorIcon = '🗑️';
      errorTitle = 'المقال محذوف أو مؤرشف';
      errorDetails = 'تم حذف هذا المقال أو نقله إلى الأرشيف.';
      errorColor = '#6b7280'; // رمادي للمحذوف
    }
    
    return (
      <div style={{
        padding: '3rem', 
        textAlign: 'center', 
        background: '#f8f9fa', 
        borderRadius: '12px', 
        margin: '4rem auto', 
        maxWidth: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          opacity: 0.3,
          color: errorColor
        }}>
          {errorIcon}
        </div>
        <h1 style={{
          color: '#1f2937', 
          marginBottom: '1rem',
          fontSize: '1.75rem',
          fontWeight: '600'
        }}>
          {errorTitle}
        </h1>
        <p style={{
          color: '#6b7280', 
          fontSize: '1rem', 
          lineHeight: 1.8,
          marginBottom: '0.5rem'
        }}>
          {errorMessage}
        </p>
        <p style={{
          color: '#9ca3af', 
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {errorDetails}
        </p>
        
        <div style={{ marginTop: '2rem' }}>
          <a 
            href="/" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            العودة للصفحة الرئيسية
          </a>
        </div>
        
        {resolvedParams && (
          <p style={{
            color: '#9ca3af', 
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            background: '#f3f4f6',
            padding: '0.5rem',
            borderRadius: '4px',
            wordBreak: 'break-all',
            marginTop: '1rem'
          }}>
            معرف المقال: {resolvedParams.id}
          </p>
        )}
      </div>
    );
  }
  
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
      
      <ArticleClientComponent 
        initialArticle={article} 
        articleId={resolvedParams.id} 
      />
    </>
  );
}
