"use client";
import Image from "next/image";
import { getCloudinaryUrl } from "@/utils/cloudinary-optimizer";

type Img = { url: string; alt?: string };

// ✅ صورة بارزة بسيطة وخفيفة
export default function HeroImage({ images }: { images: Img[] }) {
  // إذا لم توجد صور، لا نعرض شيئاً
  if (!images || images.length === 0) return null;
  
  // نأخذ أول صورة فقط
  const img = images[0];
  if (!img || !img.url) return null;
  
  // تحسين الصورة
  const optimizedUrl = img.url.includes('res.cloudinary.com')
    ? getCloudinaryUrl(img.url, {
        width: 1200,
        quality: 'auto:good',
        format: 'auto',
        crop: 'limit',
      })
    : img.url;
  
  return (
    <div className="w-full mb-6">
      <div className="relative w-full aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={optimizedUrl}
          alt={img.alt || "صورة الخبر"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
          priority
          className="object-cover"
          quality={80}
        />
      </div>
    </div>
  );
}
