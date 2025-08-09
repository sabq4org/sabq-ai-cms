"use client";

import { Facebook, Share2, Twitter } from "lucide-react";

export default function ShareSidebar() {
  const share = (platform: "twitter" | "facebook") => {
    const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
    const text = encodeURIComponent(typeof document !== "undefined" ? document.title : "");
    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
    } else {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    }
  };

  return (
    <div className="hidden lg:flex flex-col gap-3 sticky top-[calc(var(--header-height,64px)+24px)]">
      <button onClick={() => share("twitter")} className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
        <Twitter className="w-4 h-4" />
      </button>
      <button onClick={() => share("facebook")} className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
        <Facebook className="w-4 h-4" />
      </button>
      <div className="p-2 rounded-full bg-gray-100 text-gray-500">
        <Share2 className="w-4 h-4" />
      </div>
    </div>
  );
}


