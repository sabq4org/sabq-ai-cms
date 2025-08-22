import LightLayout from "@/components/layouts/LightLayout";
import "@/styles/light-layout.css";

export const metadata = {
  title: "النسخة الخفيفة",
  icons: { icon: "/favicon.ico" },
};

export default function LightLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LightLayout>{children}</LightLayout>;
}
