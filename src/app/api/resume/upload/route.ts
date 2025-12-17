/**
 * API Route: Upload and Parse Resume
 * POST /api/resume/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import { parseResume, parseTextResume } from '@/lib/resume-parser';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const textContent = formData.get('textContent') as string | null;

      if (!file && !textContent) {
        return NextResponse.json(
          { error: 'Either file or text content is required' },
          { status: 400 }
        );
      }

      let parsedResume;
      let fileName = 'pasted-resume.txt';
      let fileType = 'text/plain';
      let fileSize = 0;

      if (file) {
        // File upload
        fileName = file.name;
        fileType = file.type;
        fileSize = file.size;

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(fileType)) {
          return NextResponse.json(
            { error: 'Only PDF and DOCX files are allowed' },
            { status: 400 }
          );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (fileSize > maxSize) {
          return NextResponse.json(
            { error: 'File size must be less than 5MB' },
            { status: 400 }
          );
        }

        // Parse file
        const buffer = Buffer.from(await file.arrayBuffer());
        parsedResume = await parseResume(buffer, fileType);
      } else {
        // Text content
        parsedResume = parseTextResume(textContent!);
        fileSize = textContent!.length;
      }

      // Save to database
      const resume = await prisma.resume.create({
        data: {
          userId: req.user!.userId,
          fileName,
          fileType,
          fileSize,
          content: parsedResume.content,
          parsedData: parsedResume as any,
          skills: parsedResume.skills,
          experience: parsedResume.experience,
          education: parsedResume.education,
          projects: parsedResume.projects,
        },
      });

      return NextResponse.json(
        {
          message: 'Resume uploaded and parsed successfully',
          resume: {
            id: resume.id,
            fileName: resume.fileName,
            skills: resume.skills,
            parsedData: resume.parsedData,
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Resume upload error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to upload resume' },
        { status: 500 }
      );
    }
  });
}
