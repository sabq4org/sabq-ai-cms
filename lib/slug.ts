import { PrismaClient } from "@prisma/client";
import slug from 'slug';

slug.set('defaults', {
  mode: 'rfc3986',
  charmap: slug.charmap,
  multicharmap: slug.multicharmap,
});

export function slugify(input: string): string {
  if (!input) return "";
  return slug(input, {
    lower: true,
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
  });
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


