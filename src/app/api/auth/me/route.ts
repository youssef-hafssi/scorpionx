import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// GET - Verify admin session
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    const sessionToken = request.cookies.get('admin-session')?.value;

    if (!token || !sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT
    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check session in database
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select(`
        *,
        admin_users (
          id,
          email,
          name,
          role,
          is_active
        )
      `)
      .eq('session_token', sessionToken)
      .eq('user_id', decoded.userId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session || !session.admin_users.is_active) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.admin_users.id,
        email: session.admin_users.email,
        name: session.admin_users.name,
        role: session.admin_users.role
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
