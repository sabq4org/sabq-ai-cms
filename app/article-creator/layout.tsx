import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'منشئ المقالات المتقدم | سبق الإخباري',
  description: 'أنشئ مقالات احترافية مع المحرر المتقدم، رفع الصور، والإيموجي',
}

export default function ArticleCreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      {children}
    </div>
  )
}
