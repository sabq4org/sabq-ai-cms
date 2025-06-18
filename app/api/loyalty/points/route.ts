import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    
    if (!userId || userId === 'anonymous') {
      return NextResponse.json({
        success: false,
        message: 'يرجى تسجيل الدخول لعرض نقاط الولاء'
      }, { status: 401 });
    }
    
    // قراءة ملف نقاط الولاء
    const filePath = path.join(process.cwd(), 'data', 'user_loyalty_points.json');
    let loyaltyData: { users: any[] } = { users: [] };
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      loyaltyData = JSON.parse(fileContent);
    } catch (error) {
      // الملف غير موجود
      console.error('Error reading loyalty points:', error);
    }
    
    // البحث عن نقاط المستخدم
    const userRecord = loyaltyData.users.find((u: any) => u.user_id === userId);
    
    if (!userRecord) {
      // إنشاء سجل جديد للمستخدم
      const newRecord = {
        user_id: userId,
        total_points: 100, // نقاط ترحيبية
        earned_points: 100,
        redeemed_points: 0,
        tier: 'bronze',
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      
      loyaltyData.users.push(newRecord);
      await fs.writeFile(filePath, JSON.stringify(loyaltyData, null, 2));
      
      return NextResponse.json({
        success: true,
        data: newRecord
      });
    }
    
    return NextResponse.json({
      success: true,
      data: userRecord
    });
    
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ في جلب نقاط الولاء'
    }, { status: 500 });
  }
}

// API لجلب تفاصيل نقاط المستخدم مع التاريخ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;
    
    if (!user_id || user_id === 'anonymous') {
      return NextResponse.json({
        success: false,
        message: 'يرجى تسجيل الدخول'
      }, { status: 401 });
    }
    
    // قراءة ملف التفاعلات للحصول على تاريخ النقاط
    const interactionsPath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
    let interactions: any[] = [];
    
    try {
      const fileContent = await fs.readFile(interactionsPath, 'utf-8');
      const data = JSON.parse(fileContent);
      interactions = data.interactions || [];
    } catch (error) {
      console.error('Error reading interactions:', error);
    }
    
    // فلترة تفاعلات المستخدم
    const userInteractions = interactions
      .filter((i: any) => i.user_id === user_id && i.points_earned)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // آخر 50 تفاعل
    
    // حساب إحصائيات النقاط
    const stats = {
      total_interactions: userInteractions.length,
      points_from_reading: userInteractions.filter((i: any) => i.interaction_type === 'read').reduce((sum: number, i: any) => sum + (i.points_earned || 0), 0),
      points_from_likes: userInteractions.filter((i: any) => i.interaction_type === 'like').reduce((sum: number, i: any) => sum + (i.points_earned || 0), 0),
      points_from_shares: userInteractions.filter((i: any) => i.interaction_type === 'share').reduce((sum: number, i: any) => sum + (i.points_earned || 0), 0),
      points_from_saves: userInteractions.filter((i: any) => i.interaction_type === 'save').reduce((sum: number, i: any) => sum + (i.points_earned || 0), 0),
      recent_activities: userInteractions.slice(0, 10).map((i: any) => ({
        type: i.interaction_type,
        points: i.points_earned,
        article_id: i.article_id,
        timestamp: i.timestamp
      }))
    };
    
    // جلب نقاط المستخدم الحالية
    const loyaltyPath = path.join(process.cwd(), 'data', 'user_loyalty_points.json');
    let loyaltyData: { users: any[] } = { users: [] };
    
    try {
      const fileContent = await fs.readFile(loyaltyPath, 'utf-8');
      loyaltyData = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading loyalty points:', error);
    }
    
    const userRecord = loyaltyData.users.find((u: any) => u.user_id === user_id);
    
    return NextResponse.json({
      success: true,
      data: {
        current_points: userRecord?.total_points || 0,
        tier: userRecord?.tier || 'bronze',
        stats,
        next_tier_points: userRecord?.tier === 'bronze' ? 1000 : 
                         userRecord?.tier === 'silver' ? 5000 : 
                         userRecord?.tier === 'gold' ? 10000 : null
      }
    });
    
  } catch (error) {
    console.error('Error fetching loyalty details:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ في جلب تفاصيل النقاط'
    }, { status: 500 });
  }
} 