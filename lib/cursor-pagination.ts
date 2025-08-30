// Generic cursor-based pagination helper
type CursorPage<T> = { data: T[]; nextCursor: string | null; hasMore: boolean };

export function cursorPaginate<T extends { id: string }>(
  items: T[],
  limit: number
): CursorPage<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  return { data, nextCursor, hasMore };
}
