import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

// ضمان تشغيل هذا المسار على بيئة Node.js لدعم cloudinary و formData
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug log to check configuration
console.log("🔧 Cloudinary Config Check:", {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
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

    // قراءة JSON data
    console.log("📋 Request headers:", {
      contentType: request.headers.get("content-type"),
      contentLength: request.headers.get("content-length")
    });
    
    let data;
    try {
      data = await request.json();
    } catch (error) {
      console.error("❌ Failed to parse JSON:", error);
      return NextResponse.json(
        { error: "Failed to parse JSON data." },
        { status: 400 }
      );
    }
    
    const { file, folderId, altText } = data;
    
    console.log("📎 File info:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      folderId: folderId || 'root',
      hasData: !!file?.data
    });

    if (!file || !file.data) {
      console.error("❌ No file data provided");
      return NextResponse.json(
        { error: "No file data provided" },
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

    // Use base64 data directly from request
    console.log("🔄 Using base64 data from request...");
    const dataUri = file.data; // Already a data URI from frontend
    console.log("✅ Base64 data ready, starts with:", dataUri.substring(0, 50));

    // Upload to Cloudinary
    console.log("☁️ Uploading to Cloudinary folder:", cloudinaryFolder);
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
    
    console.log("🎉 Cloudinary upload successful:", {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      format: uploadResult.format,
      resource_type: uploadResult.resource_type
    });

    // Extract metadata (avoid undefined values inside JSON)
    const mediaType = getMediaType(file.type);
    const metadata: Record<string, unknown> = {};

    if (uploadResult.format != null) metadata.format = uploadResult.format;
    if (uploadResult.resource_type != null) metadata.resource_type = uploadResult.resource_type;
    
    // إضافة النص البديل إلى metadata
    if (altText) metadata.altText = altText;

    if (mediaType === MediaType.IMAGE) {
      if (uploadResult.exif != null) metadata.exif = uploadResult.exif;
      if (uploadResult.colors != null) metadata.colors = uploadResult.colors;
      if (uploadResult.predominant != null) metadata.predominant = uploadResult.predominant;
    }

    if (mediaType === MediaType.VIDEO || mediaType === MediaType.AUDIO) {
      if (typeof uploadResult.duration === "number") metadata.duration = Math.round(uploadResult.duration);
      if (uploadResult.bit_rate != null) metadata.bit_rate = uploadResult.bit_rate;
    }

    // Create database record
    console.log("💾 Creating database record...");
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width: typeof uploadResult.width === "number" ? uploadResult.width : null,
        height: typeof uploadResult.height === "number" ? uploadResult.height : null,
        duration: typeof uploadResult.duration === "number" ? Math.round(uploadResult.duration) : null,
        cloudinaryId: uploadResult.public_id,
        cloudinaryUrl: uploadResult.secure_url,
        thumbnailUrl: uploadResult.secure_url, // For images, same as main URL
        type: mediaType,
        metadata,
        folderId,
        uploadedById: userCheck.user?.id,
        // altText: altText || null, // TODO: إضافة حقل altText في قاعدة البيانات
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
    
    console.log("✅ Database record created successfully:", asset.id);

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

    console.log("🎯 Upload process completed successfully for:", file.name);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    // توسعة السجل لإظهار السبب الدقيق
    console.error("💥 Error uploading media:", error);
    let message = "Failed to upload media";
    let details: unknown = undefined;
    if (error && typeof error === "object") {
      const anyErr = error as any;
      message = anyErr.message || message;
      details = anyErr.error || anyErr.response || anyErr;
    }
    // إذا كان الخطأ متعلقًا بالـ formData/NEXT body parsing، أعد 415 بدل 500
    const lowerMsg = String(message || "").toLowerCase();
    const isBadContentType = lowerMsg.includes("content-type") || lowerMsg.includes("formdata") || lowerMsg.includes("body") || lowerMsg.includes("multipart");
    const status = isBadContentType ? 415 : 500;
    return NextResponse.json({ error: status === 415 ? "Invalid content type" : "Failed to upload media", message, details }, { status });
  }
}
