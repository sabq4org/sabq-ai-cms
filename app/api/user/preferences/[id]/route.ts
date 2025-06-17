import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const preferencesFilePath = path.join(process.cwd(), 'data', 'user_preferences.json');
const categoriesFilePath = path.join(process.cwd(), 'data', 'categories.json');

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await params;

    // قراءة ملف التفضيلات
    try {
      const prefsContent = await fs.readFile(preferencesFilePath, 'utf-8');
      const prefsData = JSON.parse(prefsContent);
      
      // فلترة تفضيلات المستخدم
      const userPreferences = prefsData.preferences.filter(
        (pref: any) => pref.user_id === userId
      );

      // قراءة ملف التصنيفات للحصول على معلومات التصنيفات
      const categoriesContent = await fs.readFile(categoriesFilePath, 'utf-8');
      const categoriesData = JSON.parse(categoriesContent);

      // دمج معلومات التصنيفات مع التفضيلات
      const preferencesWithDetails = userPreferences.map((pref: any) => {
        const category = categoriesData.categories.find(
          (cat: any) => cat.id === pref.category_id
        );
        
        return {
          ...pref,
          category_name: category?.name_ar || '',
          category_icon: category?.icon || '',
          category_color: category?.color_hex || '#000000'
        };
      });

      return NextResponse.json({
        success: true,
        data: preferencesWithDetails
      });

    } catch (error) {
      // إذا لم يكن الملف موجوداً، أرجع مصفوفة فارغة
      return NextResponse.json({
        success: true,
        data: []
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