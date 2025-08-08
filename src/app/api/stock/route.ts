import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all stock data
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('product_stock')
      .select(`
        id,
        product_id,
        size,
        quantity,
        low_stock_threshold,
        products!inner(
          name,
          image,
          price
        )
      `)
      .order('size');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stock data' },
        { status: 500 }
      );
    }

    const formattedData = data.map(item => ({
      id: item.id,
      product_id: item.product_id,
      size: item.size,
      quantity: item.quantity,
      low_stock_threshold: item.low_stock_threshold,
      product_name: (item.products as any)?.name || 'Unknown Product',
      product_image: (item.products as any)?.image || '',
      product_price: (item.products as any)?.price || 0,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update stock quantities
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received PUT request with body:', body);
    
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      console.log('Invalid updates array:', updates);
      return NextResponse.json(
        { error: 'Invalid request body. Expected updates array.' },
        { status: 400 }
      );
    }

    // Validate updates
    for (const update of updates) {
      if (!update.id || typeof update.quantity !== 'number' || update.quantity < 0) {
        console.log('Invalid update data:', update);
        return NextResponse.json(
          { error: 'Invalid update data. Each update must have id and valid quantity.' },
          { status: 400 }
        );
      }
    }

    // Prepare updates - use simple update instead of upsert
    console.log('Processing updates:', updates);
    
    const results = [];
    for (const update of updates) {
      console.log(`Updating stock ID ${update.id} to quantity ${update.quantity}`);
      
      const { data, error } = await supabase
        .from('product_stock')
        .update({ quantity: update.quantity })
        .eq('id', update.id)
        .select();

      if (error) {
        console.error('Database error for update:', update, error);
        return NextResponse.json(
          { 
            error: 'Failed to update stock', 
            details: error.message,
            code: error.code,
            update: update
          },
          { status: 500 }
        );
      }
      
      results.push(data);
    }

    console.log('All updates successful:', results);
    return NextResponse.json({
      message: 'Stock updated successfully',
      updated: results.flat()
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Add new stock entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, size, quantity, low_stock_threshold = 5 } = body;

    if (!product_id || !size || typeof quantity !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, size, quantity' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('product_stock')
      .insert({
        product_id,
        size,
        quantity,
        low_stock_threshold
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create stock entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Stock entry created successfully',
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
