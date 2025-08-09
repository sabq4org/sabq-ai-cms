"use client";

import { MuqtarabArticle } from "@/types/muqtarab";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MuqtarabArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<MuqtarabArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        // This is a new API route we will create to fetch a single article by slug
        const response = await fetch(`/api/muqtarab/articles/${slug}`);
        if (!response.ok) {
          toast.error("المقال غير موجود");
          router.push("/muqtarab");
          return;
        }
        const data = await response.json();
        setArticle(data.article);
      } catch (error) {
        console.error("Failed to fetch article:", error);
        toast.error("حدث خطأ أثناء تحميل المقال");
      } finally {
        setLoading(false);
      }
    };
    fetchArticleData();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">المقال غير موجود</h1>
          <Link href="/muqtarab">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              العودة إلى مُقترب
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <Link href="/muqtarab" className="text-blue-600 hover:underline flex items-center gap-2 mb-4">
            <ArrowLeft size={16} />
            العودة إلى مُقترب
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{article.title}</h1>
          <p className="text-lg text-gray-500">{article.excerpt}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500 mt-4 border-t border-b py-3">
            <div className="flex items-center gap-2">
              <User size={14} />
              <span>{article.author?.name || "فريق التحرير"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{new Date(article.publishDate || article.createdAt).toLocaleDateString("ar-SA")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{article.readingTime || 5} دقائق قراءة</span>
            </div>
          </div>
        </header>

        {article.coverImage && (
          <div className="relative h-96 w-full rounded-xl overflow-hidden mb-8">
            <Image src={article.coverImage} alt={article.title} layout="fill" objectFit="cover" />
          </div>
        )}

        <article
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <footer className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-1">
                <Eye size={16} /> {article.views || 0}
              </div>
              <div className="flex items-center gap-1">
                <Heart size={16} /> {article.likes || 0}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={16} /> {article.comments || 0}
              </div>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <Share2 size={16} />
              مشاركة
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
