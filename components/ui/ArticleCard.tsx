import Link from 'next/link';
import { Eye, Clock3 } from 'lucide-react';

interface ArticleCardProps {
  href: string;
  title: string;
  subtitle?: string;
  image?: string;
  views?: number;
  readTime?: number;
  category?: string;
  categoryIcon?: string;
  dateLabel?: string;
}

export function ArticleCard({
  href,
  title,
  subtitle,
  image,
  views = 0,
  readTime,
  category,
  categoryIcon,
  dateLabel,
}: ArticleCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-card bg-white border"
      style={{ borderColor: '#f0f0ef' }}
      dir="rtl"
    >
      <div className="p-4">
        {image ? (
          <div className="mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        ) : null}

        {category ? (
          <div className="mb-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-white"
              style={{ borderColor: '#f0f0ef' }}
            >
              {categoryIcon ? <span className="text-sm">{categoryIcon}</span> : null}
              {category}
            </span>
          </div>
        ) : null}

        <h3 className="text-base md:text-lg font-bold leading-snug mb-1 text-gray-900">{title}</h3>
        {subtitle ? (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{subtitle}</p>
        ) : null}

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {views.toLocaleString()} مشاهدة
          </span>
          {readTime ? (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="w-4 h-4" />
              {readTime} د
            </span>
          ) : null}
          {dateLabel ? <span className="opacity-80">{dateLabel}</span> : null}
        </div>
      </div>
    </Link>
  );
}


