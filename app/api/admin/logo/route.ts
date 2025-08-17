import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    // 1) حاول القراءة من قاعدة البيانات (site_settings.section = 'general')
    try {
      const existing = await prisma.site_settings.findFirst({
        where: { section: "general" },
      });
      const data: any = existing?.data || {};
      if (data.logoUrl && typeof data.logoUrl === "string") {
        return NextResponse.json({ success: true, logoUrl: data.logoUrl });
      }
    } catch (dbErr) {
      console.warn(
        "⚠️ تعذر القراءة من قاعدة البيانات لإعدادات اللوجو، سيتم استخدام الملف إن وُجد.",
        dbErr
      );
    }

    // 2) fallback: قراءة من ملف site-settings.json في public إن وُجد
    const settingsPath = path.join(
      process.cwd(),
      "public",
      "site-settings.json"
    );
    try {
      const settingsData = await fs.readFile(settingsPath, "utf8");
      const settings = JSON.parse(settingsData);
      if (settings.logoUrl) {
        return NextResponse.json({ success: true, logoUrl: settings.logoUrl });
      }
    } catch {
      // لا يوجد ملف أو لا يمكن قراءته
    }

    // 3) الافتراضي
    return NextResponse.json({ success: true, logoUrl: "/logo.png" });
  } catch (error) {
    console.error("خطأ في جلب رابط اللوجو:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب رابط اللوجو" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { logoUrl } = await request.json();

    if (!logoUrl || typeof logoUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "رابط اللوجو مطلوب",
        },
        { status: 400 }
      );
    }

    // حفظ في ملف JSON (fallback)
    const settingsPath = path.join(
      process.cwd(),
      "public",
      "site-settings.json"
    );
    let fileSettings: any = {};
    try {
      const settingsData = await fs.readFile(settingsPath, "utf8");
      fileSettings = JSON.parse(settingsData);
    } catch {
      // ملف غير موجود، سننشئه لاحقًا
    }

    fileSettings = {
      ...fileSettings,
      logoUrl,
      lastUpdated: new Date().toISOString(),
    };
    await fs.writeFile(settingsPath, JSON.stringify(fileSettings, null, 2));

    // حفظ في قاعدة البيانات (المصدر الرسمي الذي يقرأه الهيدر عبر /api/settings)
    try {
      const existing = await prisma.site_settings.findFirst({
        where: { section: "general" },
      });
      if (existing) {
        const merged = { ...(existing.data as any), logoUrl };
        await prisma.site_settings.update({
          where: { id: existing.id },
          data: { data: merged, updated_at: new Date() },
        });
      } else {
        await prisma.site_settings.create({
          data: {
            id: `general-${Date.now()}`,
            section: "general",
            data: { logoUrl },
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }
    } catch (dbErr) {
      console.warn(
        "⚠️ تعذر حفظ اللوجو في قاعدة البيانات، تم الحفظ في الملف فقط.",
        dbErr
      );
    }

    return NextResponse.json({
      success: true,
      logoUrl,
      message: "تم حفظ رابط اللوجو الجديد بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حفظ رابط اللوجو:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في حفظ رابط اللوجو",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // حذف إعدادات اللوجو والعودة للافتراضي
    const settingsPath = path.join(
      process.cwd(),
      "public",
      "site-settings.json"
    );

    let settings = {};
    try {
      const settingsData = await fs.readFile(settingsPath, "utf8");
      settings = JSON.parse(settingsData);
    } catch (error) {
      // إذا لم يوجد الملف، لا حاجة لحذف شيء
    }

    // إزالة رابط اللوجو المخصص
    delete settings.logoUrl;
    settings.lastUpdated = new Date().toISOString();

    // حفظ الإعدادات المحدثة
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

    // تحديث قاعدة البيانات لإزالة logoUrl من قسم general
    try {
      const existing = await prisma.site_settings.findFirst({
        where: { section: "general" },
      });
      if (existing) {
        const current: any = existing.data || {};
        if (current.logoUrl) delete current.logoUrl;
        await prisma.site_settings.update({
          where: { id: existing.id },
          data: { data: current, updated_at: new Date() },
        });
      }
    } catch (dbErr) {
      console.warn(
        "⚠️ تعذر تحديث قاعدة البيانات عند حذف اللوجو، تم تحديث الملف فقط.",
        dbErr
      );
    }

    return NextResponse.json({
      success: true,
      logoUrl: "/logo.png",
      message: "تم استعادة اللوجو الافتراضي",
    });
  } catch (error) {
    console.error("خطأ في حذف إعدادات اللوجو:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في استعادة اللوجو الافتراضي",
      },
      { status: 500 }
    );
  }
}
