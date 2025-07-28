import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'أرشيف النشرات الصوتية - صحيفة سبق الإلكترونية',
  description: 'استمع إلى جميع النشرات الإخبارية الصوتية من صحيفة سبق بتقنية الذكاء الاصطناعي',
  keywords: 'نشرات صوتية, أخبار مسموعة, سبق, بودكاست, نشرات إخبارية',
  openGraph: {
    title: 'أرشيف النشرات الصوتية - صحيفة سبق',
    description: 'استمع إلى جميع النشرات الإخبارية الصوتية',
    type: 'website',
  },
};

export default function AudioArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 