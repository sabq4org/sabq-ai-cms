import LightLayout from "@/components/layouts/LightLayout";
import { Providers } from "@/app/providers";
import "@/styles/light-layout.css";
import "@/styles/theme-manager.css";
import "@/styles/muqtarab-cards.css";

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
