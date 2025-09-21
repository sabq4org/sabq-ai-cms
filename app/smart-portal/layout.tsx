import type { Metadata } from "next";
import SPSiteHeader from "@/components/smart-portal/SPSiteHeader";
import SPSiteFooter from "@/components/smart-portal/SPSiteFooter";

export const metadata: Metadata = {
  title: "البوابة الذكية - معاينة",
  description: "تصميم جديد تجريبي لبوابة إخبارية ذكية (Preview)",
};

export default function SmartPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" className="min-h-screen bg-neutral-950 text-gray-100">
      <SPSiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <SPSiteFooter />
    </div>
  );
}


