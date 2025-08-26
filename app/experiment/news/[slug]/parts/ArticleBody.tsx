"use client";
import { useMemo } from "react";
import { Calendar, Clock, BookOpen, Eye } from "lucide-react";

type Props = {
  html: string;
  article: { 
    id: string; 
    title: string; 
    author?: { name: string | null } | null; 
    published_at?: Date | null; 
    readMinutes?: number | null;
    views?: number;
  };
};

export default function ArticleBody({ html, article }: Props) {
  const content = useMemo(() => html || "", [html]);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-img:rounded-xl prose-headings:font-bold prose-p:leading-relaxed prose-p:text-[18px] prose-li:text-[18px] [--tw-prose-bullets:theme(colors.neutral.500)]">
      {/* محتوى HTML القادم من الخادم */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}


