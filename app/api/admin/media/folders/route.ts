import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma, { ensureDbConnected, retryWithConnection } from "@/lib/prisma";
import { z } from "zod";

const createFolderSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().optional().nullable(),
});

// GET /api/admin/media/folders - Get all folders with hierarchy
export async function GET(request: NextRequest) {
  try {
    await ensureDbConnected();
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folders = await retryWithConnection(async () => await prisma.mediaFolder.findMany({
      include: {
        _count: {
          select: {
            assets: true,
            subfolders: true,
          },
        },
      },
      orderBy: [
        { parentId: "asc" },
        { name: "asc" },
      ],
    }));

    // Build hierarchical structure
    const buildHierarchy = (parentId: string | null = null): any[] => {
      return folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          ...folder,
          children: buildHierarchy(folder.id),
        }));
    };

    const hierarchy = buildHierarchy();

    return NextResponse.json({
      folders,
      hierarchy,
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// POST /api/admin/media/folders - Create a new folder
export async function POST(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createFolderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, parentId } = validation.data;

    // Check if folder with same name already exists in the same location
    const existingFolder = await prisma.mediaFolder.findFirst({
      where: {
        name: name.trim(),
        parentId: parentId || null,
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: "مجلد بهذا الاسم موجود بالفعل في هذا المكان" },
        { status: 409 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^\u0621-\u064A\w\s-]/g, "") // Keep Arabic, alphanumeric, spaces, and hyphens
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Build full path
    let path = `/${slug}`;
    if (parentId) {
      const parent = await prisma.mediaFolder.findUnique({
        where: { id: parentId },
      });
      if (parent) {
        path = `${parent.path}/${slug}`;
      }
    }

    // Create folder
    const folder = await prisma.mediaFolder.create({
      data: {
        name,
        slug,
        path,
        parentId,
        createdById: userCheck.user.id,
      },
      include: {
        parent: true,
        _count: {
          select: {
            assets: true,
            subfolders: true,
          },
        },
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Folder with this name already exists in this location" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
