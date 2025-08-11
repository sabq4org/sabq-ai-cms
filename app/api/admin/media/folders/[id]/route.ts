import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Check if folder exists
    const folder = await prisma.mediaFolder.findUnique({
      where: { id: params.id },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    // Generate new slug
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check for duplicate slug in same parent
    const duplicate = await prisma.mediaFolder.findFirst({
      where: {
        parentId: folder.parentId,
        slug,
        NOT: { id: params.id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "A folder with this name already exists in this location" },
        { status: 400 }
      );
    }

    // Update folder
    const updatedFolder = await prisma.mediaFolder.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            assets: true,
            children: true,
          },
        },
      },
    });

    // Update path for all child folders if needed
    if (folder.name !== name) {
      await updateChildrenPaths(params.id, updatedFolder.path);
    }

    return NextResponse.json({
      success: true,
      folder: {
        ...updatedFolder,
        _count: {
          assets: updatedFolder._count.assets,
          subfolders: updatedFolder._count.children,
        },
      },
    });
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if folder exists and has content
    const folder = await prisma.mediaFolder.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            assets: true,
            children: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    if (folder._count.assets > 0 || folder._count.children > 0) {
      return NextResponse.json(
        { error: "Cannot delete folder with content. Please empty it first." },
        { status: 400 }
      );
    }

    // Delete folder
    await prisma.mediaFolder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}

// Helper function to update children paths
async function updateChildrenPaths(parentId: string, parentPath: string) {
  const children = await prisma.mediaFolder.findMany({
    where: { parentId },
  });

  for (const child of children) {
    const newPath = `${parentPath}/${child.slug}`;
    await prisma.mediaFolder.update({
      where: { id: child.id },
      data: { path: newPath },
    });
    
    // Recursively update grandchildren
    await updateChildrenPaths(child.id, newPath);
  }
}
