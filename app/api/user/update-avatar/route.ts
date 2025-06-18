import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, avatarUrl } = body;

    if (!userId || !avatarUrl) {
      return NextResponse.json(
        { error: 'User ID and avatar URL are required' },
        { status: 400 }
      );
    }

    // قراءة ملف المستخدمين
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    const usersData = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(usersData);

    // البحث عن المستخدم وتحديث الصورة
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // تحديث صورة المستخدم
    users[userIndex].avatar = avatarUrl;
    users[userIndex].updated_at = new Date().toISOString();

    // حفظ التحديثات
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

    return NextResponse.json({
      success: true,
      user: users[userIndex]
    });

  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
} 