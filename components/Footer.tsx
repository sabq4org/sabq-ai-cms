import {
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import SabqLogo from "./SabqLogo";

export default function Footer() {
  const { darkMode } = useDarkMode();
  const [currentThemeColor, setCurrentThemeColor] = useState<string | null>(null);

  // تتبع تغيير اللون من نظام الألوان المتغيرة
  useEffect(() => {
    const updateThemeColor = () => {
      const root = document.documentElement;
      const themeColor = root.style.getPropertyValue('--theme-primary');
      const accentColor = root.style.getPropertyValue('--accent');
      
      if (themeColor) {
        setCurrentThemeColor(themeColor);
      } else if (accentColor) {
        // تحويل HSL إلى hex إذا كان متوفراً
        const hslMatch = accentColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (hslMatch) {
          const [_, h, s, l] = hslMatch;
          setCurrentThemeColor(`hsl(${h}, ${s}%, ${l}%)`);
        }
      } else {
        setCurrentThemeColor(null);
      }
    };

    updateThemeColor();
    window.addEventListener('theme-color-change', updateThemeColor);
    return () => window.removeEventListener('theme-color-change', updateThemeColor);
  }, []);
  const footerSections = [
    {
      title: "عن سبق",
      links: [
        { label: "من نحن", url: "/about" },
        { label: "سياسة الخصوصية", url: "/privacy-policy" },
        { label: "شروط الاستخدام", url: "/terms-of-use" },
        { label: "اتصل بنا", url: "/contact" },
      ],
    },
    {
      title: "خدماتنا",
      links: [
        { label: "🔁 نظام الولاء", url: "/loyalty-program" },
        { label: "📻 النشرات الصوتية", url: "/audio-archive" },
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
    <footer 
      className="border-t"
      style={{
        backgroundColor: currentThemeColor 
          ? `${currentThemeColor}08` 
          : (darkMode ? 'rgb(17, 24, 39)' : 'rgb(249, 250, 251)'),
        borderColor: currentThemeColor 
          ? `${currentThemeColor}20` 
          : (darkMode ? 'rgb(31, 41, 55)' : 'rgb(229, 231, 235)')
      }}
    >
      {/* Desktop Footer */}
      <div className="hidden lg:block" style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 16px' }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* عمود الشعار والوصف - 3 أعمدة */}
          <div className="md:col-span-3 order-last md:order-none">
            <Link href="/" className="inline-flex items-center" aria-label="الصفحة الرئيسية">
              <SabqLogo 
                className="h-10 md:h-12 w-auto object-contain max-w-[160px] md:max-w-[200px] opacity-95 hover:opacity-100 transition-opacity"
                width={200}
                height={48}
              />
            </Link>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              صحيفة إلكترونية سعودية شاملة، نعمل على مدار الساعة لننقل لكم
              الحقيقة كما هي، ونغطي كافة الأحداث المحلية والعالمية بمصداقية
              واحترافية.
            </p>
            <div className="mt-3 flex items-center gap-3">
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
          
          {/* أعمدة الروابط - 4.5 أعمدة لكل قسم (توزيع أفضل بعد إزالة قسم) */}
          {footerSections.map((section) => (
            <div key={section.title} className="md:col-span-4 space-y-2">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {section.links.map((link) => (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
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
        <div 
          className="mt-8 border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400"
          style={{
            borderColor: currentThemeColor 
              ? `${currentThemeColor}20` 
              : (darkMode ? 'rgb(31, 41, 55)' : 'rgb(229, 231, 235)')
          }}
        >
          <p>&copy; {new Date().getFullYear()} صحيفة سبق. جميع الحقوق محفوظة.</p>
          <p>🤖 مدعوم بالذكاء… مصنوع بالحب في 🇸🇦</p>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="lg:hidden" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
        <div className="grid grid-cols-1 gap-4">
          {/* الشعار والعبارة أعلى الفوتر */}
          <div className="order-first text-center">
            <Link href="/" className="inline-flex justify-center" aria-label="الصفحة الرئيسية">
              <SabqLogo 
                className="h-10 w-auto object-contain max-w-[140px] opacity-95"
                width={140}
                height={40}
              />
            </Link>
            <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
              صحيفة إلكترونية سعودية شاملة
            </p>
          </div>

          {/* الأقسام بعد الشعار */}
          <div className="order-none">
            <div className="space-y-2">
              {footerSections.map((section) => (
                <details key={section.title} className="group">
                  <summary 
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                    style={{
                      backgroundColor: currentThemeColor 
                        ? `${currentThemeColor}10` 
                        : (darkMode ? 'rgb(31, 41, 55)' : 'rgb(243, 244, 246)')
                    }}
                  >
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
                        className="text-xs text-gray-600 dark:text-gray-400 py-1 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
          
          {/* التواصل الاجتماعي */}
          <div className="text-center">
            <div className="flex justify-center gap-3 mt-2">
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
          <div className="mb-3">
            <Link
              href="/loyalty-program"
              className="group block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-xl font-semibold border border-blue-500/40 hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-sm hover:shadow"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-white/90" />
                <span>اكتشف نظام الولاء الجديد</span>
                <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              </span>
            </Link>
          </div>

          {/* حقوق النشر */}
          <div 
            className="text-center pt-3 border-t"
            style={{
              borderColor: currentThemeColor 
                ? `${currentThemeColor}20` 
                : (darkMode ? 'rgb(31, 41, 55)' : 'rgb(229, 231, 235)')
            }}
          >
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

// Force rebuild - 2025-01-04 - Footer optimized
