import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export async function GET(request: NextRequest) {
  try {
    // قراءة ملف المستخدمين
    try {
      const fileContent = await fs.readFile(usersFilePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      return NextResponse.json({
        success: true,
        users: data.users || []
      });
    } catch (error) {
      // إذا لم يكن الملف موجوداً
      return NextResponse.json({
        success: true,
        users: []
      });
    }
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب المستخدمين' },
      { status: 500 }
    );
  }
}
