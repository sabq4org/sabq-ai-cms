"use client";

import { generateSharingLinks } from "@/lib/social-sharing-config";
import {
  Check,
  Copy,
  Facebook,
  Linkedin,
  MessageCircle,
  Send,
} from "lucide-react";
import { useState } from "react";

interface SocialSharingButtonsProps {
  article: {
    id: string;
    title: string;
  };
  className?: string;
}

export default function SocialSharingButtons({
  article,
  className = "",
}: SocialSharingButtonsProps) {
  const [copied, setCopied] = useState(false);
  const sharingLinks = generateSharingLinks(article);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("فشل في نسخ الرابط:", error);
    }
  };

  const openSharingWindow = (url: string, platform: string) => {
    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1`
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2">
        مشاركة:
      </span>

      {/* WhatsApp */}
      <button
        onClick={() => openSharingWindow(sharingLinks.whatsapp, "whatsapp")}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-110 shadow-md"
        title="مشاركة على واتساب"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Telegram */}
      <button
        onClick={() => openSharingWindow(sharingLinks.telegram, "telegram")}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all hover:scale-110 shadow-md"
        title="مشاركة على تيليجرام"
      >
        <Send className="w-5 h-5" />
      </button>

      {/* Twitter/X */}
      <button
        onClick={() => openSharingWindow(sharingLinks.twitter, "twitter")}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white transition-all hover:scale-110 shadow-md"
        title="مشاركة على تويتر"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Facebook */}
      <button
        onClick={() => openSharingWindow(sharingLinks.facebook, "facebook")}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all hover:scale-110 shadow-md"
        title="مشاركة على فيسبوك"
      >
        <Facebook className="w-5 h-5" />
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => openSharingWindow(sharingLinks.linkedin, "linkedin")}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-all hover:scale-110 shadow-md"
        title="مشاركة على لينكد إن"
      >
        <Linkedin className="w-5 h-5" />
      </button>

      {/* نسخ الرابط */}
      <button
        onClick={handleCopyLink}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 shadow-md ${
          copied
            ? "bg-green-500 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
        }`}
        title={copied ? "تم النسخ!" : "نسخ الرابط"}
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
      </button>
    </div>
  );
}
