import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateAssetSchema = z.object({
  filename: z.string().min(1).max(255).optional(),
  folderId: z.string().nullable().optional(),
});

interface Params {
  params: Promise<{ assetId: string }>;
}

// GET /api/admin/media/assets/[assetId] - Get asset details
export async function GET(request: NextRequest, props: Params) {
  const params = await props.params;
  
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: { id: params.assetId },
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
        newsArticles: {
          select: {
            id: true,
            title: true,
            slug: true,
            published_at: true,
          },
          take: 10,
        },
        muqtarabArticles: {
          select: {
            id: true,
            title: true,
            slug: true,
            publish_at: true,
          },
          take: 10,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/media/assets/[assetId] - Update asset (move to folder, rename)
export async function PATCH(request: NextRequest, props: Params) {
  const params = await props.params;
  
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateAssetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { filename, folderId } = validation.data;

    // Check if asset exists
    const existingAsset = await prisma.mediaAsset.findUnique({
      where: { id: params.assetId },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // If folderId is provided, verify it exists
    if (folderId !== undefined && folderId !== null) {
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
      where: { id: params.assetId },
      data: {
        ...(filename && { filename }),
        ...(folderId !== undefined && { folderId }),
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

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/media/assets/[assetId] - Delete asset
export async function DELETE(request: NextRequest, props: Params) {
  const params = await props.params;
  
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if asset exists and is not in use
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: params.assetId },
      include: {
        _count: {
          select: {
            newsArticles: true,
            muqtarabArticles: true,
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Prevent deletion if asset is in use
    if (asset._count.newsArticles > 0 || asset._count.muqtarabArticles > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete asset that is in use",
          details: {
            newsArticles: asset._count.newsArticles,
            muqtarabArticles: asset._count.muqtarabArticles,
          },
        },
        { status: 400 }
      );
    }

    // TODO: Delete from Cloudinary
    // await deleteFromCloudinary(asset.cloudinaryId);

    // Delete from database
    await prisma.mediaAsset.delete({
      where: { id: params.assetId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
