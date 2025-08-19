// Simple in-memory batched view increment system
import { getPrismaClient } from '@/lib/prisma'

const prisma = getPrismaClient();

interface PendingIncrement { id: string; count: number }

const FLUSH_INTERVAL_MS = 30000
const MAX_BUFFER = 50

// global cache in dev to persist between HMR reloads
const g = globalThis as any
if (!g.__viewBatchStore) {
  g.__viewBatchStore = { map: new Map<string, PendingIncrement>(), timer: null as NodeJS.Timeout | null }
}
const store = g.__viewBatchStore as { map: Map<string, PendingIncrement>; timer: NodeJS.Timeout | null }

function scheduleFlush() {
  if (store.timer) return
  store.timer = setTimeout(async () => {
    store.timer = null
    await flush()
  }, FLUSH_INTERVAL_MS)
}

export function queueViewIncrement(id: string) {
  const existing = store.map.get(id)
  if (existing) existing.count += 1
  else store.map.set(id, { id, count: 1 })
  if (store.map.size >= MAX_BUFFER) flush()
  else scheduleFlush()
}

export async function flush() {
  if (!store.map.size) return
  const batch = Array.from(store.map.values())
  store.map.clear()
  try {
    await Promise.all(batch.map(b => prisma.muqtarabArticle.update({ where: { id: b.id }, data: { view_count: { increment: b.count } } })))
  } catch (e) {
    console.error('View batch flush failed', e)
  }
}
