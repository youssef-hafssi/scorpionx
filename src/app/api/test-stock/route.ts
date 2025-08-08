import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test basic connection
    console.log('Testing Supabase connection...');
    
    // Get table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('product_stock')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error('Table access error:', tableError);
      return NextResponse.json({
        error: 'Table access failed',
        details: tableError.message,
        code: tableError.code
      });
    }
    
    // Test update with a simple query
    const { data: testUpdate, error: updateError } = await supabase
      .from('product_stock')
      .update({ quantity: 10 })
      .eq('id', '93492ecd-1b61-41f1-8a3f-28a4da28b17d')
      .select();
      
    if (updateError) {
      console.error('Update test error:', updateError);
      return NextResponse.json({
        error: 'Update test failed',
        details: updateError.message,
        code: updateError.code,
        hint: updateError.hint
      });
    }
    
    return NextResponse.json({
      message: 'Tests completed',
      tableData: tableInfo,
      updateResult: testUpdate
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
