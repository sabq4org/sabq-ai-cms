import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// MVP: تحليل بسيط يعتمد على كلمات مفتاحية وربط بالقصة الأقرب
export async function POST(request: NextRequest) {
  try {
    const { title, content, category, source } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ success: false, error: "title, content مطلوبان" }, { status: 400 });
    }

    // استخراج كلمات مفتاحية بسيطة (MVP)
    const tokens = (title + " " + content)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w: string) => w.length > 2)
      .slice(0, 50);

    // بحث تقريبي عن أقرب قصة عبر مطابقة جزئية في العنوان
    const candidates = await prisma.story.findMany({
      where: category ? { category } : {},
      orderBy: { updated_at: "desc" },
      take: 50,
    });

    let best: { story: any; score: number } | null = null;
    for (const s of candidates) {
      const hay = (s.title + " " + (s.description || "")).toLowerCase();
      let score = 0;
      for (const t of tokens) if (hay.includes(t)) score++;
      if (!best || score > best.score) best = { story: s, score };
    }

    if (best && best.score >= 3) {
      // أربط كحدث
      const event = await prisma.event.create({
        data: {
          story_id: best.story.id,
          title: title.substring(0, 500),
          content,
          source,
          event_date: new Date(),
          importanceScore: 5.0,
        },
      });
      return NextResponse.json({ success: true, action: "linked", storyId: best.story.id, event });
    }

    // إنشاء قصة جديدة + حدث أول
    const story = await prisma.story.create({
      data: {
        title,
        description: content.substring(0, 500),
        category,
        tags: [],
      },
    });
    const event = await prisma.event.create({
      data: {
        story_id: story.id,
        title: title.substring(0, 500),
        content,
        source,
        event_date: new Date(),
        importanceScore: 5.0,
      },
    });

    return NextResponse.json({ success: true, action: "created", story, event });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل تحليل الخبر" },
      { status: 500 }
    );
  }
}


