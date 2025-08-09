import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { cornerId: string } }
) {
  try {
    const { cornerId } = params;
    const articles = await prisma.muqtarabArticle.findMany({
      where: { corner_id: cornerId },
      orderBy: { publish_at: 'desc' },
    });

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch articles', details: error.message }, { status: 500 });
  }
}
