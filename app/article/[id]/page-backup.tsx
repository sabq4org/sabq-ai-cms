import { Metadata } from 'next';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

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

// Metadata بسيط
export const metadata: Metadata = {
  title: 'مقال | صحيفة سبق الالكترونية AI',
  description: 'اقرأ آخر الأخبار والتحليلات على صحيفة سبق الالكترونية AI',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const resolvedParams = await params;
  
  return (
    <div>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <Suspense fallback={
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
      }>
        <ArticleClientComponent 
          initialArticle={undefined as any} 
          articleId={resolvedParams.id} 
        />
      </Suspense>
    </div>
  );
}
