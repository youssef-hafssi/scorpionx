import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Check stock availability for cart items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected items array.' },
        { status: 400 }
      );
    }

    console.log('Checking stock availability for items:', items);

    // Get current stock levels for all products in the cart
    const productIds = items.map((item: any) => item.product_id);
    const { data: currentStock, error: fetchError } = await supabase
      .from('product_stock')
      .select('id, product_id, size, quantity, low_stock_threshold')
      .in('product_id', productIds);

    if (fetchError) {
      console.error('Error fetching current stock:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch current stock levels' },
        { status: 500 }
      );
    }

    // Check availability for each item
    const availability: {
      productId: string;
      size: string;
      requested: number;
      available: number;
      isAvailable: boolean;
      isLowStock: boolean;
    }[] = [];

    let allItemsAvailable = true;

    for (const item of items) {
      const stockRecord = currentStock.find(
        (stock: any) => stock.product_id === item.product_id && stock.size === item.selected_size
      );      const available = stockRecord ? stockRecord.quantity : 0;
      const isAvailable = available >= item.quantity;
      const isLowStock = stockRecord ? available <= stockRecord.low_stock_threshold : false;

      availability.push({
        productId: item.product_id,
        size: item.selected_size,
        requested: item.quantity,
        available,
        isAvailable,
        isLowStock
      });

      if (!isAvailable) {
        allItemsAvailable = false;
      }
    }

    return NextResponse.json({
      allItemsAvailable,
      items: availability,
      message: allItemsAvailable 
        ? 'All items are available in stock' 
        : 'Some items are not available in requested quantities'
    });

  } catch (error) {
    console.error('API error in stock check:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
