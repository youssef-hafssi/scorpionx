'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-context';
import { calculatePrice } from '@/lib/pricing';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Calculate cart totals using dynamic pricing
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = calculatePrice(totalQuantity);
  const discount = promoApplied ? subtotal * 0.1 : 0; // 10% discount if promo applied
  const shipping = 0; // Fixed at 0DH to match checkout
  const tax = 0; // Remove tax to match checkout
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
    updateQuantity(id, newQuantity);
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
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
                        <p className="font-semibold">
                          {totalQuantity > 1 ?
                            `${(subtotal / totalQuantity * item.quantity).toFixed(0)} DH` :
                            `${220 * item.quantity} DH`
                          }
                        </p>
                      </div>

                      <p className="text-gray-500 text-sm mt-1">
                        {totalQuantity > 1 ?
                          `${(subtotal / totalQuantity).toFixed(0)} DH each (bulk pricing)` :
                          '220 DH each'
                        }
                      </p>
                      
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
                  <span>Subtotal ({totalQuantity} item{totalQuantity > 1 ? 's' : ''})</span>
                  <span>{subtotal} DH</span>
                </div>

                {totalQuantity > 1 && (
                  <div className="bg-green-50 p-2 rounded text-xs text-green-700">
                    💰 Bulk pricing applied! You&apos;re saving money with this quantity.
                  </div>
                )}

                {totalQuantity > 1 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Price per item</span>
                    <span>{(subtotal / totalQuantity).toFixed(0)} DH each</span>
                  </div>
                )}

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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}