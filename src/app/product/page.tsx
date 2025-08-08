'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { product } from '@/lib/product-data';


interface StockInfo {
  available: boolean;
  quantity: number;
}

export default function ProductPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [stockData, setStockData] = useState<Record<string, StockInfo>>({});
  const [stockLoading, setStockLoading] = useState(true);
  const [stockMessage, setStockMessage] = useState('In Stock. Ready to Ship.');

  // Fetch stock data
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch('/api/product-stock?productId=vintage-cargo-pants');
        if (response.ok) {
          const data = await response.json();
          setStockData(data.stockInfo);
          setStockMessage(data.message);
        }
      } catch (error) {
        console.error('Error fetching stock:', error);
      } finally {
        setStockLoading(false);
      }
    };

    fetchStock();
  }, []);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    // Check if selected size is available
    const sizeStock = stockData[selectedSize];
    if (!sizeStock || !sizeStock.available) {
      alert('Selected size is out of stock');
      return;
    }

    if (sizeStock.quantity < quantity) {
      alert(`Only ${sizeStock.quantity} items available in size ${selectedSize}`);
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem({ ...product, selectedSize });
    }
    router.push('/checkout');
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    const sizeStock = selectedSize ? stockData[selectedSize] : null;
    const maxQuantity = sizeStock ? sizeStock.quantity : 99;

    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex text-sm">
          <li className="flex items-center">
            <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
            <svg
              className="mx-2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
          <li className="text-gray-700">Product</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Product Image */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <button className="border-2 border-primary rounded-md overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover p-2"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          
          <div className="mt-3 flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">(128 reviews)</span>
          </div>
          
          <div className="mt-4 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{product.price} DH</span>
              {product.originalPrice && (
                <span className="text-base text-gray-500 line-through">{product.originalPrice} DH</span>
              )}
            </div>
          </div>
          
          <div className="mt-6 space-y-6">
            <p className="text-gray-600">
              {product.description}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Size</label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    const sizeStock = stockData[size];
                    const isUnavailable = !stockLoading && (!sizeStock || !sizeStock.available);

                    return (
                      <button
                        key={size}
                        onClick={() => !isUnavailable && setSelectedSize(size)}
                        disabled={isUnavailable}
                        className={`
                          min-w-[50px] h-[50px] text-sm font-medium border-2 transition-all relative
                          ${isSelected
                            ? 'bg-black text-white border-black'
                            : isUnavailable
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
                          }
                        `}
                        title={
                          isUnavailable
                            ? 'Out of stock'
                            : 'Available'
                        }
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Stock Status */}
                <div className="flex items-center mt-3">
                  {stockLoading ? (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm text-gray-500 font-medium">Checking availability...</span>
                    </>
                  ) : (
                    <>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        stockMessage.includes('out of stock')
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        stockMessage.includes('out of stock')
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {stockMessage}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center border-2 rounded-md">
                  <button
                    onClick={decreaseQuantity}
                    className="px-2 py-1 border-r-2 hover:bg-gray-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 font-medium text-sm">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="px-2 py-1 border-l-2 hover:bg-gray-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full px-6 py-2 text-sm font-medium"
              >
                Add to Cart & Checkout
              </Button>
            </div>
            
            <div className="border-t border-b py-3 mt-4">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Free shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}