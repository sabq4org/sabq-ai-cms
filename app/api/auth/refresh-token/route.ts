// API endpoint إضافي لتجديد التوكن - متوافق مع الواجهة القديمة
// هذا endpoint يدعم نفس وظيفة /refresh ولكن باسم مختلف للتوافق
import { NextRequest, NextResponse } from 'next/server';

// إعادة تصدير من /refresh للتوافق
export { POST, OPTIONS } from '../refresh/route';

export async function GET() {
  return NextResponse.json(
    {
      message: 'هذا endpoint للتجديد فقط. استخدم POST',
      supported_methods: ['POST'],
      redirect_to: '/api/auth/refresh'
    },
    { status: 405 }
  );
}
