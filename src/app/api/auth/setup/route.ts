import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// POST - Initialize admin authentication (for development/setup)
export async function POST() {
  try {
    // Check if admin_users table exists first
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', 'adminscorpion@scorpionx.com')
      .single();

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        admin: existingAdmin
      });
    }

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Check error:', checkError);
      return NextResponse.json({
        error: 'Database error during check',
        details: checkError.message
      }, { status: 500 });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Insert admin user
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        email: 'adminscorpion@scorpionx.com',
        password_hash: passwordHash,
        role: 'super_admin',
        name: 'ScorpionX Admin',
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({
        error: 'Failed to create admin user',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}