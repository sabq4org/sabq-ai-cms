import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'اختبار On-Demand Loading | سبق الإخباري',
  description: 'اختبار تحميل التعليقات والمحتوى المخصص عند الطلب لتحسين الأداء',
}

export default function OnDemandLayout({
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
