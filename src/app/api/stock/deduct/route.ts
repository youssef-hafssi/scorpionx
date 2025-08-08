import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Deduct stock quantities for order items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, orderId } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected items array.' },
        { status: 400 }
      );
    }

    console.log(`Processing stock deduction for order ${orderId}:`, items);

    // Get current stock levels for all products in the order
    const productIds = items.map((item: any) => item.product_id);
    const { data: currentStock, error: fetchError } = await supabase
      .from('product_stock')
      .select('id, product_id, size, quantity')
      .in('product_id', productIds);

    if (fetchError) {
      console.error('Error fetching current stock:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch current stock levels' },
        { status: 500 }
      );
    }

    // Calculate and validate stock updates
    const stockUpdates: { id: string; currentQuantity: number; newQuantity: number; productId: string; size: string }[] = [];
    const insufficientStock: { productId: string; size: string; requested: number; available: number }[] = [];

    for (const item of items) {
      const stockRecord = currentStock.find(
        (stock: any) => stock.product_id === item.product_id && stock.size === item.selected_size
      );

      if (!stockRecord) {
        console.warn(`Stock record not found for product ${item.product_id} size ${item.selected_size}`);
        continue;
      }

      const newQuantity = stockRecord.quantity - item.quantity;
      
      if (newQuantity < 0) {
        insufficientStock.push({
          productId: item.product_id,
          size: item.selected_size,
          requested: item.quantity,
          available: stockRecord.quantity
        });
      } else {
        stockUpdates.push({
          id: stockRecord.id,
          currentQuantity: stockRecord.quantity,
          newQuantity: Math.max(0, newQuantity),
          productId: item.product_id,
          size: item.selected_size
        });
      }
    }

    // Return warning if insufficient stock (but don't fail the request)
    if (insufficientStock.length > 0) {
      console.warn('Insufficient stock detected:', insufficientStock);
      // We could still proceed with available stock or return an error
      // For now, we'll proceed and set quantities to 0 for out-of-stock items
    }

    // Perform stock updates
    const updateResults = [];
    for (const update of stockUpdates) {
      const { data, error: updateError } = await supabase
        .from('product_stock')
        .update({ quantity: update.newQuantity })
        .eq('id', update.id)
        .select();

      if (updateError) {
        console.error('Error updating stock:', updateError);
        return NextResponse.json(
          { 
            error: 'Failed to update stock', 
            details: updateError.message,
            update: update
          },
          { status: 500 }
        );
      }

      updateResults.push({
        stockId: update.id,
        productId: update.productId,
        size: update.size,
        previousQuantity: update.currentQuantity,
        newQuantity: update.newQuantity,
        deducted: update.currentQuantity - update.newQuantity
      });
    }

    console.log('Stock deduction completed successfully:', updateResults);

    return NextResponse.json({
      message: 'Stock deduction completed successfully',
      orderId,
      updates: updateResults,
      insufficientStock: insufficientStock.length > 0 ? insufficientStock : undefined
    });

  } catch (error) {
    console.error('API error in stock deduction:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
