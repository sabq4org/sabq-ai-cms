import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';
import { setAuthCookies } from '@/lib/auth-cookies';

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

    // كود ثابت مؤقت (للبيئة غير الإنتاجية أو عند تفعيل SKIP_EMAIL_VERIFICATION)
    if ((process.env.NODE_ENV !== 'production' || process.env.SKIP_EMAIL_VERIFICATION === 'true') && code === '000000') {
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
      // إصدار توكنات وتسجيل الدخول تلقائياً
      const access = jwt.sign({ sub: updated.id, role: updated.role || 'user' }, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'secret', { expiresIn: `${process.env.JWT_ACCESS_TTL_MIN || 15}m`, issuer: 'sabq-ai-cms' });
      const refresh = jwt.sign({ sub: updated.id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret', { expiresIn: `${process.env.JWT_REFRESH_TTL_DAYS || 7}d`, issuer: 'sabq-ai-cms' });
      const response = NextResponse.json({ success: true, message: 'تم تأكيد البريد الإلكتروني بنجاح', user: { id: updated.id, email: updated.email, name: updated.name } });
      setAuthCookies(response, access, refresh);
      try { await prisma.email_verification_codes.deleteMany({ where: { email } }); } catch {}
      try { await sendWelcomeEmail(email, updated.name || email.split('@')[0]); } catch {}
      return response;
    }

    // جلب رمز التحقق من قاعدة البيانات
    const verification = await prisma.email_verification_codes.findFirst({
      where: { email },
      orderBy: { created_at: 'desc' }
    });

    // دعم الكود الثابت من الإعدادات
    const allowStatic = process.env.SKIP_EMAIL_VERIFICATION === 'true' || process.env.USE_STATIC_VERIFICATION_CODE === 'true';
    const staticCode = process.env.STATIC_VERIFICATION_CODE || '000000';
    const candidateCode = code || '';

    if (!verification) {
      // إن لم نجد رمزاً، نسمح بالكود الثابت إن مُفعّل
      if (!(allowStatic && candidateCode === staticCode)) {
        return NextResponse.json(
          { success: false, error: 'رمز التحقق غير صحيح' },
          { status: 400 }
        );
      }
    }

    if (verification && verification.expires_at && verification.expires_at < new Date() && !(allowStatic && candidateCode === staticCode)) {
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
    // إصدار توكنات وتسجيل الدخول تلقائياً
    const access = jwt.sign({ sub: updated.id, role: updated.role || 'user' }, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'secret', { expiresIn: `${process.env.JWT_ACCESS_TTL_MIN || 15}m`, issuer: 'sabq-ai-cms' });
    const refresh = jwt.sign({ sub: updated.id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret', { expiresIn: `${process.env.JWT_REFRESH_TTL_DAYS || 7}d`, issuer: 'sabq-ai-cms' });
    const response = NextResponse.json({ success: true, message: 'تم تأكيد البريد الإلكتروني بنجاح', user: { id: updated.id, email: updated.email, name: updated.name } });
    setAuthCookies(response, access, refresh);
    return response;
  } catch (error) {
    console.error('خطأ في التحقق من البريد:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في عملية التحقق' },
      { status: 500 }
    );
  }
} 