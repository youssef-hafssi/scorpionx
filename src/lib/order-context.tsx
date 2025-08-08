'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from './cart-context';
import { supabase } from './supabase';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Canceled';

export type CustomerInfo = {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  email: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  orderDate: Date;
  updatedAt: Date;
  notes?: string;
};

// Database order type (matches Supabase schema)
export type DbOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  selected_size: string | null;
  quantity: number;
  created_at: string;
};

type OrderContextType = {
  orders: Order[];
  loading: boolean;
  addOrder: (customerInfo: CustomerInfo, items: CartItem[], totals: { subtotal: number; shipping: number; total: number }) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  getOrder: (orderId: string) => Order | undefined;
  getNewOrdersCount: () => number;
  markOrdersAsViewed: () => void;
  searchOrders: (query: string) => Order[];
  filterOrdersByStatus: (status: OrderStatus | 'All') => Order[];
  filterOrdersByDateRange: (startDate: Date, endDate: Date) => Order[];
  refreshOrders: () => Promise<void>;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Helper function to convert database order to app order format
const convertDbOrderToOrder = (dbOrder: DbOrder, dbOrderItems: DbOrderItem[]): Order => {
  const items: CartItem[] = dbOrderItems.map(item => ({
    product: {
      id: item.product_id,
      name: item.product_name,
      price: item.product_price,
      image: item.product_image,
      description: '',
      sizes: [],
      selectedSize: item.selected_size || undefined,
    },
    quantity: item.quantity,
  }));

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customerInfo: {
      fullName: dbOrder.customer_name,
      phoneNumber: dbOrder.customer_phone,
      email: dbOrder.customer_email || '',
      deliveryAddress: dbOrder.delivery_address,
    },
    items,
    subtotal: dbOrder.subtotal,
    shipping: dbOrder.shipping,
    total: dbOrder.total,
    status: dbOrder.status,
    orderDate: new Date(dbOrder.created_at),
    updatedAt: new Date(dbOrder.updated_at),
    notes: dbOrder.notes || undefined,
  };
};

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedOrdersCount, setViewedOrdersCount] = useState(0);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Fetch orders with their items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return;
      }

      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*');

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        return;
      }

      // Convert database format to app format
      const convertedOrders = ordersData.map(dbOrder => {
        const orderItems = orderItemsData.filter(item => item.order_id === dbOrder.id);
        return convertDbOrderToOrder(dbOrder, orderItems);
      });

      setOrders(convertedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load orders on initial render
  useEffect(() => {
    fetchOrders();

    // Load viewed count from localStorage
    const savedViewedCount = localStorage.getItem('viewedOrdersCount');
    if (savedViewedCount) {
      setViewedOrdersCount(parseInt(savedViewedCount));
    }
  }, []);

  // Save viewed count to localStorage
  useEffect(() => {
    localStorage.setItem('viewedOrdersCount', viewedOrdersCount.toString());
  }, [viewedOrdersCount]);

  // Helper function to check stock availability before order placement
  const checkStockAvailability = async (items: CartItem[]): Promise<{ available: boolean; details: any[] }> => {
    try {
      const stockCheckItems = items.map(item => ({
        product_id: item.product.id,
        selected_size: item.product.selectedSize,
        quantity: item.quantity
      }));

      const response = await fetch('/api/stock/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: stockCheckItems }),
      });

      if (!response.ok) {
        throw new Error('Failed to check stock availability');
      }

      const result = await response.json();
      return {
        available: result.allItemsAvailable,
        details: result.items
      };
    } catch (error) {
      console.error('Error checking stock availability:', error);
      // If stock check fails, we'll proceed with the order (fail-safe)
      return { available: true, details: [] };
    }
  };

  // Helper function to update stock quantities after order placement
  const updateStockAfterOrder = async (items: CartItem[]): Promise<void> => {
    try {
      // First, get current stock levels
      const { data: currentStock, error: fetchError } = await supabase
        .from('product_stock')
        .select('id, product_id, size, quantity')
        .in('product_id', items.map(item => item.product.id));

      if (fetchError) {
        console.error('Error fetching current stock:', fetchError);
        throw new Error('Failed to fetch current stock levels');
      }

      // Calculate stock updates
      const stockUpdates: { id: string; newQuantity: number }[] = [];
      
      for (const item of items) {
        const stockRecord = currentStock.find(
          stock => stock.product_id === item.product.id && stock.size === item.product.selectedSize
        );
        
        if (stockRecord) {
          const newQuantity = Math.max(0, stockRecord.quantity - item.quantity);
          stockUpdates.push({
            id: stockRecord.id,
            newQuantity
          });
        } else {
          console.warn(`Stock record not found for product ${item.product.id} size ${item.product.selectedSize}`);
        }
      }

      // Update stock quantities
      if (stockUpdates.length > 0) {
        for (const update of stockUpdates) {
          const { error: updateError } = await supabase
            .from('product_stock')
            .update({ quantity: update.newQuantity })
            .eq('id', update.id);

          if (updateError) {
            console.error('Error updating stock:', updateError);
            throw new Error(`Failed to update stock for item ${update.id}`);
          }
        }
        
        console.log('Stock successfully updated for order items:', stockUpdates);
      }
    } catch (error) {
      console.error('Error in updateStockAfterOrder:', error);
      throw error;
    }
  };

  // Helper function to restore stock when an order is cancelled
  const restoreStockAfterCancellation = async (orderId: string): Promise<void> => {
    try {
      // Get the order items from the cancelled order
      const { data: orderItems, error: fetchError } = await supabase
        .from('order_items')
        .select('product_id, selected_size, quantity')
        .eq('order_id', orderId);

      if (fetchError) {
        console.error('Error fetching order items for stock restoration:', fetchError);
        throw new Error('Failed to fetch order items');
      }

      if (!orderItems || orderItems.length === 0) {
        console.log('No items found for order', orderId);
        return;
      }

      // Get current stock levels
      const productIds = orderItems.map(item => item.product_id);
      const { data: currentStock, error: stockFetchError } = await supabase
        .from('product_stock')
        .select('id, product_id, size, quantity')
        .in('product_id', productIds);

      if (stockFetchError) {
        console.error('Error fetching current stock for restoration:', stockFetchError);
        throw new Error('Failed to fetch current stock levels');
      }

      // Calculate stock restorations
      const stockRestorations: { id: string; newQuantity: number }[] = [];
      
      for (const item of orderItems) {
        const stockRecord = currentStock.find(
          stock => stock.product_id === item.product_id && stock.size === item.selected_size
        );
        
        if (stockRecord) {
          const newQuantity = stockRecord.quantity + item.quantity;
          stockRestorations.push({
            id: stockRecord.id,
            newQuantity
          });
        }
      }

      // Restore stock quantities
      if (stockRestorations.length > 0) {
        for (const restoration of stockRestorations) {
          const { error: updateError } = await supabase
            .from('product_stock')
            .update({ quantity: restoration.newQuantity })
            .eq('id', restoration.id);

          if (updateError) {
            console.error('Error restoring stock:', updateError);
            throw new Error(`Failed to restore stock for item ${restoration.id}`);
          }
        }
        
        console.log('Stock successfully restored for cancelled order:', orderId, stockRestorations);
      }
    } catch (error) {
      console.error('Error in restoreStockAfterCancellation:', error);
      throw error;
    }
  };

  const addOrder = async (customerInfo: CustomerInfo, items: CartItem[], totals: { subtotal: number; shipping: number; total: number }): Promise<string> => {
    try {
      // First, check stock availability
      const stockCheck = await checkStockAvailability(items);
      if (!stockCheck.available) {
        const unavailableItems = stockCheck.details.filter(item => !item.isAvailable);
        const errorMessage = `Insufficient stock for: ${unavailableItems.map(item => 
          `${item.productId} (${item.size}): requested ${item.requested}, available ${item.available}`
        ).join(', ')}`;
        throw new Error(errorMessage);
      }

      // Generate order number based on existing orders count
      const orderNumber = `ORD-${String(orders.length + 1).padStart(6, '0')}`;

      // Insert order into database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: customerInfo.fullName,
          customer_phone: customerInfo.phoneNumber,
          customer_email: customerInfo.email || null,
          delivery_address: customerInfo.deliveryAddress,
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          total: totals.total,
          status: 'Pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('Failed to create order');
      }

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        product_price: item.product.price,
        selected_size: item.product.selectedSize || null,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw new Error('Failed to create order items');
      }

      // Update stock quantities after successful order creation
      try {
        await updateStockAfterOrder(items);
        console.log('Stock quantities updated successfully for order:', orderData.order_number);
      } catch (stockError) {
        console.error('Error updating stock after order creation:', stockError);
        // Note: We don't throw here to prevent order creation failure
        // The order is still valid even if stock update fails
        // This could be handled by an admin notification or retry mechanism
      }

      // Create order object for Telegram notification
      const newOrder: Order = {
        id: orderData.id,
        orderNumber: orderData.order_number,
        customerInfo,
        items,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        status: 'Pending',
        orderDate: new Date(orderData.created_at),
        updatedAt: new Date(orderData.updated_at),
      };

      // Send Telegram notification for new order
      try {
        await fetch('/api/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'new_order',
            order: newOrder,
          }),
        });
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
        // Don't throw error here - order creation should succeed even if notification fails
      }

      // Refresh orders to get the latest data
      await fetchOrders();

      return orderData.id;
    } catch (error) {
      console.error('Error in addOrder:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string): Promise<void> => {
    try {
      // Get the current order to track the old status
      const currentOrder = orders.find(order => order.id === orderId);
      const oldStatus = currentOrder?.status;

      const { error } = await supabase
        .from('orders')
        .update({
          status,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        throw new Error('Failed to update order status');
      }

      // Update local state
      const updatedOrders = orders.map(order =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date(), notes }
          : order
      );
      setOrders(updatedOrders);

      // Handle stock restoration for cancelled orders
      if (status === 'Canceled' && oldStatus !== 'Canceled') {
        try {
          await restoreStockAfterCancellation(orderId);
          console.log('Stock successfully restored for cancelled order:', orderId);
        } catch (stockError) {
          console.error('Error restoring stock after order cancellation:', stockError);
          // Note: We don't throw here to prevent status update failure
          // The status update should succeed even if stock restoration fails
        }
      }

      // Send Telegram notification for status update (only if status actually changed)
      if (oldStatus && oldStatus !== status) {
        const updatedOrder = updatedOrders.find(order => order.id === orderId);
        if (updatedOrder) {
          try {
            await fetch('/api/telegram', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'status_update',
                order: updatedOrder,
                oldStatus: oldStatus,
              }),
            });
          } catch (telegramError) {
            console.error('Failed to send Telegram notification:', telegramError);
            // Don't throw error here - status update should succeed even if notification fails
          }
        }
      }
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  };

  const getOrder = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const getNewOrdersCount = (): number => {
    const newOrdersCount = orders.filter(order => order.status === 'Pending').length;
    return Math.max(0, newOrdersCount - viewedOrdersCount);
  };

  const markOrdersAsViewed = () => {
    const newOrdersCount = orders.filter(order => order.status === 'Pending').length;
    setViewedOrdersCount(newOrdersCount);
  };

  const searchOrders = (query: string): Order[] => {
    if (!query.trim()) return orders;
    
    const lowercaseQuery = query.toLowerCase();
    return orders.filter(order =>
      order.orderNumber.toLowerCase().includes(lowercaseQuery) ||
      order.customerInfo.fullName.toLowerCase().includes(lowercaseQuery) ||
      order.customerInfo.phoneNumber.includes(query) ||
      order.customerInfo.email.toLowerCase().includes(lowercaseQuery) ||
      order.id.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filterOrdersByStatus = (status: OrderStatus | 'All'): Order[] => {
    if (status === 'All') return orders;
    return orders.filter(order => order.status === status);
  };

  const filterOrdersByDateRange = (startDate: Date, endDate: Date): Order[] => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const refreshOrders = async (): Promise<void> => {
    await fetchOrders();
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrderStatus,
        getOrder,
        getNewOrdersCount,
        markOrdersAsViewed,
        searchOrders,
        filterOrdersByStatus,
        filterOrdersByDateRange,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  
  return context;
}
