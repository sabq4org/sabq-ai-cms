"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Angle, AngleArticle } from '@/types/muqtarab';

export default function MuqtarabCornerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [corner, setCorner] = useState<Angle | null>(null);
  const [articles, setArticles] = useState<AngleArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function fetchData() {
      try {
        setLoading(true);
        const cornerRes = await fetch(`/api/muqtarab/corners/${slug}`);
        if (!cornerRes.ok) throw new Error('Corner not found');
        const cornerData = await cornerRes.json();
        setCorner(cornerData.corner);

        const articlesRes = await fetch(`/api/muqtarab/corners/${cornerData.corner.id}/articles`);
        if (!articlesRes.ok) throw new Error('Could not fetch articles');
        const articlesData = await articlesRes.json();
        setArticles(articlesData.articles);
      } catch (error) {
        console.error('Failed to fetch corner data:', error);
        router.push('/muqtarab');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, router]);

  if (loading) return <div>Loading...</div>;
  if (!corner) return <div>Corner not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">{corner.title}</h1>
        <p className="text-lg text-gray-600">{corner.description}</p>
      </header>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <Link key={article.id} href={`/muqtarab/articles/${article.slug}`} className="block group">
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {article.coverImage && (
                <div className="relative h-48 w-full">
                  <Image src={article.coverImage} alt={article.title} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 line-clamp-2">{article.title}</h2>
                <p className="text-gray-700 text-sm line-clamp-3">{article.excerpt}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
