import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// GET /api/settings
export async function GET() {
  try {
    // 1) حاول القراءة من قاعدة البيانات وجمع الأقسام المتاحة
    let general: any = {};
    let identity: any = {};
    try {
      const rows = await prisma.site_settings.findMany({});
      for (const row of rows) {
        if (row.section === "general") general = { ...(row.data as any) };
        if (row.section === "identity") identity = { ...(row.data as any) };
      }
    } catch (dbErr) {
      console.warn("⚠️ فشل قراءة إعدادات الموقع من قاعدة البيانات؛ سنجرب الملف.", dbErr);
    }

    // 2) fallback: قراءة من ملف public/site-settings.json إن وُجد
    try {
      const settingsPath = path.join(process.cwd(), "public", "site-settings.json");
      const raw = await fs.readFile(settingsPath, "utf8");
      const fileJson = JSON.parse(raw);
      general = { ...fileJson, ...general };
      if (!identity.siteName && general.siteName) identity.siteName = general.siteName;
      if (!general.logoUrl && fileJson.logoUrl) general.logoUrl = fileJson.logoUrl;
      if (!general.logoDarkUrl && fileJson.logoDarkUrl) general.logoDarkUrl = fileJson.logoDarkUrl;
    } catch {
      // ملف غير موجود؛ تجاهل
    }

    // 3) قيم افتراضية آمنة
    const data = {
      general: {
        logoUrl: general.logoUrl || "/logo.png",
        logoDarkUrl: general.logoDarkUrl || general.logoUrl || "/logo.png",
        siteName: general.siteName || "صحيفة سبق الإلكترونية",
      },
      identity: {
        logo: identity.logo || general.logoUrl || "/logo.png",
        logoDarkUrl: identity.logoDarkUrl || general.logoDarkUrl || "/logo.png",
        siteName: identity.siteName || general.siteName || "صحيفة سبق الإلكترونية",
      },
    };

    const res = NextResponse.json({ success: true, data });
    res.headers.set("Cache-Control", "no-store, max-age=0");
    return res;
  } catch (error) {
    console.error("❌ /api/settings error:", error);
    return NextResponse.json({ success: false, error: "SETTINGS_ERROR" }, { status: 500 });
  }
}

import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// جلب جميع الإعدادات
export async function GET(request: NextRequest) {
  try {
    // 1) محاولة القراءة من قاعدة البيانات
    try {
      const settings = await prisma.site_settings.findMany();
      const settingsObject: Record<string, any> = {};
      for (const setting of settings) {
        settingsObject[setting.section] = setting.data;
      }
      // إذا وُجد شعار في قسم general فنعيده مباشرة
      if (settingsObject.general?.logoUrl) {
        return NextResponse.json({ success: true, data: settingsObject });
      }
      // وإلا نتابع لقراءة الملف كاحتياطي
      const fallback = await readFileSettingsFallback();
      if (fallback) {
        settingsObject.general = {
          ...(settingsObject.general || {}),
          ...fallback,
        };
      }
      return NextResponse.json({ success: true, data: settingsObject });
    } catch (dbError) {
      console.warn(
        "⚠️ تعذر قراءة الإعدادات من قاعدة البيانات، سيتم استخدام الاحتياطي من الملف إن وُجد.",
        dbError
      );
      const fallback = await readFileSettingsFallback();
      return NextResponse.json({
        success: true,
        data: fallback ? { general: fallback } : {},
      });
    }
  } catch (error) {
    console.error("خطأ في جلب الإعدادات:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في جلب الإعدادات" },
      { status: 500 }
    );
  }
}

async function readFileSettingsFallback(): Promise<{
  logoUrl?: string;
  logoDarkUrl?: string;
} | null> {
  try {
    const settingsPath = path.join(
      process.cwd(),
      "public",
      "site-settings.json"
    );
    const content = await fs.readFile(settingsPath, "utf8");
    const json = JSON.parse(content);
    return { logoUrl: json.logoUrl, logoDarkUrl: json.logoDarkUrl };
  } catch {
    return null;
  }
}

// حفظ الإعدادات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // حفظ كل قسم من الإعدادات
    const sections = Object.keys(body);
    const results = [];

    for (const section of sections) {
      try {
        const existingSetting = await prisma.site_settings.findFirst({
          where: { section },
        });

        if (existingSetting) {
          // تحديث الإعدادات الموجودة
          const updated = await prisma.site_settings.update({
            where: { id: existingSetting.id },
            data: {
              data: body[section],
              updated_at: new Date(),
            },
          });
          results.push({ section, status: "updated" });
        } else {
          // إنشاء إعدادات جديدة
          const created = await prisma.site_settings.create({
            data: {
              id: `${section}-${Date.now()}`,
              section,
              data: body[section],
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          results.push({ section, status: "created" });
        }
      } catch (sectionError) {
        console.error(`خطأ في حفظ قسم ${section}:`, sectionError);
        results.push({ section, status: "error", error: sectionError });
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ الإعدادات بنجاح",
      results,
    });
  } catch (error) {
    console.error("خطأ في حفظ الإعدادات:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في حفظ الإعدادات" },
      { status: 500 }
    );
  }
}
