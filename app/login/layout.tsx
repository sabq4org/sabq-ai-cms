import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل الدخول - سبق الذكية',
  description: 'تسجيل الدخول إلى سبق الذكية',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // لا نستخدم ConditionalLayout هنا لتجنب الهيدر والفوتر
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
