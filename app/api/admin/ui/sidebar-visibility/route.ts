import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { SIDEBAR_ITEMS } from "@/config/sidebarItems";
import { readSidebarVisibility, writeSidebarVisibility } from "@/lib/ui-visibility";
import { requireSystemAdmin } from "@/lib/require-role";

const CACHE_TAG = "sidebar_visibility";

export async function GET(req: NextRequest) {
  // السماح داخليًا عبر رأس خاص أو لمدير النظام فقط
  const internal = req.headers.get("x-internal") === "1";
  if (!internal) {
    try { await requireSystemAdmin(); } catch (e: any) {
      return NextResponse.json({ error: e.message || "Forbidden" }, { status: e.status || 403 });
    }
  }

  const value = await readSidebarVisibility();
  return NextResponse.json(value, { headers: { "Cache-Tag": CACHE_TAG } });
}

export async function PUT(req: NextRequest) {
  try { var user = await requireSystemAdmin(); } catch (e: any) {
    return NextResponse.json({ error: e.message || "Forbidden" }, { status: e.status || 403 });
  }

  const body = await req.json();
  const allowed = new Set(SIDEBAR_ITEMS.map(i => i.key));
  if (!Array.isArray(body?.items)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const sanitized = body.items
    .filter((i: any) => allowed.has(i?.key))
    .map((i: any) => ({ key: i.key, visible: Boolean(i.visible) }));

  await writeSidebarVisibility({ version: 1, items: sanitized }, user.userId);
  try { revalidateTag(CACHE_TAG); } catch {}
  return NextResponse.json({ success: true });
}


