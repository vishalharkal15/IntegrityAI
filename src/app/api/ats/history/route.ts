/**
 * API Route: Get ATS Score History
 * GET /api/ats/history
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');

      const scores = await prisma.aTSScore.findMany({
        where: { userId: req.user!.userId },
        include: {
          resume: {
            select: {
              fileName: true,
            },
          },
          jobDescription: {
            select: {
              title: true,
              company: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const total = await prisma.aTSScore.count({
        where: { userId: req.user!.userId },
      });

      return NextResponse.json({
        scores,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      });
    } catch (error) {
      console.error('Get history error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
