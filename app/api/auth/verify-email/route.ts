import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').toLowerCase().trim();
    const code = String(body?.code || '').trim();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني ورمز التحقق مطلوبان' },
        { status: 400 }
      );
    }

    // وضع تطوير: كود عام 000000
    if (process.env.NODE_ENV !== 'production' && code === '000000') {
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'المستخدم غير موجود' },
          { status: 404 }
        );
      }
      const updated = await prisma.users.update({
        where: { email },
        data: { is_verified: true, email_verified_at: new Date(), updated_at: new Date() }
      });
      try { await prisma.email_verification_codes.deleteMany({ where: { email } }); } catch {}
      try { await sendWelcomeEmail(email, updated.name || email.split('@')[0]); } catch {}
      const { password_hash, ...userWithoutPassword } = updated as any;
      return NextResponse.json({ success: true, message: 'تم تأكيد البريد الإلكتروني بنجاح', user: userWithoutPassword });
    }

    // جلب رمز التحقق من قاعدة البيانات
    const verification = await prisma.email_verification_codes.findFirst({
      where: { email, code }
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'رمز التحقق غير صحيح' },
        { status: 400 }
      );
    }

    if (verification.expires_at && verification.expires_at < new Date()) {
      return NextResponse.json(
        { success: false, error: 'انتهت صلاحية رمز التحقق' },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    const updated = await prisma.users.update({
      where: { email },
      data: { is_verified: true, email_verified_at: new Date(), updated_at: new Date() }
    });

    await prisma.email_verification_codes.deleteMany({ where: { email } });

    try { await sendWelcomeEmail(email, updated.name || email.split('@')[0]); } catch (e) { console.warn('sendWelcomeEmail failed:', e); }

    const { password_hash, ...userWithoutPassword } = updated as any;
    return NextResponse.json({ success: true, message: 'تم تأكيد البريد الإلكتروني بنجاح', user: userWithoutPassword });
  } catch (error) {
    console.error('خطأ في التحقق من البريد:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في عملية التحقق' },
      { status: 500 }
    );
  }
} 