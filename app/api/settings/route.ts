import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

async function readFileSettingsFallback(): Promise<{ logoUrl?: string; logoDarkUrl?: string; siteName?: string; } | null> {
  try {
    const settingsPath = path.join(process.cwd(), "public", "site-settings.json");
    const content = await fs.readFile(settingsPath, "utf8");
    const json = JSON.parse(content);
    return { logoUrl: json.logoUrl, logoDarkUrl: json.logoDarkUrl, siteName: json.siteName };
  } catch {
    return null;
  }
}

// GET /api/settings
export async function GET(_req: NextRequest) {
  try {
    const settingsObject: Record<string, any> = {};

    // 1) قراءة من قاعدة البيانات
    try {
      const rows = await prisma.site_settings.findMany();
      for (const row of rows) {
        settingsObject[row.section] = row.data;
      }
    } catch (dbErr) {
      console.warn("⚠️ فشل قراءة إعدادات DB:", dbErr);
    }

    // 2) دمج احتياطي من الملف
    const fallback = await readFileSettingsFallback();
    const general = {
      logoUrl: settingsObject.general?.logoUrl || fallback?.logoUrl || "/logo.png",
      logoDarkUrl: settingsObject.general?.logoDarkUrl || fallback?.logoDarkUrl || settingsObject.general?.logoUrl || "/logo.png",
      siteName: settingsObject.general?.siteName || fallback?.siteName || "صحيفة سبق الإلكترونية",
    };
    const identity = {
      logo: settingsObject.identity?.logo || general.logoUrl,
      logoDarkUrl: settingsObject.identity?.logoDarkUrl || general.logoDarkUrl,
      siteName: settingsObject.identity?.siteName || general.siteName,
    };

    const res = NextResponse.json({ success: true, data: { general, identity } });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("❌ /api/settings error:", error);
    return NextResponse.json({ success: false, error: "SETTINGS_ERROR" }, { status: 500 });
  }
}

// POST /api/settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sections = Object.keys(body);
    const results: Array<{ section: string; status: string }> = [];

    for (const section of sections) {
      const existing = await prisma.site_settings.findFirst({ where: { section } });
      if (existing) {
        await prisma.site_settings.update({
          where: { id: existing.id },
          data: { data: body[section], updated_at: new Date() },
        });
        results.push({ section, status: "updated" });
      } else {
        await prisma.site_settings.create({
          data: { id: `${section}-${Date.now()}`, section, data: body[section], created_at: new Date(), updated_at: new Date() },
        });
        results.push({ section, status: "created" });
      }
    }

    return NextResponse.json({ success: true, message: "تم حفظ الإعدادات بنجاح", results });
  } catch (error) {
    console.error("خطأ في حفظ الإعدادات:", error);
    return NextResponse.json({ success: false, error: "خطأ في حفظ الإعدادات" }, { status: 500 });
  }
}
