/**
 * 🔔 API: بث الإشعارات المباشر عبر SSE
 * 
 * GET /api/smart-notifications/stream
 * 
 * Server-Sent Events (SSE) للإشعارات الفورية
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { notificationBus } from '@/lib/services/smartNotificationService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await requireAuth();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // إعداد SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // إرسال رسالة اتصال
        const connectMessage = `data: ${JSON.stringify({ type: 'connected', userId: user.id })}\n\n`;
        controller.enqueue(encoder.encode(connectMessage));

        // الاشتراك في الإشعارات
        const unsubscribe = notificationBus.subscribe(user.id, (payload) => {
          const message = `event: notify\ndata: ${JSON.stringify(payload)}\n\n`;
          try {
            controller.enqueue(encoder.encode(message));
          } catch (error) {
            console.error('Error sending notification:', error);
          }
        });

        // إرسال heartbeat كل 30 ثانية
        const heartbeatInterval = setInterval(() => {
          try {
            const heartbeat = `: heartbeat\n\n`;
            controller.enqueue(encoder.encode(heartbeat));
          } catch (error) {
            clearInterval(heartbeatInterval);
          }
        }, 30000);

        // التنظيف عند إغلاق الاتصال
        request.signal.addEventListener('abort', () => {
          unsubscribe();
          clearInterval(heartbeatInterval);
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // لـ Nginx
      }
    });

  } catch (error) {
    console.error('Error in SSE stream:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

