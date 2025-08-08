import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Check stock availability for product page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || 'vintage-cargo-pants';

    const { data, error } = await supabase
      .from('product_stock')
      .select('size, quantity, low_stock_threshold')
      .eq('product_id', productId)
      .order('size');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stock data' },
        { status: 500 }
      );
    }

    // Transform data for product page
    const stockInfo = data.reduce((acc, item) => {
      acc[item.size] = {
        available: item.quantity > 0,
        quantity: item.quantity,
        lowStock: item.quantity <= item.low_stock_threshold && item.quantity > 0
      };
      return acc;
    }, {} as Record<string, { available: boolean; quantity: number; lowStock: boolean }>);

    // Check if any sizes are available
    const hasStock = Object.values(stockInfo).some(stock => stock.available);

    return NextResponse.json({
      productId,
      hasStock,
      stockInfo,
      message: hasStock ? 'In Stock. Ready to Ship.' : 'Currently out of stock'
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
