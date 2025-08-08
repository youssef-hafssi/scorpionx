import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch stock for a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    const { data, error } = await supabase
      .from('product_stock')
      .select('*')
      .eq('product_id', productId)
      .order('size');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product stock' },
        { status: 500 }
      );
    }

    // Transform data to include availability status
    const stockData = data.map(item => ({
      size: item.size,
      quantity: item.quantity,
      available: item.quantity > 0,
      lowStock: item.quantity <= item.low_stock_threshold && item.quantity > 0
    }));

    return NextResponse.json(stockData);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update stock for a specific product size
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    const body = await request.json();
    const { size, quantity } = body;

    if (!size || typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Invalid size or quantity' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('product_stock')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .eq('size', size)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update stock' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Stock entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Stock updated successfully',
      data: data[0]
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
