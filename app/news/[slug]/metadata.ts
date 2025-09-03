import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/url-builder";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await prisma.articles.findFirst({
    where: { slug },
    select: {
      title: true,
      seo_description: true,
      featured_image: true,
      content_type: true,
    },
  });
  if (!item) return {};
  const base = getSiteUrl();
  const url = `${base}${
    item.content_type === "NEWS" ? "/news" : "/article"
  }/${slug}`;
  return {
    title: item.title,
    description: item.seo_description || undefined,
    alternates: { canonical: url },
    openGraph: {
      url,
      images: item.featured_image ? [
        item.featured_image.startsWith('http') ? item.featured_image : `${base}${item.featured_image}`
      ] : [`${base}/images/sabq-logo-social.svg`],
      siteName: "صحيفة سبق الإلكترونية",
      locale: "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      images: item.featured_image ? [
        item.featured_image.startsWith('http') ? item.featured_image : `${base}${item.featured_image}`
      ] : [`${base}/images/sabq-logo-social.svg`],
    },
  };
}
