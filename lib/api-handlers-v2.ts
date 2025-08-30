// Generic API handler wrapper: caching + timing + errors
import { NextRequest } from 'next/server';
import { cacheGetOrSet, makeETag } from './redis-cache-v2';
import { ServerTimer } from './server-timing';

type Handler<T> = (req: NextRequest, timer: ServerTimer) => Promise<T>;

export function withCaching<T>({
  key,
  ttlSec,
  handler
}: {
  key: (req: NextRequest) => string;
  ttlSec: number;
  handler: Handler<T>;
}) {
  return async (req: NextRequest) => {
    const timer = new ServerTimer();
    timer.start('cache');
    const cacheKey = key(req);
    const { data, hit } = await cacheGetOrSet(cacheKey, ttlSec, async () => {
      timer.end('cache');
      timer.start('db');
      const payload = await handler(req, timer);
      timer.end('db');
      return payload;
    });
    timer.end('cache');

    const headers = new Headers();
    headers.set('Server-Timing', timer.header());
    headers.set('X-Cache', hit ? 'HIT' : 'MISS');
    headers.set('ETag', makeETag(data));
    headers.set('Cache-Control', `public, s-maxage=${ttlSec}, stale-while-revalidate=${ttlSec * 2}`);

    return Response.json(data as any, { status: 200, headers });
  };
}
