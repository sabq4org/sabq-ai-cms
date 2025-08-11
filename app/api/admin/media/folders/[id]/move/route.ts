import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { parentId } = await request.json();

    // Get the folder to move
    const folder = await prisma.mediaFolder.findUnique({
      where: { id: params.id },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    // Validate new parent
    let newParent = null;
    let newPath = folder.slug;

    if (parentId) {
      newParent = await prisma.mediaFolder.findUnique({
        where: { id: parentId },
      });

      if (!newParent) {
        return NextResponse.json(
          { error: "Target folder not found" },
          { status: 404 }
        );
      }

      // Check for circular reference
      if (await isDescendant(params.id, parentId)) {
        return NextResponse.json(
          { error: "Cannot move folder to its own descendant" },
          { status: 400 }
        );
      }

      newPath = `${newParent.path}/${folder.slug}`;
    }

    // Check for duplicate slug in target location
    const duplicate = await prisma.mediaFolder.findFirst({
      where: {
        parentId: parentId || null,
        slug: folder.slug,
        NOT: { id: params.id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "A folder with this name already exists in the target location" },
        { status: 400 }
      );
    }

    // Update folder
    const updatedFolder = await prisma.mediaFolder.update({
      where: { id: params.id },
      data: {
        parentId: parentId || null,
        path: newPath,
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

    // Update all descendant paths
    await updateDescendantPaths(params.id, newPath);

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
    console.error("Error moving folder:", error);
    return NextResponse.json(
      { error: "Failed to move folder" },
      { status: 500 }
    );
  }
}

// Check if targetId is a descendant of folderId
async function isDescendant(folderId: string, targetId: string): Promise<boolean> {
  const children = await prisma.mediaFolder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });

  for (const child of children) {
    if (child.id === targetId) return true;
    if (await isDescendant(child.id, targetId)) return true;
  }

  return false;
}

// Update paths for all descendants
async function updateDescendantPaths(parentId: string, parentPath: string) {
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
    await updateDescendantPaths(child.id, newPath);
  }
}
