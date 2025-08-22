interface Props {
  params: Promise<{id: string}>;
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  
  try {
    const response = await fetch(`http://localhost:3000/api/articles/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return <div>لم يتم العثور على المقال</div>;
    }

    const article = await response.json();

    return (
      <div className="container mx-auto px-4 py-8">
        <article className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <div className="mb-6">
            <span className="text-gray-600">بقلم: {article.author_name}</span>
            <span className="mx-2">•</span>
            <span className="text-gray-600">{article.category_name}</span>
            <span className="mx-2">•</span>
            <span className="text-gray-600">{new Date(article.published_at).toLocaleDateString('ar')}</span>
          </div>
          
          {article.featured_image && (
            <img 
              src={article.featured_image} 
              alt={article.title}
              className="w-full h-auto mb-6 rounded-lg"
            />
          )}
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>
    );
  } catch (error) {
    console.error('خطأ في تحميل المقال:', error);
    return <div>خطأ في تحميل المقال</div>;
  }
}
