import type { Redis } from "ioredis";

export async function deleteKeysByPattern(redis: Redis, pattern: string): Promise<number> {
  let cursor = "0";
  let totalDeleted = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      const delCount = await redis.del(...keys);
      totalDeleted += delCount;
    }
  } while (cursor !== "0");
  return totalDeleted;
}


