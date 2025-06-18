import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await props.params;
    
    // قراءة ملف التفاعلات
    const interactionsPath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
    const interactionsData = await fs.readFile(interactionsPath, 'utf-8');
    const interactions = JSON.parse(interactionsData);
    
    // تصفية التفاعلات للمستخدم المحدد
    const userInteractions = interactions.filter((interaction: any) => 
      interaction.user_id === userId
    );
    
    // حساب الإحصائيات
    const stats = {
      articlesRead: userInteractions.filter((i: any) => 
        i.interaction_type === 'read' || i.interaction_type === 'view'
      ).length,
      interactions: userInteractions.filter((i: any) => 
        ['like', 'comment', 'save', 'bookmark'].includes(i.interaction_type)
      ).length,
      shares: userInteractions.filter((i: any) => 
        i.interaction_type === 'share'
      ).length
    };
    
    return NextResponse.json({
      success: true,
      stats: stats,
      totalInteractions: userInteractions.length
    });
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user interactions' },
      { status: 500 }
    );
  }
} 