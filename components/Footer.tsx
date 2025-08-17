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
        { label: "📱 النسخة الخفيفة", url: "/lite" },
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
    <footer className="border-t bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      {/* Desktop Footer */}
      <div className="hidden lg:block container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* عمود الشعار والوصف - 3 أعمدة */}
          <div className="md:col-span-3 order-last md:order-none">
            <Link href="/" className="inline-flex items-center" aria-label="الصفحة الرئيسية">
              <SabqLogo 
                className="h-10 md:h-12 w-auto object-contain max-w-[160px] md:max-w-[200px] opacity-95 hover:opacity-100 transition-opacity"
                width={200}
                height={48}
              />
            </Link>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
              صحيفة إلكترونية سعودية شاملة، نعمل على مدار الساعة لننقل لكم
              الحقيقة كما هي، ونغطي كافة الأحداث المحلية والعالمية بمصداقية
              واحترافية.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* أعمدة الروابط - 3 أعمدة لكل قسم */}
          {footerSections.map((section) => (
            <div key={section.title} className="md:col-span-3 space-y-3">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {section.links.map((link) => (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* حقوق النشر */}
        <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} صحيفة سبق. جميع الحقوق محفوظة.</p>
          <p>🤖 مدعوم بالذكاء… مصنوع بالحب في 🇸🇦</p>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="lg:hidden container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* الأقسام أولاً */}
          <div className="order-first">
            <div className="space-y-2">
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
          </div>
          
          {/* الشعار والوصف أخيراً */}
          <div className="order-last text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href="/" className="inline-flex justify-center" aria-label="الصفحة الرئيسية">
              <SabqLogo 
                className="h-10 w-auto object-contain max-w-[140px] opacity-95"
                width={140}
                height={40}
              />
            </Link>
            <p className="mt-3 text-xs leading-5 text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
              صحيفة إلكترونية سعودية شاملة
            </p>
            
            {/* التواصل الاجتماعي */}
            <div className="flex justify-center gap-3 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  aria-label={social.name}
                >
                  {React.cloneElement(social.icon, { className: "w-4 h-4" })}
                </a>
              ))}
            </div>
          </div>

          
          {/* رابط نظام الولاء للموبايل */}
          <div className="mb-4">
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🤖 مدعوم بالذكاء… مصنوع بالحب في 🇸🇦
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Force rebuild - 2025-01-04
