"use client";

import dynamic from "next/dynamic";

const DynamicCommentsClient = dynamic(
  () => import("@/components/article/CommentsClient"),
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-6 text-sm text-gray-500">
        جاري تحميل التعليقات…
      </div>
    ),
  }
);

interface CommentsSectionProps {
  articleId: string;
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  return (
    <section id="comments" dir="rtl" className="mt-8 sm:mt-12">
      {/* @ts-expect-error: next/dynamic typing */}
      <DynamicCommentsClient articleId={articleId} />
    </section>
  );
}
