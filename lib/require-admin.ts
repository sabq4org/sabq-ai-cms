import { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

interface AdminCheckResult {
  authorized: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}

export async function requireAdmin(request: NextRequest): Promise<AdminCheckResult> {
  try {
    // Check for access token in cookies
    const token = request.cookies.get("sabq_at")?.value || 
                  request.cookies.get("auth-token")?.value;

    if (!token) {
      return { authorized: false, error: "No authentication token found" };
    }

    // Verify JWT token
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "your-secret-key";
    let decoded: any;
    
    try {
      decoded = verify(token, secret);
    } catch (error) {
      return { authorized: false, error: "Invalid or expired token" };
    }

    // Get user ID from token
    const userId = decoded.sub || decoded.userId || decoded.id;
    if (!userId) {
      return { authorized: false, error: "Invalid token format" };
    }

    // Fetch user from database
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_admin: true,
      },
    });

    if (!user) {
      return { authorized: false, error: "User not found" };
    }

    // Check if user has admin privileges
    if (!user.is_admin && !["admin", "system_admin"].includes(user.role)) {
      return { authorized: false, error: "Insufficient permissions" };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "Admin",
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Error in requireAdmin:", error);
    return { authorized: false, error: "Authentication check failed" };
  }
}
