'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Minus } from 'lucide-react';
import { Order } from '@/lib/order-context';

interface StockImpactProps {
  order: Order;
}

interface StockImpact {
  productId: string;
  productName: string;
  size: string;
  quantityOrdered: number;
  currentStock: number;
  stockAfterOrder: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export default function StockImpactIndicator({ order }: StockImpactProps) {
  const [stockImpacts, setStockImpacts] = useState<StockImpact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStockImpact = async () => {
      try {
        setLoading(true);
        
        // Get current stock levels
        const response = await fetch('/api/stock');
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        
        const stockData = await response.json();
        
        // Calculate impact for each order item
        const impacts: StockImpact[] = [];
        
        for (const item of order.items) {
          const stockRecord = stockData.find(
            (stock: any) => stock.product_id === item.product.id && stock.size === item.product.selectedSize
          );
          
          if (stockRecord) {
            const stockAfterOrder = Math.max(0, stockRecord.quantity - item.quantity);
            const isLowStock = stockAfterOrder <= stockRecord.low_stock_threshold;
            const isOutOfStock = stockAfterOrder === 0;
            
            impacts.push({
              productId: item.product.id,
              productName: item.product.name,
              size: item.product.selectedSize || 'N/A',
              quantityOrdered: item.quantity,
              currentStock: stockRecord.quantity,
              stockAfterOrder,
              isLowStock,
              isOutOfStock
            });
          }
        }
        
        setStockImpacts(impacts);
      } catch (error) {
        console.error('Error calculating stock impact:', error);
      } finally {
        setLoading(false);
      }
    };

    if (order.status === 'Pending') {
      calculateStockImpact();
    } else {
      setLoading(false);
    }
  }, [order]);

  if (order.status !== 'Pending') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Stock Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Stock impact is only shown for pending orders.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Stock Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Loading stock impact...</p>
        </CardContent>
      </Card>
    );
  }

  const hasLowStock = stockImpacts.some(impact => impact.isLowStock);
  const hasOutOfStock = stockImpacts.some(impact => impact.isOutOfStock);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Stock Impact
          {(hasLowStock || hasOutOfStock) && (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stockImpacts.map((impact, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded">
            <div className="flex-1">
              <div className="text-sm font-medium">{impact.productName}</div>
              <div className="text-xs text-gray-600">Size: {impact.size}</div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{impact.currentStock}</span>
              <Minus className="h-3 w-3 text-gray-400" />
              <span className="font-medium">{impact.quantityOrdered}</span>
              <span className="text-gray-400">=</span>
              <span className={`font-medium ${
                impact.isOutOfStock ? 'text-red-600' : 
                impact.isLowStock ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {impact.stockAfterOrder}
              </span>
            </div>
            
            <div className="ml-2">
              {impact.isOutOfStock && (
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              )}
              {impact.isLowStock && !impact.isOutOfStock && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Low Stock</Badge>
              )}
              {!impact.isLowStock && !impact.isOutOfStock && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">In Stock</Badge>
              )}
            </div>
          </div>
        ))}
        
        {stockImpacts.length === 0 && (
          <p className="text-sm text-gray-600">No stock data available for this order.</p>
        )}
        
        {(hasLowStock || hasOutOfStock) && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Stock Warning</span>
            </div>
            <p className="text-yellow-700 mt-1">
              This order will result in low or out-of-stock items. Consider restocking soon.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
