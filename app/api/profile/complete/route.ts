import { NextRequest, NextResponse } from 'next/server';

// محاكاة قاعدة البيانات
const userProfiles: any[] = [];
const loyaltyPoints: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json();

    const newProfile = {
      id: Date.now().toString(),
      userId: 'current-user-id',
      ...profileData,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    userProfiles.push(newProfile);

    // منح نقاط الولاء (25 نقطة أساسية)
    let totalPoints = 25;
    if (profileData.avatar) totalPoints += 5;
    if (profileData.bio) totalPoints += 5;
    if (profileData.interests?.length >= 3) totalPoints += 10;

    loyaltyPoints.push({
      id: Date.now().toString(),
      userId: 'current-user-id',
      points: totalPoints,
      actionType: 'profile_completion',
      description: 'إكمال الملف الشخصي',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'تم حفظ ملفك الشخصي بنجاح!',
      data: {
        profileId: newProfile.id,
        loyaltyPointsEarned: totalPoints
      }
    });

  } catch (error) {
    console.error('خطأ في حفظ الملف الشخصي:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في الخادم'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalProfiles: userProfiles.length,
      totalLoyaltyPoints: loyaltyPoints.reduce((sum, p) => sum + p.points, 0)
    }
  });
} 