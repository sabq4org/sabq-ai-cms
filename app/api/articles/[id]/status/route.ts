import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const articleId = params.id;
    
    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      // البحث عن تفاعلات المستخدم مع هذا المقال
      const userInteractions = await prisma.UserInteractions.findMany({
        where: {
          user_id: user.id,
          article_id: articleId,
          interaction_type: { in: ['like', 'save'] }
        },
        select: {
          interaction_type: true
        }
      });

      // تحويل النتائج إلى boolean
      const hasLiked = userInteractions.some(i => i.interaction_type === 'like');
      const hasSaved = userInteractions.some(i => i.interaction_type === 'save');

      // الحصول على إحصائيات المقال
      const article = await prisma.articles.findUnique({
        where: { id: articleId },
        select: {
          likes: true,
          saves: true,
          views: true,
          shares: true
        }
      });

      await prisma.$disconnect();

      return NextResponse.json({
        hasLiked,
        hasSaved,
        stats: {
          likes: article?.likes || 0,
          saves: article?.saves || 0,
          views: article?.views || 0,
          shares: article?.shares || 0
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      await prisma.$disconnect();
      return NextResponse.json({ 
        hasLiked: false, 
        hasSaved: false,
        stats: { likes: 0, saves: 0, views: 0, shares: 0 }
      });
    }

  } catch (e: any) {
    console.error('Status API Error:', e);
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // إرجاع قيم افتراضية للمستخدمين غير المسجلين
    return NextResponse.json({ 
      hasLiked: false, 
      hasSaved: false,
      stats: { likes: 0, saves: 0, views: 0, shares: 0 }
    });
  }
}
