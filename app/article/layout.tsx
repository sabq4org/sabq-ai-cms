export const metadata = {
  title: 'مقال - سبق الإخبارية',
  description: 'تفاصيل المقال من موقع سبق الإخبارية',
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
