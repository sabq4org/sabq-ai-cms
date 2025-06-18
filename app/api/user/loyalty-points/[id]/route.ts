import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const loyaltyFilePath = path.join(process.cwd(), 'data', 'user_loyalty_points.json');
const interactionsFilePath = path.join(process.cwd(), 'data', 'user_article_interactions.json');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // قراءة ملف نقاط الولاء
    try {
      const fileContent = await fs.readFile(loyaltyFilePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      // البحث عن بيانات المستخدم
      const userData = data.users?.find((user: any) => user.user_id === userId);

      if (userData) {
        // جلب آخر النشاطات من ملف التفاعلات
        let recentActivities: any[] = [];
        
        try {
          const interactionsContent = await fs.readFile(interactionsFilePath, 'utf-8');
          const interactionsData = JSON.parse(interactionsContent);
          
          const userInteractions = interactionsData.interactions
            ?.filter((interaction: any) => interaction.user_id === userId)
            .sort((a: any, b: any) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            .slice(0, 10)
            .map((interaction: any) => ({
              id: interaction.id,
              action: interaction.interaction_type,
              points: interaction.points_earned || 0,
              created_at: interaction.timestamp,
              description: getActionDescription(interaction)
            }));
          
          recentActivities = userInteractions || [];
        } catch (error) {
          console.log('لا توجد تفاعلات سابقة');
        }

        return NextResponse.json({
          success: true,
          data: {
            total_points: userData.total_points || 0,
            level: getLevelName(userData.tier || 'bronze'),
            next_level_points: getNextLevelPoints(userData.total_points || 0),
            recent_activities: recentActivities
          }
        });
      }

      // إذا لم يكن المستخدم موجوداً، أرجع قيم افتراضية
      return NextResponse.json({
        success: true,
        data: {
          total_points: 0,
          level: 'أساسي',
          next_level_points: 200,
          recent_activities: []
        }
      });

    } catch (error) {
      // إذا لم يكن الملف موجوداً، أرجع قيم افتراضية
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

function getLevelName(tier: string): string {
  const levels: { [key: string]: string } = {
    'bronze': 'أساسي',
    'silver': 'مميز',
    'gold': 'ذهبي',
    'vip': 'VIP'
  };
  return levels[tier.toLowerCase()] || 'أساسي';
}

function getNextLevelPoints(currentPoints: number): number | null {
  if (currentPoints < 200) return 200;
  if (currentPoints < 500) return 500;
  if (currentPoints < 1000) return 1000;
  return null; // VIP level
}

function getActionDescription(interaction: any): string {
  const descriptions: { [key: string]: string } = {
    'view': 'مشاهدة مقال',
    'read': 'قراءة مقال',
    'like': 'إعجاب بمقال',
    'share': 'مشاركة مقال',
    'comment': 'تعليق على مقال',
    'save': 'حفظ مقال',
    'select_preferences': 'اختيار التفضيلات'
  };
  return descriptions[interaction.interaction_type] || interaction.interaction_type;
} 