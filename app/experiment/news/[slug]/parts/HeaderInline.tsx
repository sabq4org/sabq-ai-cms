"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Bookmark, Share2, Moon, Sun, ChevronLeft } from "lucide-react";

type Props = {
  article: { id: string; title: string; categories?: { name: string; slug: string } | null };
};

export default function HeaderInline({ article }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="mx-auto max-w-[1280px] px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition">الرئيسية</Link>
          <ChevronLeft className="w-4 h-4 opacity-40" />
          {article?.categories?.name ? (
            <Link href={`/category/${article.categories.slug}`} className="hover:text-neutral-900 dark:hover:text-white transition">
              {article.categories.name}
            </Link>
          ) : (
            <span>أخبار</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button aria-label="حفظ" className="inline-flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900">
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">حفظ</span>
          </button>
          <button aria-label="مشاركة" className="inline-flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">مشاركة</span>
          </button>
          <button
            aria-label="تبديل الوضع الليلي"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">الوضع</span>
          </button>
        </div>
      </div>
    </header>
  );
}


