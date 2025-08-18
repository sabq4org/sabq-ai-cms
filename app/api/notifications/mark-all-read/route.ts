import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/auth-utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(_request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user || !user.id) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    // تحديث جماعي عبر Prisma
    await prisma.smartNotification.updateMany({
      where: { user_id: user.id, read_at: null },
      data: { read_at: new Date(), status: 'READ' as any },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('notifications/mark-all-read error:', error);
    return NextResponse.json({ success: false, message: 'خطأ غير متوقع' }, { status: 500 });
  }
}


