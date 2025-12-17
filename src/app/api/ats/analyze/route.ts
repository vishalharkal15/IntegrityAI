/**
 * API Route: Analyze Resume with ATS Engine
 * POST /api/ats/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import { calculateATSScore, extractKeywords } from '@/lib/ats-engine';
import { analyzeResumeWithAI } from '@/lib/ai-analysis';

const FREE_SCANS_LIMIT = parseInt(process.env.FREE_PLAN_SCANS_PER_MONTH || '5');

export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await request.json();
      const { resumeId, jobDescription } = body;

      if (!resumeId || !jobDescription) {
        return NextResponse.json(
          { error: 'Resume ID and job description are required' },
          { status: 400 }
        );
      }

      // Get user and check subscription limits
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check scan limit for free users
      if (user.subscriptionPlan === 'FREE' && user.scansUsedThisMonth >= FREE_SCANS_LIMIT) {
        return NextResponse.json(
          {
            error: 'Monthly scan limit reached',
            message: `You have used all ${FREE_SCANS_LIMIT} free scans this month. Upgrade to Pro for unlimited scans.`,
          },
          { status: 403 }
        );
      }

      // Get resume
      const resume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: req.user!.userId,
        },
      });

      if (!resume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }

      // Extract keywords from job description
      const keywords = extractKeywords(jobDescription.description);

      // Create job description record
      const jobDescRecord = await prisma.jobDescription.create({
        data: {
          title: jobDescription.title,
          company: jobDescription.company,
          description: jobDescription.description,
          requiredSkills: jobDescription.requiredSkills || [],
          preferredSkills: jobDescription.preferredSkills || [],
          keywords,
          experience: jobDescription.experience,
        },
      });

      // Prepare data for ATS engine
      const resumeData = {
        content: resume.content,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        projects: resume.projects,
      };

      const jobData = {
        description: jobDescRecord.description,
        requiredSkills: jobDescRecord.requiredSkills,
        preferredSkills: jobDescRecord.preferredSkills,
        keywords: jobDescRecord.keywords,
        experience: jobDescRecord.experience || undefined,
      };

      // Calculate ATS score
      const atsScoreResult = calculateATSScore(resumeData, jobData);

      // Perform AI analysis
      const aiAnalysis = await analyzeResumeWithAI(
        resumeData as any,
        atsScoreResult
      );

      // Save ATS score to database
      const atsScore = await prisma.aTSScore.create({
        data: {
          user: { connect: { id: req.user!.userId } },
          resume: { connect: { id: resume.id } },
          jobDescription: { connect: { id: jobDescRecord.id } },
          overallScore: atsScoreResult.overallScore,
          skillsScore: atsScoreResult.skillsScore,
          experienceScore: atsScoreResult.experienceScore,
          keywordScore: atsScoreResult.keywordScore,
          formattingScore: atsScoreResult.formattingScore,
          matchedSkills: atsScoreResult.matchedSkills,
          missingSkills: atsScoreResult.missingSkills,
          matchedKeywords: atsScoreResult.matchedKeywords,
          missingKeywords: atsScoreResult.missingKeywords,
          strengthsAnalysis: aiAnalysis.strengths as any,
          weaknessesAnalysis: aiAnalysis.weaknesses as any,
          suggestions: [...atsScoreResult.suggestions, ...aiAnalysis.improvements],
        },
      });

      // Increment scan count
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: {
          scansUsedThisMonth: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        message: 'ATS analysis completed successfully',
        result: {
          id: atsScore.id,
          overallScore: atsScore.overallScore,
          componentScores: {
            skills: atsScore.skillsScore,
            experience: atsScore.experienceScore,
            keywords: atsScore.keywordScore,
            formatting: atsScore.formattingScore,
          },
          matched: {
            skills: atsScore.matchedSkills,
            keywords: atsScore.matchedKeywords,
          },
          missing: {
            skills: atsScore.missingSkills,
            keywords: atsScore.missingKeywords,
          },
          aiAnalysis: {
            strengths: aiAnalysis.strengths,
            weaknesses: aiAnalysis.weaknesses,
            bulletPointQuality: aiAnalysis.bulletPointQuality,
            languageQuality: aiAnalysis.languageQuality,
            impactAnalysis: aiAnalysis.impactAnalysis,
          },
          suggestions: atsScore.suggestions,
          scansRemaining: user.subscriptionPlan === 'FREE' 
            ? FREE_SCANS_LIMIT - user.scansUsedThisMonth - 1
            : null,
        },
      });
    } catch (error: any) {
      console.error('ATS analysis error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to analyze resume' },
        { status: 500 }
      );
    }
  });
}
