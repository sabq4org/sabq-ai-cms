import prisma from "@/lib/prisma";
import { cache as redis } from "@/lib/redis-improved";
import { NextRequest, NextResponse } from "next/server";

type ModerationMode = "ai_only" | "human" | "hybrid";

interface ModerationSettings {
  mode: ModerationMode;
  aiThreshold: number; // 0..1
}

const REDIS_KEY = "settings:comments:moderation";

// Fallback in-memory storage عند غياب Redis في بيئة التطوير
let memorySettings: ModerationSettings | null = null;

export async function GET() {
  try {
    const stored = await redis.get<ModerationSettings>(REDIS_KEY);
    let settings: ModerationSettings | null = stored ?? null;

    // fallback: قاعدة البيانات ثم الذاكرة
    if (!settings) {
      try {
        const dbSetting = await prisma.site_settings.findFirst({
          where: { section: "comments_moderation" },
        });
        if (dbSetting?.data && typeof dbSetting.data === "object") {
          const d: any = dbSetting.data;
          if (d?.mode && typeof d.aiThreshold === "number") {
            settings = {
              mode: d.mode,
              aiThreshold: d.aiThreshold,
            } as ModerationSettings;
          }
        }
      } catch {}
    }
    const finalSettings: ModerationSettings = settings ||
      memorySettings || { mode: "hybrid", aiThreshold: 0.75 };

    const res = NextResponse.json({ success: true, data: finalSettings });
    res.headers.set("Cache-Control", "max-age=0, must-revalidate");
    return res;
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "فشل في جلب إعدادات الموديريشن" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ModerationSettings>;
    const mode = (body.mode as ModerationMode) || "hybrid";
    let aiThreshold =
      typeof body.aiThreshold === "number" ? body.aiThreshold : 0.75;
    aiThreshold = Math.min(1, Math.max(0, aiThreshold));

    const settings: ModerationSettings = { mode, aiThreshold };
    try {
      await redis.set(REDIS_KEY, settings, 60 * 60 * 24 * 30); // 30 يوم TTL
    } catch {
      // تجاهل خطأ Redis في التطوير
    }
    // حفظ في الذاكرة المحلية ليعمل الحفظ بدون Redis
    memorySettings = settings;

    // حفظ كذلك في قاعدة البيانات لضمان الثبات عبر عمليات السيرفر
    try {
      const existing = await prisma.site_settings.findFirst({
        where: { section: "comments_moderation" },
      });
      if (existing) {
        await prisma.site_settings.update({
          where: { id: existing.id },
          data: { data: settings, updated_at: new Date() },
        });
      } else {
        await prisma.site_settings.create({
          data: {
            id: `comments_moderation-${Date.now()}`,
            section: "comments_moderation",
            data: settings,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }
    } catch {}

    return NextResponse.json({ success: true, data: settings });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "فشل في حفظ إعدادات الموديريشن" },
      { status: 500 }
    );
  }
}
