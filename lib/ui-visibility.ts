import prisma from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis-client";

const REDIS_KEY = "ui:sidebar:visibility:v2";
const UI_KEY = "sidebar.visibility";

export async function readSidebarVisibility() {
  const r = getRedisClient();
  try {
    const cached = r ? await r.get(REDIS_KEY) : null;
    if (cached) return JSON.parse(cached as unknown as string);

    const setting = await prisma.uiSetting.findUnique({ where: { key: UI_KEY } });
    const value = setting?.value ?? { version: 2, items: [] };
    if (r) await r.setEx(REDIS_KEY, 600, JSON.stringify(value));
    return value;
  } catch {
    return { version: 1, items: [] };
  }
}

export async function writeSidebarVisibility(value: any, updatedById?: string) {
  const saved = await prisma.uiSetting.upsert({
    where: { key: UI_KEY },
    create: { key: UI_KEY, value, updatedById },
    update: { value, updatedById },
  });
  const r = getRedisClient();
  try { if (r) await r.del(REDIS_KEY); } catch {}
  return saved;
}


