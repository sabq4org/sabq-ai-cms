import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { userId, avatarUrl } = await req.json();

    if (!userId || !avatarUrl) {
      return NextResponse.json(
        { success: false, error: "userId و avatarUrl مطلوبان" },
        { status: 400 }
      );
    }

    // تحديث حقل الصورة للمستخدم
    const updated = await prisma.users.update({
      where: { id: String(userId) },
      data: {
        avatar: String(avatarUrl),
        updated_at: new Date(),
      },
      select: { id: true, avatar: true },
    });

    return NextResponse.json(
      { success: true, user: updated },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ خطأ في تحديث صورة المستخدم:", error);
    return NextResponse.json(
      { success: false, error: "فشل تحديث الصورة" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, avatarUrl } = await request.json();

    if (!userId || !avatarUrl) {
      return NextResponse.json({
        success: false,
        error: 'معرف المستخدم ورابط الصورة مطلوبان'
      }, { status: 400 });
    }

    console.log('🔄 تحديث الصورة الشخصية:', { userId, avatarUrl });

    // تحديث الصورة الشخصية في قاعدة البيانات
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { 
        avatar: avatarUrl,
        updated_at: new Date()
      }
    });

    console.log('✅ تم تحديث الصورة الشخصية بنجاح:', {
      userId: updatedUser.id,
      avatarUrl: updatedUser.avatar
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الصورة الشخصية بنجاح',
      user: {
        id: updatedUser.id,
        avatar: updatedUser.avatar
      }
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الصورة الشخصية:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في تحديث الصورة الشخصية'
    }, { status: 500 });
  }
}