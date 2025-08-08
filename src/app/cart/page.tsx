'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { items, updateItemQuantity, removeItem, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  
  // Calculate cart totals
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const discount = promoApplied ? subtotal * 0.1 : 0; // 10% discount if promo applied
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = (subtotal - discount) * 0.07; // 7% tax
  const total = subtotal - discount + shipping + tax;
  
  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === 'discount10') {
      setPromoApplied(true);
    } else {
      alert('Invalid promo code');
    }
  };
  
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItemQuantity(id, newQuantity);
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/product">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex flex-col sm:flex-row border-b pb-6">
                    <div className="w-full sm:w-24 h-24 relative mb-4 sm:mb-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="flex-1 sm:ml-6">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <p className="font-semibold">{(item.product.price * item.quantity)} DH</p>
                      </div>

                      <p className="text-gray-500 text-sm mt-1">{item.product.price} DH each</p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="px-3 py-1 border-r"
                          >
                            -
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="px-3 py-1 border-l"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
                
                <Link href="/product">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal} DH</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span>-{discount.toFixed(2)} DH</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `${shipping.toFixed(2)} DH`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (7%)</span>
                  <span>{tax.toFixed(2)} DH</span>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{total.toFixed(2)} DH</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Promo code" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handlePromoCode}
                    >
                      Apply
                    </Button>
                  </div>
                  {promoApplied && (
                    <p className="text-green-600 text-sm mt-2">Promo code applied!</p>
                  )}
                </div>
                
                <Link href="/checkout">
                  <Button className="w-full mt-6" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>Secure checkout powered by Stripe</p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <svg className="h-6 w-10" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="32" height="20" rx="2" fill="#E6E6E6"/>
                      <path d="M21 10C21 7.2 18.8 5 16 5C13.2 5 11 7.2 11 10C11 12.8 13.2 15 16 15C18.8 15 21 12.8 21 10Z" fill="#EB001B"/>
                      <path d="M21 10C21 12.8 18.8 15 16 15C13.2 15 11 12.8 11 10C11 7.2 13.2 5 16 5C18.8 5 21 7.2 21 10Z" fill="#F79E1B"/>
                    </svg>
                    <svg className="h-6 w-10" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="32" height="20" rx="2" fill="#E6E6E6"/>
                      <path d="M12 7H20V13H12V7Z" fill="#1434CB"/>
                    </svg>
                    <svg className="h-6 w-10" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="32" height="20" rx="2" fill="#E6E6E6"/>
                      <path d="M19.5 10C19.5 12.5 17.5 14.5 15 14.5C12.5 14.5 10.5 12.5 10.5 10C10.5 7.5 12.5 5.5 15 5.5C17.5 5.5 19.5 7.5 19.5 10Z" fill="#FFB600"/>
                      <path d="M21.5 10C21.5 12.5 19.5 14.5 17 14.5C14.5 14.5 12.5 12.5 12.5 10C12.5 7.5 14.5 5.5 17 5.5C19.5 5.5 21.5 7.5 21.5 10Z" fill="#F7981D"/>
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}