'use client'

import { useEffect } from 'react'
import { Button } from '../components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // سجل الخطأ في وحدة التحكم
    console.error('خطأ في التطبيق:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600">
          حدث خطأ في التطبيق
        </h2>
        <p className="mb-4 text-gray-600">
          {error.message || 'حدث خطأ غير متوقع'}
        </p>
        {error.digest && (
          <p className="mb-4 text-sm text-gray-500">
            رمز الخطأ: {error.digest}
          </p>
        )}
        <Button
          onClick={() => {
            // مسح الكاش وإعادة المحاولة
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }}
          className="mb-2"
        >
          إعادة تحميل الصفحة
        </Button>
        <br />
        <Button
          onClick={reset}
          variant="outline"
        >
          المحاولة مرة أخرى
        </Button>
      </div>
    </div>
  )
}