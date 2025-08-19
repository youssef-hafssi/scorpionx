'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/lib/cart-context';

export function Header() {
  const { items } = useCart();
  const itemCount = items.length;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed left-0 right-0 z-40 bg-white shadow-sm" style={{ top: '36px' }}>
      <div>
        <div className="flex h-20 items-center">
          <div className="block md:hidden pl-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="sr-only">Toggle Menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer w-full">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/product" className="cursor-pointer w-full">Product</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1 flex justify-start pl-4 md:pl-8">
            <nav className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-gray-500 transition hover:text-gray-500/75"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product"
                    className="text-gray-500 transition hover:text-gray-500/75"
                  >
                    Product
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex-1 flex justify-center">
            <Link href="/" className="text-2xl font-bold tracking-tight flex items-center group">
              <div className="relative h-20 w-20 overflow-hidden logo-container">
                {/* Main logo */}
                <img
                  src="/logo.png"
                  alt="Logo"
                  className={`absolute top-0 left-0 h-20 object-contain brightness-0 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
                    scrolled
                      ? 'opacity-0 scale-75 rotate-12 translate-y-2 blur-sm'
                      : 'opacity-100 scale-100 rotate-0 translate-y-0 blur-0 logo-float'
                  } group-hover:scale-105 group-hover:rotate-1`}
                  style={{
                    transformOrigin: 'center center',
                    filter: scrolled ? 'brightness(0) blur(2px) drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' : 'brightness(0) blur(0px) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    width: 'auto',
                    height: '80px'
                  }}
                />

                {/* Single logo */}
                <img
                  src="/singlelogo.png"
                  alt="Logo"
                  className={`absolute top-0 left-0 h-20 object-contain brightness-0 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
                    scrolled
                      ? 'opacity-100 scale-100 rotate-0 translate-y-0 blur-0 logo-float'
                      : 'opacity-0 scale-125 rotate-[-12deg] translate-y-[-8px] blur-sm'
                  } group-hover:scale-105 group-hover:rotate-[-1deg]`}
                  style={{
                    transformOrigin: 'center center',
                    filter: scrolled ? 'brightness(0) blur(0px) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 'brightness(0) blur(2px) drop-shadow(0 0 8px rgba(239, 68, 68, 0.3))',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    width: 'auto',
                    height: '80px'
                  }}
                />

                {/* Sparkle effects */}
                <div className={`absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full transition-all duration-500 ${
                  scrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`} style={{ animationDelay: '0.2s' }} />
                <div className={`absolute bottom-2 left-2 w-1.5 h-1.5 bg-blue-400 rounded-full transition-all duration-500 ${
                  scrolled ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`} style={{ animationDelay: '0.1s' }} />
              </div>
            </Link>
          </div>

          <div className="flex-1 flex justify-end items-center gap-4 pr-4 md:pr-8">
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {itemCount > 0 ? (
                    <>
                      <div className="p-2">
                        <p className="text-sm font-medium">{itemCount} item(s) in cart</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/cart" className="cursor-pointer w-full">
                          View Cart
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/checkout" className="cursor-pointer w-full">
                          Checkout
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="p-2">
                      <p className="text-sm text-center">Your cart is empty</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>


          </div>
        </div>
      </div>
    </header>
  );
}