"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface RelatedArticle {
  id: string;
  title: string;
  slug?: string;
}

export default function RelatedArticles({ articleId, categoryId }: { articleId: string; categoryId?: string }) {
  const [items, setItems] = useState<RelatedArticle[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const q = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
        const res = await fetch(`/api/articles/related${q}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        setItems(Array.isArray(data?.articles) ? data.articles.slice(0,6) : []);
      } catch {}
    };
    load();
  }, [articleId, categoryId]);

  if (items.length === 0) return null;
  return (
    <div className="rounded-xl p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">مقالات ذات صلة</h3>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id}>
            <Link href={`/article/${it.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
              {it.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


