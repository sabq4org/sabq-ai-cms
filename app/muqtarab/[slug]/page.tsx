export const revalidate = 180;
import PageClient from "./PageClient";
import prisma from "@/lib/prisma";
import { cached } from "@/lib/cache";
import { notFound } from "next/navigation";
import { Angle } from "@/types/muqtarab";

export default async function AnglePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const angle = await cached<Angle | null>(`muq:angle:${slug}:v1`, 300, async () => {
    const row = await prisma.muqtarabCorner.findFirst({
      where: { slug, is_active: true },
      select: { id: true, name: true, slug: true, description: true, theme_color: true, cover_image: true, is_featured: true, created_at: true, updated_at: true, author_name: true }
    });
    if (!row) return null;
    const count = await prisma.muqtarabArticle.count({ where: { corner_id: row.id, status: "published" } });
    return {
      id: row.id,
      title: row.name,
      slug: row.slug,
      description: row.description || "",
      icon: null,
      themeColor: row.theme_color || "#2563eb",
      coverImage: row.cover_image || null,
      isFeatured: row.is_featured || false,
      isPublished: true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: row.author_name ? { id: row.id, name: row.author_name } : null,
      articlesCount: count
    } as unknown as Angle;
  });

  if (!angle) return notFound();

  const rawArticles = await cached<any[]>(`muq:angle:articles:${angle.id}:v1`, 180, async () => {
    return prisma.muqtarabArticle.findMany({
      where: { corner_id: angle.id, status: "published" },
      orderBy: { publish_at: "desc" },
      select: { id: true, title: true, excerpt: true, slug: true, cover_image: true, read_time: true, publish_at: true, created_at: true, views: true, tags: true, creator: { select: { id: true, name: true, avatar: true } } },
      take: 100,
    });
  });

  const initialArticles = rawArticles.map((a) => ({
    id: a.id,
    title: a.title,
    excerpt: a.excerpt || "",
    slug: a.slug || a.id,
    coverImage: a.cover_image || null,
    readingTime: a.read_time || 5,
    publishDate: a.publish_at || a.created_at,
    views: a.views || 0,
    tags: a.tags || [],
    author: a.creator ? { id: a.creator.id, name: a.creator.name || "فريق التحرير", avatar: a.creator.avatar } : undefined,
  }));

  return <PageClient initialAngle={angle} initialArticles={initialArticles} />;
}
