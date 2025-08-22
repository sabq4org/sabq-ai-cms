interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div>
      <h1>مقال: {id}</h1>
      <p>هذا مقال للاختبار - معرف المقال: {id}</p>
    </div>
  );
}
