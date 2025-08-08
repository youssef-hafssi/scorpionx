'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Plus, Minus, Save, RefreshCw, LogOut } from 'lucide-react';

interface ProductStock {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  low_stock_threshold: number;
  product_name: string;
  product_image: string;
}

export default function StockManagementPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [stockData, setStockData] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<'all' | 'out-of-stock' | 'low-stock' | 'in-stock'>('all');

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stock');

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();
      setStockData(data);
      setChanges({}); // Clear changes when fetching fresh data
    } catch (error) {
      console.error('Error fetching stock data:', error);
      alert('Failed to load stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  // Fetch data on mount
  useEffect(() => {
    if (user && !authLoading) {
      fetchStockData();
    }
  }, [user, authLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  // Handle quantity change
  const handleQuantityChange = (stockId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setChanges(prev => ({
      ...prev,
      [stockId]: newQuantity
    }));

    setStockData(prev => prev.map(item => 
      item.id === stockId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Save changes to database
  const saveChanges = async () => {
    if (Object.keys(changes).length === 0) return;

    try {
      setSaving(true);

      const updates = Object.entries(changes).map(([stockId, quantity]) => ({
        id: stockId,
        quantity: quantity
      }));

      const response = await fetch('/api/stock', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      setChanges({});
      alert('Stock levels updated successfully!');

      // Refresh data to show updated values
      await fetchStockData();
    } catch (error) {
      console.error('Error saving stock changes:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  // Get stock status with colors
  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { status: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= threshold) return { status: 'Low Stock', variant: 'secondary' as const };
    return { status: 'In Stock', variant: 'default' as const };
  };

  // Filter stock data based on selected filter
  const filteredStockData = stockData.filter(item => {
    const currentQuantity = changes[item.id] !== undefined ? changes[item.id] : item.quantity;
    switch (filter) {
      case 'out-of-stock':
        return currentQuantity === 0;
      case 'low-stock':
        return currentQuantity > 0 && currentQuantity <= item.low_stock_threshold;
      case 'in-stock':
        return currentQuantity > item.low_stock_threshold;
      default:
        return true;
    }
  });

  // Count items by status
  const stockCounts = stockData.reduce(
    (counts, item) => {
      const currentQuantity = changes[item.id] !== undefined ? changes[item.id] : item.quantity;
      if (currentQuantity === 0) {
        counts.outOfStock++;
      } else if (currentQuantity <= item.low_stock_threshold) {
        counts.lowStock++;
      } else {
        counts.inStock++;
      }
      counts.total++;
      return counts;
    },
    { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 }
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading stock data...</span>
        </div>
      </div>
    );
  }

  const hasChanges = Object.keys(changes).length > 0;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Manage product inventory and stock levels</p>
        </div>        <div className="flex gap-2">
          <Button
            onClick={fetchStockData}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasChanges && (
            <Button
              onClick={saveChanges}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
              Save Changes ({Object.keys(changes).length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stock Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockData.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockData.filter(item => item.quantity <= item.low_stock_threshold && item.quantity > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockData.filter(item => item.quantity === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Stock Levels</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No stock data found. Please check your database setup.
                    </td>
                  </tr>
                ) : (
                  stockData.map((item) => {
                    const stockStatus = getStockStatus(item.quantity, item.low_stock_threshold);
                    const hasChange = changes.hasOwnProperty(item.id);
                    
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50 ${hasChange ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded object-contain"
                              src={item.product_image}
                              alt={item.product_name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/product-image.svg';
                              }}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                                {item.product_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{item.size}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                              className="w-20 text-center"
                              min="0"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {hasChange && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              Modified
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
