/**
 * API Route: User Logout
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { revokeRefreshToken } from '@/lib/auth';
import { withAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await request.json();
      const { refreshToken } = body;

      if (refreshToken) {
        await revokeRefreshToken(refreshToken);
      }

      return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
