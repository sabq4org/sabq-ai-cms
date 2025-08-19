import LightLayout from "@/components/layouts/LightLayout";
import "@/styles/light-layout.css";

export default function LightLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LightLayout>{children}</LightLayout>;
}
