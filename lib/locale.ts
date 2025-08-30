// Locale and formatting utilities to enforce Gregorian dates and Western digits (0-9)

// Map Arabic-Indic (U+0660..U+0669) and Eastern Arabic-Indic (U+06F0..U+06F9) digits to Western ASCII digits
const ARABIC_INDIC = {
  "\u0660": "0", "\u0661": "1", "\u0662": "2", "\u0663": "3", "\u0664": "4",
  "\u0665": "5", "\u0666": "6", "\u0667": "7", "\u0668": "8", "\u0669": "9",
};
const EASTERN_ARABIC_INDIC = {
  "\u06F0": "0", "\u06F1": "1", "\u06F2": "2", "\u06F3": "3", "\u06F4": "4",
  "\u06F5": "5", "\u06F6": "6", "\u06F7": "7", "\u06F8": "8", "\u06F9": "9",
};

const ARABIC_INDIC_REGEX = /[\u0660-\u0669]/g; // ٠..٩
const EASTERN_ARABIC_INDIC_REGEX = /[\u06F0-\u06F9]/g; // ۰..۹

export function toWesternDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  const s = String(input);
  return s
    .replace(ARABIC_INDIC_REGEX, (d) => (ARABIC_INDIC as any)[d] || d)
    .replace(EASTERN_ARABIC_INDIC_REGEX, (d) => (EASTERN_ARABIC_INDIC as any)[d] || d);
}

export function formatNumber(value: number, opts: Intl.NumberFormatOptions = {}): string {
  // Force Western digits by using en-US locale
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, ...opts }).format(value);
}

export function formatDateISO(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  // Always return ISO 8601 UTC string to guarantee Gregorian and Western digits
  return d.toISOString();
}

export function parseNormalizedInt(value: string | null | undefined, fallback = 0): number {
  const normalized = toWesternDigits(value ?? "").trim();
  const n = parseInt(normalized, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function parseNormalizedFloat(value: string | null | undefined, fallback = 0): number {
  const normalized = toWesternDigits(value ?? "").trim();
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeDateInputToISO(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const normalized = toWesternDigits(String(value)).trim();
  // Accept forms like YYYY-MM-DD or YYYY-MM-DDTHH:mm[:ss]
  // If not parseable, return null (caller should handle and reject or default)
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function containsNonWesternDigits(input: string | null | undefined): boolean {
  if (!input) return false;
  const s = String(input);
  return ARABIC_INDIC_REGEX.test(s) || EASTERN_ARABIC_INDIC_REGEX.test(s);
}

// Note: Hijri-to-Gregorian conversion is intentionally not implemented to avoid
// heavy dependencies. All inputs must be Gregorian; callers should normalize
// digits and accept only ISO/Gregorian formats.
