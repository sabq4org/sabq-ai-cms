// أمثلة لاستخدام مكونات النسخة الخفيفة الجديدة

import LiteLayoutWrapper, { 
  LiteFullWidthContainer,
  LiteGrid,
  LiteCard,
  LiteHeading,
  LiteImage
} from '@/components/layout/LiteLayoutWrapper';

// مثال 1: صفحة رئيسية محسنة
export function HomePage() {
  return (
    <LiteLayoutWrapper fullWidth>
      {/* شريط الإحصائيات */}
      <LiteFullWidthContainer background>
        <LiteStatsBar />
      </LiteFullWidthContainer>

      {/* المحتوى الرئيسي */}
      <div className="space-y-6">
        <LiteHeading level={1}>مرحباً بكم في سبق</LiteHeading>
        
        {/* الأخبار المميزة */}
        <LiteFullWidthContainer>
          <LiteHeading level={2}>الأخبار المميزة</LiteHeading>
          <LiteGrid columns={1} gap="md">
            <LiteCard>
              <LiteImage 
                src="/news-1.jpg"
                alt="خبر مميز"
                aspectRatio="16/9"
              />
              <LiteHeading level={3}>عنوان الخبر</LiteHeading>
              <p>محتوى الخبر هنا...</p>
            </LiteCard>
          </LiteGrid>
        </LiteFullWidthContainer>
      </div>
    </LiteLayoutWrapper>
  );
}

// مثال 2: صفحة مقال
export function ArticlePage() {
  return (
    <LiteLayoutWrapper>
      <LiteCard padding="lg">
        <LiteImage 
          src="/article-image.jpg"
          alt="صورة المقال"
        />
        <LiteHeading level={1}>عنوان المقال</LiteHeading>
        <div className="prose">
          <p>محتوى المقال هنا...</p>
        </div>
      </LiteCard>
    </LiteLayoutWrapper>
  );
}

// مثال 3: قائمة الأخبار
export function NewsList({ news }) {
  return (
    <LiteLayoutWrapper fullWidth>
      <LiteFullWidthContainer>
        <LiteHeading level={1}>آخر الأخبار</LiteHeading>
        <LiteGrid columns={1} gap="md">
          {news.map(item => (
            <LiteCard key={item.id}>
              <div className="flex gap-4">
                <LiteImage 
                  src={item.image}
                  alt={item.title}
                  aspectRatio="16/9"
                  className="w-24 h-16"
                />
                <div className="flex-1">
                  <LiteHeading level={3}>{item.title}</LiteHeading>
                  <p className="text-sm text-gray-600">{item.excerpt}</p>
                </div>
              </div>
            </LiteCard>
          ))}
        </LiteGrid>
      </LiteFullWidthContainer>
    </LiteLayoutWrapper>
  );
}
