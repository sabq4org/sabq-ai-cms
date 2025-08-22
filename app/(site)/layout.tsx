import ResponsiveLayout from "@/components/responsive/ResponsiveLayout";
import Footer from "@/components/Footer";
import FooterGate from "@/components/layout/FooterGate";
import { Providers } from "../providers";

// CSS خاص بالموقع فقط
import "../globals.css";
import "../../styles/news-card-desktop.css";
import "../../styles/theme-manager.css";
import "../../styles/muqtarab-cards.css";
import "../../styles/responsive-ui.css";
import "../old-style-demo/old-style.css";
import "../../styles/compact-stats.css";
import "../../styles/enhanced-mobile-stats.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <meta name="theme-color" content="#f8f8f7" />
        <meta name="msapplication-TileColor" content="#f8f8f7" />
        <link rel="stylesheet" href="/manus-ui.css" />
        <style>{`
          /* خلفية موحدة للموقع */
          html, body {
            background-color: #f8f8f7 !important;
            background-image: none !important;
            min-height: 100vh !important;
          }
          
          /* الوضع الداكن */
          html.dark, body.dark, .dark html, .dark body {
            background-color: #111827 !important;
          }
          
          /* شفافية المكونات الرئيسية */
          .homepage-wrapper,
          .page-wrapper,
          main,
          #__next,
          [data-device="mobile"],
          [data-device="desktop"] {
            background: transparent !important;
            background-color: transparent !important;
          }
        `}</style>
        <script dangerouslySetInnerHTML={{ __html: `
          // تطبيق فوري للخلفية
          document.documentElement.style.backgroundColor = '#f8f8f7';
          document.documentElement.style.backgroundImage = 'none';
          document.body.style.backgroundColor = '#f8f8f7';
          document.body.style.backgroundImage = 'none';
          
          // عند تحميل الصفحة
          window.addEventListener('DOMContentLoaded', function() {
            document.documentElement.style.setProperty('background-color', '#f8f8f7', 'important');
            document.body.style.setProperty('background-color', '#f8f8f7', 'important');
          });
        ` }} />
      </head>
      <div style={{ backgroundColor: '#f8f8f7', minHeight: '100vh' }}>
        <Providers>
          <ResponsiveLayout>
            <main className="flex-1">
              {children}
            </main>
            <FooterGate>
              <Footer />
            </FooterGate>
          </ResponsiveLayout>
        </Providers>
      </div>
    </>
  );
}
