import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, avatarUrl } = body;

    console.log('🔄 طلب تحديث الصورة الشخصية:', { userId, avatarUrl });

    if (!userId || !avatarUrl) {
      console.error('❌ بيانات مفقودة:', { userId, avatarUrl });
      return NextResponse.json(
        { error: 'User ID and avatar URL are required' },
        { status: 400 }
      );
    }

    // قراءة ملف المستخدمين
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    const usersData = await fs.readFile(usersPath, 'utf-8');
    const usersObj = JSON.parse(usersData);
    
    // التأكد من وجود مصفوفة المستخدمين
    const users = usersObj.users || usersObj;
    
    console.log('📊 عدد المستخدمين:', users.length);
    console.log('🔍 البحث عن المستخدم:', userId);

    // البحث عن المستخدم وتحديث الصورة
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      console.error('❌ المستخدم غير موجود:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ تم العثور على المستخدم في الفهرس:', userIndex);

    // تحديث صورة المستخدم
    users[userIndex].avatar = avatarUrl;
    users[userIndex].updated_at = new Date().toISOString();

    console.log('💾 تحديث بيانات المستخدم:', {
      id: users[userIndex].id,
      name: users[userIndex].name,
      avatar: users[userIndex].avatar
    });

    // حفظ التحديثات مع الحفاظ على البنية الأصلية
    const updatedData = usersObj.users ? { users } : users;
    await fs.writeFile(usersPath, JSON.stringify(updatedData, null, 2));

    console.log('✅ تم حفظ التحديثات بنجاح');

    return NextResponse.json({
      success: true,
      user: users[userIndex]
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الصورة الشخصية:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
} 