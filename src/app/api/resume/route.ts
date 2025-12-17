/**
 * API Route: Get User's Resumes
 * GET /api/resume
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const resumes = await prisma.resume.findMany({
        where: { userId: req.user!.userId },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          skills: true,
          createdAt: true,
          _count: {
            select: { atsScores: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ resumes });
    } catch (error) {
      console.error('Get resumes error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
