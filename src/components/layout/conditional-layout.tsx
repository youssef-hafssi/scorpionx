'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    // Admin pages don't need the main site header and footer
    return <>{children}</>;
  }

  // Regular pages get the full layout with header and footer
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Carousel Banner - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white py-2 overflow-hidden z-50">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-sm font-medium mx-8">By brothers, Moroccan street & Islamic wear.</span>
          <span className="text-sm font-medium mx-8">By brothers, Moroccan street & Islamic wear.</span>
          <span className="text-sm font-medium mx-8">By brothers, Moroccan street & Islamic wear.</span>
          <span className="text-sm font-medium mx-8">By brothers, Moroccan street & Islamic wear.</span>
          <span className="text-sm font-medium mx-8">By brothers, Moroccan street & Islamic wear.</span>
          <span className="text-sm font-medium mx-8">By brothers, Moroccan street & Islamic wear.</span>
          <span className="text-sm font-medium mx-8">By brothers, Moroccan street & Islamic wear.</span>
          <span className="text-sm font-medium mx-8">By brothers, Moroccan street & Islamic wear.</span>
        </div>
      </div>
      <Header />
      <main className="flex-1" style={{ paddingTop: '116px' }}>{children}</main>
      <Footer />
    </div>
  );
}
