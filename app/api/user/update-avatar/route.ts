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