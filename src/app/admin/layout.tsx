'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-xl font-bold text-gray-900">
              ScorpionX Admin Dashboard
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-lg font-semibold text-gray-900">
              {pathname === '/admin' ? 'Dashboard' :
               pathname.startsWith('/admin/orders/') ? 'Order Details' :
               pathname === '/admin/orders' ? 'Orders Management' :
               pathname === '/admin/stock' ? 'Stock Management' :
               'Admin Panel'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <Link href="/admin/orders">
                <Button
                  variant={pathname === '/admin/orders' ? 'default' : 'ghost'}
                  size="sm"
                >
                  Orders
                </Button>
              </Link>
              <Link href="/admin/stock">
                <Button
                  variant={pathname === '/admin/stock' ? 'default' : 'ghost'}
                  size="sm"
                >
                  Stock
                </Button>
              </Link>
            </div>

            {/* Back to store */}
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Store
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="p-6 max-w-full">
        {children}
      </main>
    </div>
  );
}
