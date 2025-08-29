"use client";

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '16px',
      width: '100%'
    }}>
      {children}
    </div>
  );
}