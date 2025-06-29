import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

interface UserPreference {
  id: string;
  user_id: string;
  category_id: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  source: 'manual' | 'implicit';
  created_at: string;
  updated_at: string;
}

const preferencesFilePath = path.join(process.cwd(), 'data', 'user_preferences.json');
const categoriesFilePath = path.join(process.cwd(), 'data', 'categories.json');

// تأكد من وجود ملف التفضيلات
async function ensurePreferencesFile() {
  try {
    await fs.access(preferencesFilePath);
  } catch {
    await fs.mkdir(path.dirname(preferencesFilePath), { recursive: true });
    await fs.writeFile(preferencesFilePath, JSON.stringify({ preferences: [] }));
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await context.params;

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

    // إضافة معلومات التصنيفات
    try {
      const categoriesContent = await fs.readFile(categoriesFilePath, 'utf-8');
      const categoriesData = JSON.parse(categoriesContent);
      const categories = categoriesData.categories || [];

      const enrichedPreferences = userPreferences.map((pref: UserPreference) => {
        const category = categories.find((cat: any) => cat.id === pref.category_id);
        if (category) {
          return {
            ...pref,
            category_name: category.name_ar,
            category_icon: category.icon,
            category_color: category.color_hex
          };
        }
        return pref;
      });

      return NextResponse.json({
        success: true,
        data: enrichedPreferences
      });
    } catch (error) {
      // إذا فشل تحميل التصنيفات، أرجع التفضيلات بدون معلومات إضافية
      return NextResponse.json({
        success: true,
        data: userPreferences
      });
    }

  } catch (error) {
    console.error('خطأ في جلب التفضيلات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب التفضيلات' },
      { status: 500 }
    );
  }
} 