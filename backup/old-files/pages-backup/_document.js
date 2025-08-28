// ملف _document.js مؤقت لحل مشكلة Next.js
// هذا الملف ضروري عندما يحاول Next.js العثور على _document
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}