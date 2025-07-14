import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// إعدادات تحسين الصور
const IMAGE_QUALITY = {
  webp: 85,
  avif: 80,
  jpeg: 90,
  png: 90,
};

const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 240 },
  medium: { width: 640, height: 480 },
  large: { width: 1024, height: 768 },
  xlarge: { width: 1920, height: 1080 },
};

export interface OptimizedImage {
  original: string;
  webp: string;
  avif?: string;
  sizes: {
    [key: string]: {
      webp: string;
      avif?: string;
    };
  };
}

/**
 * تحسين صورة واحدة
 */
export async function optimizeImage(
  inputPath: string,
  outputDir: string,
  options: {
    generateAvif?: boolean;
    sizes?: string[];
    quality?: number;
  } = {}
): Promise<OptimizedImage> {
  const {
    generateAvif = false,
    sizes = ['thumbnail', 'medium', 'large'],
    quality,
  } = options;

  const filename = path.basename(inputPath, path.extname(inputPath));
  const result: OptimizedImage = {
    original: inputPath,
    webp: '',
    sizes: {},
  };

  // التأكد من وجود مجلد الإخراج
  await fs.mkdir(outputDir, { recursive: true });

  // تحويل الصورة الأصلية إلى WebP
  const webpPath = path.join(outputDir, `${filename}.webp`);
  await sharp(inputPath)
    .webp({ quality: quality || IMAGE_QUALITY.webp })
    .toFile(webpPath);
  result.webp = webpPath;

  // تحويل إلى AVIF إذا كان مطلوباً
  if (generateAvif) {
    const avifPath = path.join(outputDir, `${filename}.avif`);
    await sharp(inputPath)
      .avif({ quality: quality || IMAGE_QUALITY.avif })
      .toFile(avifPath);
    result.avif = avifPath;
  }

  // إنشاء أحجام مختلفة
  for (const sizeName of sizes) {
    const size = IMAGE_SIZES[sizeName as keyof typeof IMAGE_SIZES];
    if (!size) continue;

    const sizeDir = path.join(outputDir, sizeName);
    await fs.mkdir(sizeDir, { recursive: true });

    // WebP بحجم مخصص
    const webpSizePath = path.join(sizeDir, `${filename}.webp`);
    await sharp(inputPath)
      .resize(size.width, size.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: quality || IMAGE_QUALITY.webp })
      .toFile(webpSizePath);

    result.sizes[sizeName] = { webp: webpSizePath };

    // AVIF بحجم مخصص
    if (generateAvif) {
      const avifSizePath = path.join(sizeDir, `${filename}.avif`);
      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .avif({ quality: quality || IMAGE_QUALITY.avif })
        .toFile(avifSizePath);
      result.sizes[sizeName].avif = avifSizePath;
    }
  }

  return result;
}

/**
 * معالجة دفعة من الصور
 */
export async function batchOptimizeImages(
  inputPaths: string[],
  outputDir: string,
  options?: Parameters<typeof optimizeImage>[2]
): Promise<OptimizedImage[]> {
  const results = await Promise.all(
    inputPaths.map((inputPath) =>
      optimizeImage(inputPath, outputDir, options)
    )
  );
  return results;
}

/**
 * الحصول على معلومات الصورة
 */
export async function getImageInfo(imagePath: string) {
  const metadata = await sharp(imagePath).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: metadata.size,
    density: metadata.density,
    hasAlpha: metadata.hasAlpha,
  };
}

/**
 * تحسين صورة من Buffer
 */
export async function optimizeImageBuffer(
  buffer: Buffer,
  options: {
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    quality?: number;
    width?: number;
    height?: number;
  } = {}
): Promise<Buffer> {
  const {
    format = 'webp',
    quality = IMAGE_QUALITY[format],
    width,
    height,
  } = options;

  let pipeline = sharp(buffer);

  // تغيير الحجم إذا كان مطلوباً
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // تحويل إلى الصيغة المطلوبة
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality, progressive: true });
      break;
  }

  return await pipeline.toBuffer();
}

/**
 * إنشاء placeholder blur للصورة
 */
export async function generateBlurPlaceholder(
  imagePath: string,
  size: number = 20
): Promise<string> {
  const buffer = await sharp(imagePath)
    .resize(size, size, { fit: 'inside' })
    .blur(5)
    .toBuffer();
  
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

/**
 * التحقق من صحة الصورة
 */
export async function validateImage(
  imagePath: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    maxSize?: number; // بالبايت
    allowedFormats?: string[];
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  try {
    const metadata = await sharp(imagePath).metadata();
    const {
      maxWidth = 4096,
      maxHeight = 4096,
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif'],
    } = options;

    if (metadata.width && metadata.width > maxWidth) {
      return { valid: false, error: `عرض الصورة يتجاوز ${maxWidth}px` };
    }

    if (metadata.height && metadata.height > maxHeight) {
      return { valid: false, error: `ارتفاع الصورة يتجاوز ${maxHeight}px` };
    }

    if (metadata.size && metadata.size > maxSize) {
      return {
        valid: false,
        error: `حجم الصورة يتجاوز ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    if (metadata.format && !allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `صيغة الصورة غير مدعومة. الصيغ المسموحة: ${allowedFormats.join(', ')}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'الملف ليس صورة صحيحة' };
  }
} 