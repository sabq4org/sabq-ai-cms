"use client";

import Link from "next/link";

interface CategoryLike {
  id?: string;
  slug?: string;
  name?: string;
}

interface BreadcrumbsProps {
  category?: CategoryLike | null;
  title?: string;
  className?: string;
}

export default function Breadcrumbs({ category, title, className }: BreadcrumbsProps) {
  const categoryHref = category?.slug ? `/news/category/${category.slug}` : "/news";
  const categoryName = category?.name || "عام";

  return (
    <nav aria-label="مسار التنقل" className={className || "mb-3 sm:mb-4 text-sm"}>
      <ol className="flex items-center gap-2 text-gray-500">
        <li>
          <Link href="/" className="hover:text-gray-800">الرئيسية</Link>
        </li>
        <li className="text-gray-400">/</li>
        <li>
          <Link href={categoryHref} className="hover:text-gray-800">
            {categoryName}
          </Link>
        </li>
        {title && (
          <>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700 truncate max-w-[50vw]" title={title}>
              {title}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}


