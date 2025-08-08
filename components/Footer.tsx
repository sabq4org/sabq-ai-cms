import {
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import SabqLogo from "./SabqLogo";

export default function Footer() {
  const footerSections = [
    {
      title: "أقسام سبق",
      links: [
        { label: "الأخبار", url: "/news" },
        { label: "رياضة", url: "/category/sports" },
        { label: "اقتصاد", url: "/category/economy" },
        { label: "تقنية", url: "/category/tech" },
        { label: "سيارات", url: "/category/cars" },
      ],
    },
    {
      title: "عن سبق",
      links: [
        { label: "من نحن", url: "/about" },
        { label: "سياسة الخصوصية", url: "/privacy-policy" },
        { label: "شروط الاستخدام", url: "/terms-of-use" },
        { label: "دليل المستخدم", url: "/user-guide" },
        { label: "اتصل بنا", url: "/contact" },
      ],
    },
    {
      title: "خدماتنا",
      links: [
        { label: "🔁 نظام الولاء", url: "/loyalty-program" },
        { label: "📻 النشرات الصوتية", url: "/audio-archive" },
        { label: "إعلانات تجارية", url: "/ads" },
        { label: "الاشتراكات", url: "/subscriptions" },
        { label: "النشرة البريدية", url: "/newsletter" },
        { label: "الأرشيف", url: "/archive" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: <Facebook className="w-5 h-5" />,
      url: "https://facebook.com/sabqorg",
      name: "Facebook",
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      url: "https://twitter.com/sabqorg",
      name: "Twitter",
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      url: "https://instagram.com/sabqorg",
      name: "Instagram",
    },
    {
      icon: <Youtube className="w-5 h-5" />,
      url: "https://youtube.com/sabqorg",
      name: "Youtube",
    },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Desktop Footer */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo and description */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="mb-3">
              <SabqLogo width={112} height={36} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              صحيفة إلكترونية سعودية شاملة، نعمل على مدار الساعة لننقل لكم
              الحقيقة كما هي، ونغطي كافة الأحداث المحلية والعالمية بمصداقية
              واحترافية.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} صحيفة سبق. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-bold">
              🤖 مدعوم بالذكاء… مصنوع بالحب في 🇸🇦
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Footer - Accordion Style */}
      <div className="lg:hidden px-4 py-6">
        {/* الشعار والوصف */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center justify-center mb-2">
            <SabqLogo width={96} height={32} />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              صحيفة إلكترونية سعودية شاملة
            </p>
          </div>
        </div>

        {/* الأقسام بتصميم Accordion */}
        <div className="space-y-2 mb-6">
          {footerSections.map((section) => (
            <details key={section.title} className="group">
              <summary className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {section.title}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-2 grid grid-cols-2 gap-2 px-3">
                {section.links.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </div>

        {/* التواصل الاجتماعي */}
        <div className="flex justify-center gap-3 mb-6">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
            >
              {React.cloneElement(social.icon, { className: "w-4 h-4" })}
            </a>
          ))}
        </div>

        {/* رابط نظام الولاء للموبايل */}
        <div className="mb-4 px-3">
          <Link
            href="/loyalty-program"
            className="block w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            🔁 اكتشف نظام الولاء الجديد
          </Link>
        </div>

        {/* حقوق النشر */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            © {new Date().getFullYear()} صحيفة سبق. جميع الحقوق محفوظة
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-bold">
              🤖 مدعوم بالذكاء… مصنوع بالحب في 🇸🇦
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Force rebuild - 2025-01-04
