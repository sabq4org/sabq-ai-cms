import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// قراءة بيانات المستخدمين من ملف JSON
async function getUsersData() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContents = await readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    // إرجاع المصفوفة من داخل الكائن
    return data.users || [];
  } catch (error) {
    // إرجاع بيانات تجريبية في حالة عدم وجود الملف
          return [
        {
          id: '1',
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone: '+966501234567',
          avatar: '',
          isVerified: true,
          status: 'active',
          role: 'admin',
          loyaltyPoints: 1500,
          lastLogin: new Date().toISOString(),
          created_at: new Date('2024-01-15').toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'فاطمة العلي',
          email: 'fatima@example.com',
          phone: '+966502345678',
          isVerified: true,
          status: 'active',
          role: 'editor',
          loyaltyPoints: 800,
          lastLogin: new Date().toISOString(),
          created_at: new Date('2024-02-20').toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'محمد الأحمد',
          email: 'mohammed@example.com',
          isVerified: false,
          status: 'suspended',
          role: 'regular',
          loyaltyPoints: 200,
          created_at: new Date('2024-03-10').toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'نورا السعيد',
          email: 'noura@example.com',
          phone: '+966503456789',
          isVerified: true,
          status: 'active',
          role: 'vip',
          loyaltyPoints: 3000,
          lastLogin: new Date().toISOString(),
          created_at: new Date('2023-12-01').toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          name: 'عبدالله القحطاني',
          email: 'abdullah@example.com',
          isVerified: true,
          status: 'active',
          role: 'media',
          loyaltyPoints: 1200,
          created_at: new Date('2024-04-05').toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
  }
}

// GET: جلب جميع المستخدمين
export async function GET() {
  try {
    const users = await getUsersData();
    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}

// POST: إضافة مستخدم جديد
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const users = await getUsersData();
    
    const newUser = {
      id: Date.now().toString(),
      ...body,
      loyaltyLevel: 'bronze',
      loyaltyPoints: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // حفظ البيانات بنفس التنسيق الأصلي
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    await writeFile(filePath, JSON.stringify({ users }, null, 2));
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
