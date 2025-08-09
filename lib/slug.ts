import { PrismaClient } from "@prisma/client";
import { nanoid } from 'nanoid';
const slug = require("slug");

slug.set("defaults", {
  replacement: "-",
  symbols: true,
  remove: /[.]/g,
  lower: true,
});

const ARABIC_TO_LATIN_MAP: { [key: string]: string } = {
  ء: "",
  أ: "a",
  إ: "e",
  آ: "a",
  ٱ: "a",
  ا: "a",
  ب: "b",
  ة: "t",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ى: "a",
  ي: "y",
  "ً": "",
  "ٌ": "",
  "ٍ": "",
  "َ": "",
  "ُ": "",
  "ِ": "",
  "ْ": "",
  "ّ": "",
};

export function slugify(input: string): string {
  if (!input) return "";

  // 1. Transliterate Arabic to Latin
  let transliterated = "";
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    transliterated += ARABIC_TO_LATIN_MAP[char] || char;
  }

  // 2. Normalize and clean the string
  return transliterated
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-latin, non-numeric, non-space, non-hyphen chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single one
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end
}

export function generateShortSlug(): string {
  return nanoid(8); // 8 characters for a good balance of brevity and uniqueness
}

export async function ensureUniqueSlug(
  prisma: PrismaClient,
  baseSlug: string,
  isShort: boolean = false
): Promise<string> {
  if (isShort) {
    let slug = generateShortSlug();
    while (true) {
      const exists = await prisma.articles.findFirst({ where: { slug }, select: { id: true } });
      if (!exists) return slug;
      slug = generateShortSlug(); // Generate a new one if collision happens
    }
  }

  if (!baseSlug) baseSlug = `article-${Date.now()}`;
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const exists = await prisma.articles.findFirst({
      where: { slug },
      select: { id: true },
    });
    if (!exists) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}

export function resolveContentType(input?: string | null): "NEWS" | "OPINION" {
  const val = (input || "").toString().toLowerCase();
  if (
    ["opinion", "analysis", "interview", "op-ed", "op_ed", "op"].includes(val)
  ) {
    return "OPINION";
  }
  return "NEWS";
}
