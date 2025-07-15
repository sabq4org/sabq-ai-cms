export default function MomentByMomentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  );
} 