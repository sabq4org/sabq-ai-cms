import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface UserPreference {
  id: string;
  user_id: string;
  category_id: number;
  source: 'manual' | 'implicit';
  created_at: string;
  updated_at: string;
}

const preferencesFilePath = path.join(process.cwd(), 'data', 'user_preferences.json');
const interactionsFilePath = path.join(process.cwd(), 'data', 'user_article_interactions.json');

// تأكد من وجود ملف التفضيلات
async function ensurePreferencesFile() {
  try {
    await fs.access(preferencesFilePath);
  } catch {
    await fs.mkdir(path.dirname(preferencesFilePath), { recursive: true });
    await fs.writeFile(preferencesFilePath, JSON.stringify({ preferences: [] }));
  }
}

// تأكد من وجود ملف التفاعلات
async function ensureInteractionsFile() {
  try {
    await fs.access(interactionsFilePath);
  } catch {
    await fs.mkdir(path.dirname(interactionsFilePath), { recursive: true });
    await fs.writeFile(interactionsFilePath, JSON.stringify({ interactions: [] }));
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // قراءة ملف التفضيلات
    await ensurePreferencesFile();
    const fileContent = await fs.readFile(preferencesFilePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // التأكد من وجود مصفوفة preferences
    if (!data.preferences) {
      data.preferences = [];
    }

    // الحصول على تفضيلات المستخدم
    const userPreferences = data.preferences.filter(
      (pref: UserPreference) => pref.user_id === userId
    );

    return NextResponse.json({
      success: true,
      data: userPreferences
    });

  } catch (error) {
    console.error('خطأ في جلب التفضيلات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب التفضيلات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, categoryIds, source = 'manual' } = body;

    if (!userId || !categoryIds || !Array.isArray(categoryIds)) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة' },
        { status: 400 }
      );
    }

    // قراءة ملف التفضيلات
    await ensurePreferencesFile();
    const fileContent = await fs.readFile(preferencesFilePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // التأكد من وجود مصفوفة preferences
    if (!data.preferences) {
      data.preferences = [];
    }

    // حذف التفضيلات القديمة للمستخدم
    data.preferences = data.preferences.filter(
      (pref: UserPreference) => pref.user_id !== userId
    );

    // إضافة التفضيلات الجديدة - نقبل categoryIds كـ string array (UUIDs)
    const newPreferences = categoryIds.map((categoryId: string) => ({
      id: `pref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      category_id: categoryId, // نحفظه كـ string
      source,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    data.preferences.push(...newPreferences);

    // حفظ الملف
    await fs.writeFile(preferencesFilePath, JSON.stringify(data, null, 2));

    // تسجيل التفاعل
    await ensureInteractionsFile();
    const interactionsContent = await fs.readFile(interactionsFilePath, 'utf-8');
    const interactionsData = JSON.parse(interactionsContent);

    // التأكد من وجود مصفوفة interactions
    if (!interactionsData.interactions) {
      interactionsData.interactions = [];
    }

    interactionsData.interactions.push({
      id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      article_id: null,
      action: 'select_preferences',
      details: { categoryIds },
      created_at: new Date().toISOString()
    });

    await fs.writeFile(interactionsFilePath, JSON.stringify(interactionsData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'تم حفظ التفضيلات بنجاح',
      data: newPreferences
    });

  } catch (error) {
    console.error('خطأ في حفظ التفضيلات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حفظ التفضيلات' },
      { status: 500 }
    );
  }
} 