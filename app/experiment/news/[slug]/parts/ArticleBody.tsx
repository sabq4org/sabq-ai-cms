"use client";
import { useMemo } from "react";

type Props = {
  html: string;
  article: { id: string; title: string; author?: { name: string | null } | null; published_at?: Date | null; readMinutes?: number | null };
};

export default function ArticleBody({ html, article }: Props) {
  const content = useMemo(() => html || "", [html]);
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none prose-img:rounded-xl prose-headings:font-bold leading-8 [--tw-prose-bullets:theme(colors.neutral.500)]">
      <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-600 dark:text-neutral-300 mb-4">
        {article.author?.name && <span aria-label="الكاتب">{article.author.name}</span>}
        {article.published_at && (
          <time dateTime={article.published_at.toISOString()} className="opacity-80">
            {new Date(article.published_at).toLocaleDateString("ar-SA")}
          </time>
        )}
        {article.readMinutes && <span>قراءة {article.readMinutes} د</span>}
      </div>
      {/* محتوى HTML القادم من الخادم */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}


