import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Initialize stock data (for development/setup)
export async function POST() {
  try {
    // First, create the product if it doesn't exist
    const { data: existingProduct, error: productCheckError } = await supabase
      .from('products')
      .select('id')
      .eq('id', 'vintage-cargo-pants')
      .single();

    if (productCheckError && productCheckError.code !== 'PGRST116') {
      console.error('Error checking product:', productCheckError);
      return NextResponse.json(
        { error: 'Failed to check existing product' },
        { status: 500 }
      );
    }

    // Insert product if it doesn't exist
    if (!existingProduct) {
      const { error: productError } = await supabase
        .from('products')
        .insert({
          id: 'vintage-cargo-pants',
          name: 'ساتر العورة (Awrah Cover)',
          description: 'في عالمٍ تتغيّر فيه مفاهيم اللباس، يأتي "سكوربيون إكس" ليقدّم "ساتر العورة" ويُعيد تعريف الأناقة الرجالية من منظورٍ واعٍ ومحترم. هذا التصميم صُمم خصيصًا للرجل الذي يعتزّ بهويته، ويحرص على الالتزام بالستر والوقار دون أن يتخلى عن الذوق الرفيع.',
          price: 200,
          original_price: 300,
          image: '/IMG_8581-removebg-preview.png'
        });

      if (productError) {
        console.error('Error creating product:', productError);
        return NextResponse.json(
          { error: 'Failed to create product' },
          { status: 500 }
        );
      }
    }

    // Check if stock data already exists
    const { data: existingStock, error: stockCheckError } = await supabase
      .from('product_stock')
      .select('id')
      .eq('product_id', 'vintage-cargo-pants');

    if (stockCheckError) {
      console.error('Error checking stock:', stockCheckError);
      return NextResponse.json(
        { error: 'Failed to check existing stock' },
        { status: 500 }
      );
    }

    // Insert stock data if it doesn't exist
    if (!existingStock || existingStock.length === 0) {
      const stockData = [
        { product_id: 'vintage-cargo-pants', size: 'S', quantity: 25, low_stock_threshold: 5 },
        { product_id: 'vintage-cargo-pants', size: 'M', quantity: 30, low_stock_threshold: 5 },
        { product_id: 'vintage-cargo-pants', size: 'L', quantity: 35, low_stock_threshold: 5 },
        { product_id: 'vintage-cargo-pants', size: 'XL', quantity: 20, low_stock_threshold: 5 },
        { product_id: 'vintage-cargo-pants', size: 'XXL', quantity: 15, low_stock_threshold: 5 },
        { product_id: 'vintage-cargo-pants', size: '3XL', quantity: 10, low_stock_threshold: 5 }
      ];

      const { error: stockError } = await supabase
        .from('product_stock')
        .insert(stockData);

      if (stockError) {
        console.error('Error creating stock:', stockError);
        return NextResponse.json(
          { error: 'Failed to create stock data' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: 'Stock data initialized successfully',
      product: existingProduct ? 'existed' : 'created',
      stock: existingStock && existingStock.length > 0 ? 'existed' : 'created'
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
