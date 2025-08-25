import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          hasProfile: false,
          error: "معرف المستخدم مطلوب",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 البحث عن بروفايل المراسل للمستخدم: ${userId}`);

    // البحث عن البروفايل في جدول reporters بناءً على user_id
    const reporter = await prisma.reporters.findFirst({
      where: { user_id: userId },
      select: {
        id: true,
        full_name: true,
        slug: true,
        title: true,
        avatar_url: true,
        is_verified: true,
        verification_badge: true,
        is_active: true,
      },
    });

    if (!reporter) {
      console.log(`❌ لا يوجد بروفايل للمستخدم: ${userId}`);
      return NextResponse.json({
        success: true,
        hasProfile: false,
        reporter: null,
      });
    }

    console.log(
      `✅ تم العثور على بروفايل: ${reporter.full_name} (${reporter.slug})`
    );

    return NextResponse.json({
      success: true,
      hasProfile: true,
      reporter: {
        id: reporter.id,
        slug: reporter.slug,
        full_name: reporter.full_name,
        title: reporter.title,
        avatar_url: reporter.avatar_url,
        is_verified: reporter.is_verified,
        verification_badge: reporter.verification_badge || "verified",
        is_active: reporter.is_active,
        profileUrl: `/reporter/${reporter.slug}`,
      },
    });
  } catch (error: any) {
    console.error("خطأ في جلب بروفايل المراسل:", error);
    return NextResponse.json(
      {
        success: false,
        hasProfile: false,
        error: "حدث خطأ في جلب بيانات المراسل",
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}
