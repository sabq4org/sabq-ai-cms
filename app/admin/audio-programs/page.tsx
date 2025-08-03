/**
 * صفحة البرامج الصوتية في لوحة الإدارة
 */

import AudioProgramsPage from "@/app/dashboard/audio-programs/page";

export default function AdminAudioProgramsPage() {
  return (
    <>
      <AudioProgramsPage />
    </>
  );
}

export const metadata = {
  title: "البرامج الصوتية - لوحة الإدارة",
  description: "إدارة البرامج والملفات الصوتية",
};
