export type ContentType = "NEWS" | "OPINION";

export function buildPath({
  slug,
  contentType,
  publishedAt,
  useDatedNewsPath = false,
}: {
  slug: string;
  contentType: ContentType;
  publishedAt?: Date | string | null;
  useDatedNewsPath?: boolean;
}): string {
  if (useDatedNewsPath && publishedAt) {
    const d = new Date(publishedAt);
    const yyyy = String(d.getUTCFullYear());
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `/news/${yyyy}/${mm}/${dd}/${slug}`;
  }
  // تحويل جميع الروابط إلى /news/
  return `/news/${slug}`;
}

export function linkTo(item: {
  slug: string;
  contentType: ContentType;
}): string {
  // تحويل جميع الروابط إلى /news/ بدلاً من /article/
  return `/news/${item.slug}`;
}

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
  const base = envUrl || "https://sabq.io";
  return base.replace(/\/$/, "");
}
