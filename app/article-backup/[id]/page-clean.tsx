import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: { name: string };
  published_at?: string;
  category?: { name: string };
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/articles/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const article = await response.json();
    return article;
  } catch (error) {
    console.error('خطأ في جلب المقال:', error);
    return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);
  
  if (!article) {
    notFound();
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{article.title}</h1>
      
      {article.excerpt && (
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
          {article.excerpt}
        </p>
      )}
      
      <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '2rem' }}>
        {article.author?.name && <span>بواسطة: {article.author.name}</span>}
        {article.published_at && (
          <span style={{ marginLeft: '1rem' }}>
            تاريخ النشر: {new Date(article.published_at).toLocaleDateString('ar')}
          </span>
        )}
      </div>
      
      <div 
        style={{ lineHeight: '1.8', fontSize: '1.1rem' }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
}
