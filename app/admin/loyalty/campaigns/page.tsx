/**
 * صفحة حملات برنامج الولاء في لوحة الإدارة
 */

import LoyaltyCampaignsPage from "@/app/dashboard/loyalty/campaigns/page";

export default function AdminLoyaltyCampaignsPage() {
  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
    <>
      <LoyaltyCampaignsPage />
    </>
  );
}

export const metadata = {
  title: "حملات برنامج الولاء - لوحة الإدارة",
  description: "إدارة حملات التسويق والعروض الترويجية",
};
