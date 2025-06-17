import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface LoyaltyPoint {
  id: string;
  user_id: string;
  points: number;
  action: string;
  description: string;
  created_at: string;
}

const loyaltyFilePath = path.join(process.cwd(), 'data', 'loyalty_points.json');

// تأكد من وجود ملف نقاط الولاء
async function ensureLoyaltyFile() {
  try {
    await fs.access(loyaltyFilePath);
  } catch {
    await fs.mkdir(path.dirname(loyaltyFilePath), { recursive: true });
    await fs.writeFile(loyaltyFilePath, JSON.stringify({ points: [] }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, points, action, description } = body;

    if (!userId || !points || !action) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    // قراءة ملف نقاط الولاء
    await ensureLoyaltyFile();
    const fileContent = await fs.readFile(loyaltyFilePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // إضافة نقاط جديدة
    const newPoints: LoyaltyPoint = {
      id: `points-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      points,
      action,
      description: description || '',
      created_at: new Date().toISOString()
    };

    data.points.push(newPoints);

    // حفظ الملف
    await fs.writeFile(loyaltyFilePath, JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      message: 'تمت إضافة النقاط بنجاح',
      data: newPoints
    });

  } catch (error) {
    console.error('خطأ في إضافة النقاط:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إضافة النقاط' },
      { status: 500 }
    );
  }
} 