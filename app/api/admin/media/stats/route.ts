import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total counts
    const [totalAssets, totalFolders] = await Promise.all([
      prisma.mediaAsset.count(),
      prisma.mediaFolder.count(),
    ]);

    // Get assets by type
    const assetsByType = await prisma.mediaAsset.groupBy({
      by: ['type'],
      _count: {
        _all: true,
      },
    });

    // Convert to object
    const assetsByTypeObj: any = {
      IMAGE: 0,
      VIDEO: 0,
      AUDIO: 0,
      DOCUMENT: 0,
    };

    assetsByType.forEach((item) => {
      assetsByTypeObj[item.type] = item._count._all;
    });

    // Get total size
    const totalSizeResult = await prisma.mediaAsset.aggregate({
      _sum: {
        size: true,
      },
    });

    const totalSize = totalSizeResult._sum.size || 0;

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUploads = await prisma.mediaAsset.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Storage limits (example values, adjust as needed)
    const storageLimit = 10 * 1024 * 1024 * 1024; // 10GB in bytes
    const storageUsed = totalSize;

    return NextResponse.json({
      totalAssets,
      totalFolders,
      totalSize,
      assetsByType: assetsByTypeObj,
      recentUploads,
      storageUsed,
      storageLimit,
    });
  } catch (error) {
    console.error("Error fetching media stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch media statistics" },
      { status: 500 }
    );
  }
}
