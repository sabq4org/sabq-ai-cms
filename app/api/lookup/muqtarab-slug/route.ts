import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get('id');

  if (!articleId) {
    return NextResponse.json({ success: false, error: 'Article ID is required' }, { status: 400 });
  }

  try {
    const article = await prisma.muqtarabArticle.findUnique({
      where: { id: articleId },
      select: { slug: true },
    });

    if (article && article.slug) {
      return NextResponse.json({ success: true, slug: article.slug });
    } else {
      return NextResponse.json({ success: false, error: 'Article not found or slug is missing' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Database query failed', details: error.message }, { status: 500 });
  }
}
