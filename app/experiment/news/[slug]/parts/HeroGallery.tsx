"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Container from "./Container";

type Img = { url: string; alt?: string; width?: number | null; height?: number | null };

export default function HeroGallery({ images }: { images: Img[] }) {
  if (!images || images.length === 0) return null;
  if (images.length === 1) return <OneImageHero img={images[0]} />;
  if (images.length === 3) return <ThreeImageGrid imgs={images} />;
  return <OneImageHero img={images[0]} hasMore />;
}

function OneImageHero({ img, hasMore }: { img: Img; hasMore?: boolean }) {
  return (
    <div className="relative w-full py-4 px-4 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:h-[520px] overflow-hidden rounded-2xl">
          <Image
            src={img.url}
            alt={img.alt || "صورة الخبر"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            priority
            className="object-cover object-center transition-transform duration-500 will-change-transform hover:scale-[1.02]"
          />
          {hasMore && (
            <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-black/50 text-white text-xs md:text-sm px-3 py-1.5 rounded-full">عرض كل الصور</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreeImageGrid({ imgs }: { imgs: Img[] }) {
  const [a, b, c] = imgs;
  return (
    <div className="relative w-full py-4 px-4 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
          <div className="relative md:col-span-2 row-span-2 aspect-[4/3] md:aspect-auto md:h-[520px] overflow-hidden rounded-2xl">
            <Image src={a.url} alt={a.alt || "صورة"} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover object-center" priority />
          </div>
          <div className="grid grid-rows-2 gap-2 md:gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={b.url} alt={b.alt || "صورة"} fill sizes="33vw" className="object-cover object-center" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={c.url} alt={c.alt || "صورة"} fill sizes="33vw" className="object-cover object-center" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


