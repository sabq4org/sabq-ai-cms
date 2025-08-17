import { NextRequest, NextResponse } from 'next/server';
import { getNextNews } from '@/lib/spaClient';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const lastId = Number(search.get('lastId') ?? 0);
  const basket = Number(search.get('basket') ?? 1);

  try {
    const news = await getNextNews(lastId, basket);
    return NextResponse.json({ ok: true, news });
  } catch (error: any) {
    console.error('SPA fetch failed', error?.response?.data ?? error);
    return NextResponse.json(
      { ok: false, message: 'SPA fetch failed' },
      { status: 502 }
    );
  }
}
