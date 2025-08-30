export const metadata = {
  title: 'اختبار الأداء - بدون المحتوى المخصص',
  description: 'قياس سرعة تحميل الصفحة بدون مكون المحتوى المخصص للمقارنة',
}

export default function TestPerformanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  )
}
