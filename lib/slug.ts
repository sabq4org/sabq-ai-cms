import { PrismaClient } from "@prisma/client";

export function slugify(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureUniqueSlug(
  prisma: PrismaClient,
  baseSlug: string
): Promise<string> {
  if (!baseSlug) baseSlug = `article-${Date.now()}`;
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const exists = await prisma.articles.findFirst({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}

export function resolveContentType(input?: string | null): "NEWS" | "OPINION" {
  const val = (input || "").toString().toLowerCase();
  if (["opinion", "analysis", "interview", "op-ed", "op_ed", "op"].includes(val)) {
    return "OPINION";
  }
  return "NEWS";
}


