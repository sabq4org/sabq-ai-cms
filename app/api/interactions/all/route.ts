import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const interactionsPath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
    
    let interactions = [];
    try {
      const data = await fs.readFile(interactionsPath, 'utf8');
      interactions = JSON.parse(data);
    } catch (error) {
      // إذا لم يكن الملف موجوداً، نرجع مصفوفة فارغة
    }

    // ترتيب التفاعلات حسب الوقت (الأحدث أولاً)
    interactions.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      count: interactions.length,
      interactions
    });

  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
} 