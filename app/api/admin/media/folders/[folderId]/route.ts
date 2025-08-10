import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateFolderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

interface Params {
  params: Promise<{ folderId: string }>;
}

// GET /api/admin/media/folders/[folderId] - Get folder details with contents
export async function GET(request: NextRequest, props: Params) {
  const params = await props.params;
  
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folder = await prisma.mediaFolder.findUnique({
      where: { id: params.folderId },
      include: {
        parent: true,
        subfolders: {
          include: {
            _count: {
              select: {
                assets: true,
                subfolders: true,
              },
            },
          },
          orderBy: { name: "asc" },
        },
        assets: {
          orderBy: { createdAt: "desc" },
          take: 50, // Paginate if needed
        },
        _count: {
          select: {
            assets: true,
            subfolders: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/media/folders/[folderId] - Update folder
export async function PATCH(request: NextRequest, props: Params) {
  const params = await props.params;
  
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateFolderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    if (!name) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // Check if folder exists
    const existingFolder = await prisma.mediaFolder.findUnique({
      where: { id: params.folderId },
      include: { parent: true },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Generate new slug
    const slug = name
      .toLowerCase()
      .replace(/[^\u0621-\u064A\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Update path
    let path = `/${slug}`;
    if (existingFolder.parentId) {
      path = `${existingFolder.parent!.path}/${slug}`;
    }

    // Update folder and all subfolders' paths
    const updatedFolder = await prisma.$transaction(async (tx) => {
      // Update the folder
      const folder = await tx.mediaFolder.update({
        where: { id: params.folderId },
        data: {
          name,
          slug,
          path,
        },
      });

      // Update all subfolders' paths recursively
      const updateSubfolderPaths = async (parentId: string, parentPath: string) => {
        const subfolders = await tx.mediaFolder.findMany({
          where: { parentId },
        });

        for (const subfolder of subfolders) {
          const newPath = `${parentPath}/${subfolder.slug}`;
          await tx.mediaFolder.update({
            where: { id: subfolder.id },
            data: { path: newPath },
          });
          await updateSubfolderPaths(subfolder.id, newPath);
        }
      };

      await updateSubfolderPaths(folder.id, folder.path);

      return folder;
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("Error updating folder:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Folder with this name already exists in this location" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/media/folders/[folderId] - Delete folder
export async function DELETE(request: NextRequest, props: Params) {
  const params = await props.params;
  
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if folder exists and has content
    const folder = await prisma.mediaFolder.findUnique({
      where: { id: params.folderId },
      include: {
        _count: {
          select: {
            assets: true,
            subfolders: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Prevent deletion if folder has content
    if (folder._count.assets > 0 || folder._count.subfolders > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete folder with content",
          details: {
            assets: folder._count.assets,
            subfolders: folder._count.subfolders,
          },
        },
        { status: 400 }
      );
    }

    // Delete folder
    await prisma.mediaFolder.delete({
      where: { id: params.folderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
