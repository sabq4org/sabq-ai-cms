import { NextResponse } from "next/server";

const secure = process.env.SECURE_COOKIES === "true" || process.env.NODE_ENV === "production";
const domain: string | undefined = undefined; // عيّنه إذا لزم

export function setAuthCookies(res: NextResponse, access: string, refresh: string) {
  setAccessCookie(res, access);
  res.cookies.set("sabq_rt", refresh, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * Number(process.env.JWT_REFRESH_TTL_DAYS || 7),
    domain,
  });
}

export function setAccessCookie(res: NextResponse, access: string) {
  res.cookies.set("sabq_at", access, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * Number(process.env.JWT_ACCESS_TTL_MIN || 15),
    domain,
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set("sabq_at", "", {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    domain,
  });
  res.cookies.set("sabq_rt", "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
    domain,
  });
}


