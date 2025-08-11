import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { folderId } = await request.json();

    // Validate folder if provided
    if (folderId) {
      const folder = await prisma.mediaFolder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Target folder not found" },
          { status: 404 }
        );
      }
    }

    // Update asset
    const updatedAsset = await prisma.mediaAsset.update({
      where: { id: params.id },
      data: {
        folderId: folderId || null,
        updatedAt: new Date(),
      },
      include: {
        folder: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      asset: updatedAsset,
    });
  } catch (error) {
    console.error("Error moving asset:", error);
    return NextResponse.json(
      { error: "Failed to move asset" },
      { status: 500 }
    );
  }
}
