import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to determine media type from MIME type
function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("image/")) return MediaType.IMAGE;
  if (mimeType.startsWith("video/")) return MediaType.VIDEO;
  if (mimeType.startsWith("audio/")) return MediaType.AUDIO;
  return MediaType.DOCUMENT;
}

// POST /api/admin/media/upload - Upload new media asset
export async function POST(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Get folder path for Cloudinary organization
    let cloudinaryFolder = "media";
    if (folderId) {
      const folder = await prisma.mediaFolder.findUnique({
        where: { id: folderId },
        select: { path: true },
      });
      if (folder) {
        // Convert path to Cloudinary folder format
        cloudinaryFolder = `media${folder.path}`;
      }
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: cloudinaryFolder,
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm", "mp3", "wav", "pdf", "doc", "docx"],
      transformation: [
        {
          quality: "auto:good",
          fetch_format: "auto",
        },
      ],
    });

    // Extract metadata
    const mediaType = getMediaType(file.type);
    const metadata: any = {
      format: uploadResult.format,
      resource_type: uploadResult.resource_type,
    };

    if (mediaType === MediaType.IMAGE) {
      metadata.exif = uploadResult.exif;
      metadata.colors = uploadResult.colors;
      metadata.predominant = uploadResult.predominant;
    }

    if (mediaType === MediaType.VIDEO || mediaType === MediaType.AUDIO) {
      metadata.duration = uploadResult.duration;
      metadata.bit_rate = uploadResult.bit_rate;
    }

    // Create database record
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width: uploadResult.width || null,
        height: uploadResult.height || null,
        duration: uploadResult.duration ? Math.round(uploadResult.duration) : null,
        cloudinaryId: uploadResult.public_id,
        cloudinaryUrl: uploadResult.secure_url,
        thumbnailUrl: uploadResult.secure_url, // For images, same as main URL
        type: mediaType,
        metadata,
        folderId,
        uploadedById: userCheck.user.id,
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

    // Generate thumbnail for videos
    if (mediaType === MediaType.VIDEO && uploadResult.public_id) {
      const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
        resource_type: "video",
        transformation: [
          { width: 400, height: 300, crop: "fill" },
          { format: "jpg" },
        ],
      });
      
      // Update with thumbnail
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { thumbnailUrl },
      });
      
      asset.thumbnailUrl = thumbnailUrl;
    }

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
