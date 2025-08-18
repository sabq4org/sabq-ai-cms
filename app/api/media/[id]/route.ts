import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

// PATCH /api/media/:id - تحديث بيانات الوسائط
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // التحقق من المصادقة
    let token = request.cookies.get("sabq_at")?.value ||
      request.cookies.get("auth-token")?.value ||
      request.cookies.get("access_token")?.value;

    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "رمز مصادقة غير صالح" }, { status: 401 });
    }

    const userId = decoded.userId || decoded.id;

    const data = await request.json();
    const { id } = params;

    // التحقق من وجود الوسائط
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { error: "الوسائط غير موجودة" },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    const userRole = decoded.role;
    const isOwner = media.uploaderId === userId;
    const canEdit = isOwner || ["admin", "editor"].includes(userRole);

    if (!canEdit) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية لتعديل هذه الوسائط" },
        { status: 403 }
      );
    }

    // تحديث البيانات
    const updatedMedia = await prisma.media.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : media.title,
        alt: data.alt !== undefined ? data.alt : media.alt,
        description: data.description !== undefined ? data.description : media.description,
        tags: data.tags !== undefined ? data.tags : media.tags,
        license: data.license !== undefined ? data.license : media.license,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error("خطأ في تحديث الوسائط:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث الوسائط" },
      { status: 500 }
    );
  }
}

// DELETE /api/media/:id - حذف الوسائط
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // التحقق من المصادقة
    let token = request.cookies.get("sabq_at")?.value ||
      request.cookies.get("auth-token")?.value ||
      request.cookies.get("access_token")?.value;

    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "رمز مصادقة غير صالح" }, { status: 401 });
    }

    const userId = decoded.userId || decoded.id;

    const { id } = params;

    // التحقق من وجود الوسائط
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { error: "الوسائط غير موجودة" },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    const userRole = decoded.role;
    const isOwner = media.uploaderId === userId;
    const canDelete = isOwner || userRole === "admin";

    if (!canDelete) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية لحذف هذه الوسائط" },
        { status: 403 }
      );
    }

    // حذف الوسائط
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("خطأ في حذف الوسائط:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حذف الوسائط" },
      { status: 500 }
    );
  }
}
