"use client";

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      {children}
    </>
  );
}