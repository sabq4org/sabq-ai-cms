import { NextResponse, NextRequest } from "next/server";
import { verify, sign } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setAccessCookie, clearAuthCookies } from "@/lib/auth-cookies";

export async function POST(req: NextRequest) {
  const rt = req.cookies.get("sabq_rt")?.value;
  if (!rt) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  try {
    const payload = verify(rt, process.env.JWT_REFRESH_SECRET!) as any;
    const tokens = await prisma.refreshToken.findMany({ where: { userId: payload.sub, revokedAt: null } });
    let matched: any = null;
    for (const t of tokens) {
      if (await bcrypt.compare(rt, t.tokenHash)) { matched = t; break; }
    }
    if (!matched || matched.expiresAt < new Date()) throw new Error("Invalid refresh");

    const access = sign({ sub: payload.sub }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: `${process.env.JWT_ACCESS_TTL_MIN || 15}m`,
      issuer: "sabq-ai-cms",
    });
    const res = NextResponse.json({ ok: true });
    setAccessCookie(res, access);
    return res;
  } catch {
    const res = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }
}


