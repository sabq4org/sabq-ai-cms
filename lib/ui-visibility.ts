import prisma from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis-client";

const REDIS_KEY = "ui:sidebar:visibility:v2";
const UI_KEY = "sidebar.visibility";

export async function readSidebarVisibility() {
  const r = getRedisClient();
  try {
    const cached = r ? await r.get(REDIS_KEY) : null;
    if (cached) return JSON.parse(cached as unknown as string);

    // القراءة من UiSetting إن توفر
    try {
      const setting = await prisma.uiSetting.findUnique({ where: { key: UI_KEY } });
      if (setting?.value) {
        const value = setting.value as any;
        if (r) await r.setEx(REDIS_KEY, 600, JSON.stringify(value));
        return value;
      }
    } catch {}

    // بديل: SystemSettings (module: ui, category: sidebar, key: visibility)
    try {
      const sys = await prisma.systemSettings.findUnique({
        where: { module_category_key: { module: "ui", category: "sidebar", key: "visibility" } },
      });
      if (sys?.value) {
        const value = sys.value as any;
        if (r) await r.setEx(REDIS_KEY, 600, JSON.stringify(value));
        return value;
      }
    } catch {}

    const fallback = { version: 2, items: [] };
    if (r) await r.setEx(REDIS_KEY, 600, JSON.stringify(fallback));
    return fallback;
  } catch {
    return { version: 2, items: [] };
  }
}

export async function writeSidebarVisibility(value: any, updatedById?: string) {
  let saved: any | null = null;
  try {
    saved = await prisma.uiSetting.upsert({
      where: { key: UI_KEY },
      create: { key: UI_KEY, value, updatedById },
      update: { value, updatedById },
    });
  } catch {
    // بديل الكتابة إلى SystemSettings لو UiSetting غير متاح
    saved = await prisma.systemSettings.upsert({
      where: { module_category_key: { module: "ui", category: "sidebar", key: "visibility" } },
      create: {
        module: "ui",
        category: "sidebar",
        key: "visibility",
        value,
        data_type: "json",
        description: "Global sidebar visibility",
      },
      update: { value },
    });
  }
  const r = getRedisClient();
  try { if (r) await r.del(REDIS_KEY); } catch {}
  return saved;
}


