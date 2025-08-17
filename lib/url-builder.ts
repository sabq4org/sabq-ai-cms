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
  if (contentType === "NEWS") {
    if (useDatedNewsPath && publishedAt) {
      const d = new Date(publishedAt);
      const yyyy = String(d.getUTCFullYear());
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `/news/${yyyy}/${mm}/${dd}/${slug}`;
    }
    return `/news/${slug}`;
  }
  return `/article/${slug}`;
}

export function linkTo(item: {
  slug: string;
  contentType: ContentType;
}): string {
  return item.contentType === "NEWS"
    ? `/news/${item.slug}`
    : `/article/${item.slug}`;
}

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
  const base = envUrl || "https://sabq.io";
  return base.replace(/\/$/, "");
}
