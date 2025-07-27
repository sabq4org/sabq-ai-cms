import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleData, getFullImageUrl, getFullArticleUrl, prepareKeywords } from '@/lib/article-api';
import ArticleClientComponent from './ArticleClientComponent';

// إنشاء Metadata ديناميكي للمقال
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    
    // استخدام تنسيق مبسط للـ metadata لتجنب أخطاء SSR
    return {
      title: 'مقال | صحيفة سبق الالكترونية AI',
      description: 'اقرأ آخر الأخبار والتحليلات على صحيفة سبق الالكترونية AI',
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('[generateMetadata] خطأ في إنشاء Metadata:', error);
    return {
      title: 'مقال | صحيفة سبق الالكترونية AI',
      description: 'اقرأ آخر الأخبار والتحليلات على صحيفة سبق الالكترونية AI',
    };
  }
}

// الصفحة الرئيسية - Server Component
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    // جلب البيانات في السيرفر
    const resolvedParams = await params;
    
    // معالجة URL-encoded IDs
    let articleId = resolvedParams.id;
    try {
      // فك ترميز URL إذا كان مُرمزاً
      const decodedId = decodeURIComponent(articleId);
      console.log(`[ArticlePage] معالجة المعرف: ${articleId} -> ${decodedId}`);
      articleId = decodedId;
    } catch (error) {
      console.warn(`[ArticlePage] خطأ في فك ترميز المعرف:`, error);
    }
    
    const article = await getArticleData(articleId);

    if (!article) {
      console.warn(`[ArticlePage] لم يتم العثور على مقال بالمعرف:`, articleId);
      
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
          <h1 style={{color: '#1f2937', marginBottom: '1rem'}}>المقال غير متوفر</h1>
          <p style={{color: '#6b7280', fontSize: '1.1rem', lineHeight: 1.8}}>
            عذراً، لم نتمكن من العثور على المقال المطلوب.
          </p>
          <a 
            href="/" 
            style={{
              display: 'inline-block',
              marginTop: '2rem',
              padding: '0.75rem 2rem',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 500
            }}
          >
            العودة للرئيسية
          </a>
        </div>
      );
    }

    // تمرير البيانات للـ Client Component
    return <ArticleClientComponent initialArticle={article} articleId={articleId} />;
    
  } catch (error) {
    console.error('[ArticlePage] خطأ عام في الصفحة:', error);
    
    return (
      <div style={{
        padding: '3rem', 
        textAlign: 'center', 
        background: '#fef2f2', 
        borderRadius: '12px', 
        margin: '4rem auto', 
        maxWidth: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{color: '#dc2626', marginBottom: '1rem'}}>حدث خطأ</h1>
        <p style={{color: '#6b7280', fontSize: '1.1rem', lineHeight: 1.8}}>
          عذراً، حدث خطأ في تحميل المقال. يرجى المحاولة مرة أخرى.
        </p>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            marginTop: '2rem',
            padding: '0.75rem 2rem',
            background: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 500
          }}
        >
          العودة للرئيسية
        </a>
      </div>
    );
  }
}

// تحسين الأداء - إنشاء صفحات ثابتة للمقالات الشائعة
export async function generateStaticParams() {
  // يمكن تحسين هذا بجلب المقالات الأكثر شعبية
  return [];
}
