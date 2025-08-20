'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOrders } from '@/lib/order-context';
import type { Order } from '@/lib/order-context';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      const foundOrder = getOrder(orderId);
      setOrder(foundOrder || null);
    }
    setLoading(false);
  }, [searchParams, getOrder]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn&apos;t find your order. Please check your order number.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase.</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-semibold">{order.orderDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>

          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">Product</span>
                    <span className="font-medium">Total</span>
                  </div>
                </div>
                <div className="p-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.product.selectedSize && `Size: ${item.product.selectedSize} • `}
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p>{(item.product.price * item.quantity)} DH</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex justify-between py-1">
                    <span>Subtotal</span>
                    <span>{order.subtotal} DH</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Shipping</span>
                    <span>{order.shipping === 0 ? 'Free' : `${order.shipping} DH`}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Tax</span>
                    <span>0 DH</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold">
                    <span>Total</span>
                    <span>{order.total} DH</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{order.customerInfo.fullName}</p>
                <p className="mt-1">{order.customerInfo.deliveryAddress}</p>
                <p className="mt-2 text-sm text-gray-600">Phone: {order.customerInfo.phoneNumber}</p>
                {order.customerInfo.email && (
                  <p className="text-sm text-gray-600">Email: {order.customerInfo.email}</p>
                )}
              </div>
            </div>
            
            <div className="border-t pt-6 flex flex-col sm:flex-row justify-between gap-4">
              <Link href="/product">
                <Button variant="outline" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
              
              <Link href="/">
                <Button className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}