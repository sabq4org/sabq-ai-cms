import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";

export const runtime = "nodejs";

// PATCH /api/media/:id - تحديث بيانات الوسائط
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

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
    const userRole = (session.user as any).role;
    const isOwner = media.uploaderId === session.user.id;
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

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
    const userRole = (session.user as any).role;
    const isOwner = media.uploaderId === session.user.id;
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
