import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const loyaltyFilePath = path.join(process.cwd(), 'data', 'loyalty_points.json');

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await params;

    // قراءة ملف نقاط الولاء
    try {
      const fileContent = await fs.readFile(loyaltyFilePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      // فلترة نقاط المستخدم
      const userPoints = data.points.filter(
        (point: any) => point.user_id === userId
      );

      // حساب إجمالي النقاط
      const totalPoints = userPoints.reduce(
        (sum: number, point: any) => sum + point.points, 
        0
      );

      // تحديد المستوى
      let level = 'أساسي';
      let nextLevelPoints: number | null = 200;
      
      if (totalPoints >= 1000) {
        level = 'VIP';
        nextLevelPoints = null;
      } else if (totalPoints >= 500) {
        level = 'ذهبي';
        nextLevelPoints = 1000;
      } else if (totalPoints >= 200) {
        level = 'مميز';
        nextLevelPoints = 500;
      }

      // آخر 10 نشاطات
      const recentActivities = userPoints
        .sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10);

      return NextResponse.json({
        success: true,
        data: {
          total_points: totalPoints,
          level,
          next_level_points: nextLevelPoints,
          recent_activities: recentActivities
        }
      });

    } catch (error) {
      // إذا لم يكن الملف موجوداً، أرجع 0 نقاط
      return NextResponse.json({
        success: true,
        data: {
          total_points: 0,
          level: 'أساسي',
          next_level_points: 200,
          recent_activities: []
        }
      });
    }

  } catch (error) {
    console.error('خطأ في جلب نقاط الولاء:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب نقاط الولاء' },
      { status: 500 }
    );
  }
} 