import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function requireSystemAdmin() {
  const at = cookies().get("sabq_at")?.value;
  if (!at) throw Object.assign(new Error("Unauthorized"), { status: 401 });

  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET!;
  let payload: any;
  try { payload = jwt.verify(at, secret); } catch {
    throw Object.assign(new Error("Invalid token"), { status: 401 });
  }
  const role = payload?.role;
  const allowed = role === "system_admin" || role === "SYSTEM_ADMIN" || role === "admin" || role === "ADMIN";
  if (!allowed) throw Object.assign(new Error("Forbidden"), { status: 403 });
  return { userId: payload?.sub as string | undefined, role };
}


