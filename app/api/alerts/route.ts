import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AlertData {
  level: 'info' | 'warning' | 'critical';
  message: string;
  details: any;
  timestamp: string;
}

// قائمة المشتركين للتنبيهات (يمكن توسيعها لاحقاً)
const alertSubscribers = [
  // {
  //   webhook_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
  //   type: 'slack'
  // },
  // {
  //   email: 'admin@example.com',
  //   type: 'email'
  // }
];

async function sendAlert(alert: AlertData) {
  console.log(`🚨 ${alert.level.toUpperCase()}: ${alert.message}`);
  console.log('📋 التفاصيل:', JSON.stringify(alert.details, null, 2));
  
  // هنا يمكن إضافة إرسال فعلي للتنبيهات (Slack, Email, etc.)
  // for (const subscriber of alertSubscribers) {
  //   if (subscriber.type === 'slack') {
  //     await sendSlackAlert(subscriber.webhook_url, alert);
  //   } else if (subscriber.type === 'email') {
  //     await sendEmailAlert(subscriber.email, alert);
  //   }
  // }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level, message, details } = body;
    
    if (!level || !message) {
      return NextResponse.json(
        { error: 'مطلوب level و message' },
        { status: 400 }
      );
    }
    
    const alert: AlertData = {
      level,
      message,
      details: details || {},
      timestamp: new Date().toISOString()
    };
    
    await sendAlert(alert);
    
    return NextResponse.json({
      status: 'sent',
      alert_id: `alert_${Date.now()}`,
      timestamp: alert.timestamp
    });
    
  } catch (error) {
    console.error('❌ خطأ في إرسال التنبيه:', error);
    
    return NextResponse.json(
      { error: 'فشل في إرسال التنبيه' },
      { status: 500 }
    );
  }
}

// الحصول على تاريخ التنبيهات
export async function GET() {
  // هنا يمكن إضافة قاعدة بيانات لحفظ التنبيهات
  return NextResponse.json({
    message: 'سجل التنبيهات (قيد التطوير)',
    recent_alerts: []
  });
}
