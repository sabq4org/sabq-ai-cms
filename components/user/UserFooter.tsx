import {
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import SabqLogo from '@/components/SabqLogo';

export default function UserFooter() {
  const footerSections = [
    {
      title: "أقسام سبق",
      links: [
        { label: "الأخبار", url: "/news" },
        { label: "رياضة", url: "/category/sports" },
        { label: "اقتصاد", url: "/category/economy" },
        { label: "تقنية", url: "/category/tech" },
        { label: "سيارات", url: "/category/cars" },
        { label: "مقترب", url: "/muqtarab" },
        { label: "عمق", url: "/deep-analysis" },
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
        { label: "فريق العمل", url: "/team" },
      ],
    },
    {
      title: "خدماتنا",
      links: [
        { label: "🔔 الإشعارات الذكية", url: "/notifications" },
        { label: "📱 تطبيق الجوال", url: "/mobile-app" },
        { label: "📧 النشرة البريدية", url: "/newsletter" },
        { label: "🎯 المحتوى المخصص", url: "/personalized" },
        { label: "📊 تحليلات متقدمة", url: "/analytics" },
        { label: "🗂️ الأرشيف", url: "/archive" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: <Facebook className="w-5 h-5" />,
      url: "https://facebook.com/sabqorg",
      name: "Facebook",
      color: "hover:bg-blue-600",
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      url: "https://twitter.com/sabqorg",
      name: "Twitter (X)",
      color: "hover:bg-black",
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      url: "https://instagram.com/sabqorg",
      name: "Instagram",
      color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600",
    },
    {
      icon: <Youtube className="w-5 h-5" />,
      url: "https://youtube.com/sabqorg",
      name: "Youtube",
      color: "hover:bg-red-600",
    },
  ];

  return (
    <footer style={{
      borderTop: '1px solid hsl(var(--line))',
      background: 'hsl(var(--bg-elevated))',
      marginTop: '60px'
    }}>
      {/* الفوتر الرئيسي */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '48px 24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '48px',
          marginBottom: '48px'
        }}>
          {/* عمود الشعار والوصف */}
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
              <SabqLogo 
                width={140}
                height={40}
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.8',
              color: 'hsl(var(--muted))',
              marginBottom: '24px'
            }}>
              صحيفة سبق الإلكترونية، رائدة الصحافة الرقمية في المملكة العربية السعودية.
              نقدم لكم الأخبار والتحليلات بمصداقية وموضوعية على مدار الساعة.
            </p>
            
            {/* وسائل التواصل الاجتماعي */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'hsl(var(--bg))',
                    border: '1px solid hsl(var(--line))',
                    color: 'hsl(var(--muted))',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'hsl(var(--accent))';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'hsl(var(--accent))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'hsl(var(--bg))';
                    e.currentTarget.style.color = 'hsl(var(--muted))';
                    e.currentTarget.style.borderColor = 'hsl(var(--line))';
                  }}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* أقسام الفوتر */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'hsl(var(--fg))',
                marginBottom: '20px'
              }}>
                {section.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {section.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: '12px' }}>
                    <Link
                      href={link.url}
                      style={{
                        fontSize: '14px',
                        color: 'hsl(var(--muted))',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'hsl(var(--accent))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'hsl(var(--muted))';
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* خط فاصل */}
        <div style={{
          borderTop: '1px solid hsl(var(--line))',
          paddingTop: '24px',
          marginTop: '24px'
        }}>
          {/* حقوق النشر والروابط القانونية */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px'
          }}>
            <p style={{
              fontSize: '13px',
              color: 'hsl(var(--muted))'
            }}>
              © {new Date().getFullYear()} صحيفة سبق الإلكترونية. جميع الحقوق محفوظة.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              <Link
                href="/privacy-policy"
                style={{
                  fontSize: '13px',
                  color: 'hsl(var(--muted))',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--accent))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--muted))';
                }}
              >
                سياسة الخصوصية
              </Link>
              <Link
                href="/terms-of-use"
                style={{
                  fontSize: '13px',
                  color: 'hsl(var(--muted))',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--accent))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--muted))';
                }}
              >
                شروط الاستخدام
              </Link>
              <Link
                href="/cookies"
                style={{
                  fontSize: '13px',
                  color: 'hsl(var(--muted))',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--accent))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--muted))';
                }}
              >
                سياسة الكوكيز
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
