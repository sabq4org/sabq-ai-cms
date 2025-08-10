import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";
import { z } from "zod";

const moveAssetsSchema = z.object({
  assetIds: z.array(z.string()).min(1),
  targetFolderId: z.string().nullable(),
});

// POST /api/admin/media/assets/move - Move multiple assets to a folder
export async function POST(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = moveAssetsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { assetIds, targetFolderId } = validation.data;

    // Verify target folder exists if provided
    if (targetFolderId) {
      const folder = await prisma.mediaFolder.findUnique({
        where: { id: targetFolderId },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Target folder not found" },
          { status: 404 }
        );
      }
    }

    // Update all assets
    const result = await prisma.mediaAsset.updateMany({
      where: {
        id: { in: assetIds },
      },
      data: {
        folderId: targetFolderId,
      },
    });

    return NextResponse.json({
      success: true,
      movedCount: result.count,
    });
  } catch (error) {
    console.error("Error moving assets:", error);
    return NextResponse.json(
      { error: "Failed to move assets" },
      { status: 500 }
    );
  }
}
