import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/analytics/alert-rules - جلب قواعد التنبيه
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const isActive = searchParams.get('isActive');

    // شروط التصفية
    const whereConditions: any = {};
    
    if (keyword) {
      whereConditions.keyword = {
        contains: keyword,
        mode: 'insensitive'
      };
    }

    if (isActive !== null) {
      whereConditions.isActive = isActive === 'true';
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
      },
      {
        id: '3',
        keyword: 'الاقتصاد',
        type: 'usage_drop',
        threshold: 20,
        isActive: false,
        notificationMethod: 'email',
        createdAt: new Date().toISOString()
      }
    ];

    // تطبيق التصفية
    let filteredRules = mockRules;
    
    if (keyword) {
      filteredRules = filteredRules.filter(rule => 
        rule.keyword.includes(keyword)
      );
    }
    
    if (isActive !== null) {
      filteredRules = filteredRules.filter(rule => 
        rule.isActive === (isActive === 'true')
      );
    }

    return NextResponse.json({
      rules: filteredRules,
      total: filteredRules.length,
      activeCount: filteredRules.filter(r => r.isActive).length
    });

  } catch (error) {
    console.error('خطأ في جلب قواعد التنبيه:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب قواعد التنبيه' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/alert-rules - إنشاء قاعدة تنبيه جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, type, threshold, isActive = true, notificationMethod = 'browser' } = body;

    // التحقق من صحة البيانات
    if (!keyword || !type || threshold === undefined) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة' },
        { status: 400 }
      );
    }

    // التحقق من صحة نوع التنبيه
    const validTypes = ['usage_spike', 'usage_drop', 'view_threshold', 'popularity_change'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'نوع التنبيه غير صحيح' },
        { status: 400 }
      );
    }

    // التحقق من صحة طريقة التنبيه
    const validMethods = ['browser', 'email', 'both'];
    if (!validMethods.includes(notificationMethod)) {
      return NextResponse.json(
        { error: 'طريقة التنبيه غير صحيحة' },
        { status: 400 }
      );
    }

    // إنشاء قاعدة تنبيه جديدة (محاكاة)
    const newRule = {
      id: Date.now().toString(),
      keyword: keyword.trim(),
      type,
      threshold: Number(threshold),
      isActive,
      notificationMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // في التطبيق الحقيقي، سيتم حفظ القاعدة في قاعدة البيانات
    // await prisma.alertRule.create({ data: newRule });

    return NextResponse.json(newRule, { status: 201 });

  } catch (error) {
    console.error('خطأ في إنشاء قاعدة التنبيه:', error);
    return NextResponse.json(
      { error: 'خطأ في إنشاء قاعدة التنبيه' },
      { status: 500 }
    );
  }
}
