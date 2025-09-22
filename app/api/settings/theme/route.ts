import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: إرجاع السمة النشطة وقائمة السمات
export async function GET() {
  try {
    const rows = await prisma.site_settings.findMany({ where: { section: { in: ["theme_active", "themes"] } } });
    const out: Record<string, any> = {};
    for (const r of rows) out[r.section] = r.data;
    const active = out.theme_active || null;
    const themes = out.themes || [];
    return NextResponse.json({ success: true, active, themes });
  } catch (e) {
    return NextResponse.json({ success: false, error: "THEME_SETTINGS_ERROR" }, { status: 500 });
  }
}

// POST: حفظ/تحديث سمة أو تعيين سمة نشطة
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, theme, setActive } = body || {};
    let results: any = {};

    if (action === 'upsertTheme' && theme?.theme_name) {
      // اجلب القائمة الحالية
      const existing = await prisma.site_settings.findFirst({ where: { section: 'themes' } });
      let list: any[] = Array.isArray(existing?.data) ? existing!.data as any[] : [];
      const idx = list.findIndex((t: any) => t.theme_name === theme.theme_name);
      if (idx >= 0) list[idx] = theme; else list.push(theme);
      if (existing) {
        await prisma.site_settings.update({ where: { id: existing.id }, data: { data: list, updated_at: new Date() } });
      } else {
        await prisma.site_settings.create({ data: { id: `themes-${Date.now()}`, section: 'themes', data: list, created_at: new Date(), updated_at: new Date() } });
      }
      results.upsertTheme = 'ok';
    }

    if (setActive) {
      await prisma.site_settings.upsert({
        where: { id: 'theme_active' },
        update: { data: setActive, updated_at: new Date(), section: 'theme_active' },
        create: { id: 'theme_active', section: 'theme_active', data: setActive, created_at: new Date(), updated_at: new Date() }
      });
      results.setActive = 'ok';
    }

    return NextResponse.json({ success: true, results });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'THEME_SAVE_ERROR' }, { status: 500 });
  }
}


