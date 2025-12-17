/**
 * API Route: Get Specific ATS Score by ID
 * GET /api/ats/score/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req) => {
    try {
      const score = await prisma.aTSScore.findFirst({
        where: {
          id: params.id,
          userId: req.user!.userId,
        },
        include: {
          resume: true,
          jobDescription: true,
        },
      });

      if (!score) {
        return NextResponse.json(
          { error: 'ATS score not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ score });
    } catch (error) {
      console.error('Get score error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
