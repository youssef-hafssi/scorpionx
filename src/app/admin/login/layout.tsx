'use client';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-hidden">
      {/* Clean login layout - completely isolated from admin layout */}
      {children}
    </div>
  );
}
