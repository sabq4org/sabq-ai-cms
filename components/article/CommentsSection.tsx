"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const DynamicEditorComments = dynamic(() => import("@/components/Editor/CommentsSystem"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-6 text-sm text-gray-500">جاري تحميل التعليقات…</div>
  ),
});

interface CommentsSectionProps {
  articleId: string;
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  // مبدئيًا نستخدم مستخدمًا افتراضيًا لعرض القسم (يمكن ربطه بنظام العضويات لاحقًا)
  const currentUser = { id: "guest", name: "زائر", email: "guest@example.com" };

  return (
    <section id="comments" dir="rtl" className="mt-8 sm:mt-12">
      <Suspense fallback={<div className="text-center py-6">...جاري التحميل</div>}>
        {/* @ts-expect-error: Dynamic component has default export with props */}
        <DynamicEditorComments documentId={articleId} currentUser={currentUser} />
      </Suspense>
    </section>
  );
}


