import LightLayout from "@/components/layouts/LightLayout";
import { Providers } from "@/app/providers";
import "@/styles/light-layout.css";
// theme-manager.css removed for performance
import "@/styles/muqtarab-cards.css";
import "@/styles/old-style-news.css";

export default function LightLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <LightLayout>{children}</LightLayout>
    </Providers>
  );
}
