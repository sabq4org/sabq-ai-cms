"use client";

import SimpleHeader from "./SimpleHeader";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function NotFoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#f8f8f7', minHeight: '100vh' }}>
      <SimpleHeader />
      <main style={{
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '16px 24px',
        minHeight: 'calc(100vh - 200px)',
        paddingTop: '16px'
      }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
