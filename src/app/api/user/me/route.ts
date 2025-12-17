/**
 * API Route: Get Current User Profile
 * GET /api/user/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          email: true,
          name: true,
          subscriptionPlan: true,
          subscriptionStart: true,
          subscriptionEnd: true,
          scansUsedThisMonth: true,
          scansResetDate: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Reset monthly scan count if needed
      const now = new Date();
      if (user.scansResetDate < now) {
        const nextResetDate = new Date(now);
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            scansUsedThisMonth: 0,
            scansResetDate: nextResetDate,
          },
        });

        user.scansUsedThisMonth = 0;
        user.scansResetDate = nextResetDate;
      }

      return NextResponse.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
