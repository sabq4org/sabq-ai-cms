import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.$queryRaw`
      SELECT id, name, slug, description, is_active
      FROM categories
      WHERE is_active = true
      ORDER BY display_order ASC, name ASC;
    `;

    return NextResponse.json({
      success: true,
      categories: categories
    });

  } catch (error) {
    console.error('خطأ في جلب التصنيفات:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب التصنيفات' },
      { status: 500 }
    );
  }
}