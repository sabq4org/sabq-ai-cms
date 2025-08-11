import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/analytics/alerts - جلب التنبيهات وقواعد التنبيه
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const limit = parseInt(searchParams.get('limit') || '50');
    const filter = searchParams.get('filter'); // 'unread', 'critical', 'all'

    // شروط التصفية
    const whereConditions: any = {};
    
    if (keyword) {
      whereConditions.keyword = {
        contains: keyword,
        mode: 'insensitive'
      };
    }

    if (filter === 'unread') {
      whereConditions.isRead = false;
    } else if (filter === 'critical') {
      whereConditions.severity = 'critical';
    }

    // جلب التنبيهات (محاكاة - يمكن استبدالها بجدول حقيقي)
    const mockAlerts = [
      {
        id: '1',
        keyword: 'الذكاء الاصطناعي',
        type: 'spike',
        severity: 'high',
        title: 'ارتفاع كبير في استخدام "الذكاء الاصطناعي"',
        description: 'زيادة 45% في الاستخدام خلال آخر 24 ساعة',
        value: 1450,
        threshold: 1000,
        change: 45.2,
        timestamp: new Date().toISOString(),
        isRead: false,
        actionRequired: true
      },
      {
        id: '2',
        keyword: 'التقنية',
        type: 'threshold',
        severity: 'medium',
        title: 'تجاوز عتبة المشاهدات للتقنية',
        description: 'تم تجاوز 5000 مشاهدة لكلمة "التقنية"',
        value: 5250,
        threshold: 5000,
        change: 12.5,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: false,
        actionRequired: false
      },
      {
        id: '3',
        keyword: 'الاقتصاد',
        type: 'drop',
        severity: 'low',
        title: 'انخفاض في استخدام "الاقتصاد"',
        description: 'انخفاض 15% في الاستخدام مقارنة بالأسبوع الماضي',
        value: 850,
        threshold: 1000,
        change: -15.3,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isRead: true,
        actionRequired: false
      }
    ];

    // تطبيق التصفية على التنبيهات المحاكاة
    let filteredAlerts = mockAlerts;
    
    if (keyword) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.keyword.includes(keyword)
      );
    }
    
    if (filter === 'unread') {
      filteredAlerts = filteredAlerts.filter(alert => !alert.isRead);
    } else if (filter === 'critical') {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === 'critical');
    }

    // جلب قواعد التنبيه (محاكاة)
    const mockRules = [
      {
        id: '1',
        keyword: 'الذكاء الاصطناعي',
        type: 'usage_spike',
        threshold: 1000,
        isActive: true,
        notificationMethod: 'browser',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        keyword: 'التقنية',
        type: 'view_threshold',
        threshold: 5000,
        isActive: true,
        notificationMethod: 'both',
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      alerts: filteredAlerts.slice(0, limit),
      rules: mockRules,
      total: filteredAlerts.length,
      unreadCount: filteredAlerts.filter(a => !a.isRead).length,
      criticalCount: filteredAlerts.filter(a => a.severity === 'critical').length
    });

  } catch (error) {
    console.error('خطأ في جلب التنبيهات:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب التنبيهات' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/alerts - إنشاء تنبيه جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, type, severity, title, description, value, threshold, change } = body;

    // التحقق من صحة البيانات
    if (!keyword || !type || !severity || !title) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة' },
        { status: 400 }
      );
    }

    // إنشاء تنبيه جديد (محاكاة)
    const newAlert = {
      id: Date.now().toString(),
      keyword,
      type,
      severity,
      title,
      description: description || '',
      value: value || 0,
      threshold: threshold || 0,
      change: change || 0,
      timestamp: new Date().toISOString(),
      isRead: false,
      actionRequired: severity === 'critical' || severity === 'high'
    };

    // في التطبيق الحقيقي، سيتم حفظ التنبيه في قاعدة البيانات
    // await prisma.alert.create({ data: newAlert });

    return NextResponse.json(newAlert, { status: 201 });

  } catch (error) {
    console.error('خطأ في إنشاء التنبيه:', error);
    return NextResponse.json(
      { error: 'خطأ في إنشاء التنبيه' },
      { status: 500 }
    );
  }
}
