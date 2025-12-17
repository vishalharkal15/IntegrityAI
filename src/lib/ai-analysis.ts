/**
 * AI Analysis Module
 * 
 * Provides intelligent analysis of resumes using:
 * 1. Rule-based NLP analysis
 * 2. Optional OpenAI integration for advanced insights
 * 3. Context-aware suggestions
 */

import natural from 'natural';
import { ATSScoreResult } from './ats-engine';
import { ParsedResume } from './resume-parser';

const sentiment = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

export interface AIAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  bulletPointQuality: {
    score: number;
    feedback: string[];
  };
  languageQuality: {
    score: number;
    feedback: string[];
  };
  impactAnalysis: {
    hasQuantifiableResults: boolean;
    examples: string[];
    suggestions: string[];
  };
}

/**
 * Perform comprehensive AI analysis on resume
 */
export async function analyzeResumeWithAI(
  resume: ParsedResume,
  atsScore: ATSScoreResult
): Promise<AIAnalysisResult> {
  const strengths = identifyStrengths(resume, atsScore);
  const weaknesses = identifyWeaknesses(resume, atsScore);
  const bulletPointQuality = analyzeBulletPoints(resume);
  const languageQuality = analyzeLanguageQuality(resume);
  const impactAnalysis = analyzeImpact(resume);
  const improvements = generateImprovements(
    resume,
    atsScore,
    bulletPointQuality,
    languageQuality,
    impactAnalysis
  );

  return {
    strengths,
    weaknesses,
    improvements,
    bulletPointQuality,
    languageQuality,
    impactAnalysis,
  };
}

/**
 * Identify resume strengths
 */
function identifyStrengths(
  resume: ParsedResume,
  atsScore: ATSScoreResult
): string[] {
  const strengths: string[] = [];

  // Skills diversity
  if (resume.skills.length >= 10) {
    strengths.push(`Strong skill set with ${resume.skills.length} identified skills`);
  }

  // High ATS scores
  if (atsScore.overallScore >= 80) {
    strengths.push('Excellent ATS compatibility - highly likely to pass automated screening');
  }

  if (atsScore.skillsScore >= 85) {
    strengths.push('Strong skills alignment with job requirements');
  }

  if (atsScore.keywordScore >= 80) {
    strengths.push('Excellent keyword optimization');
  }

  // Experience depth
  if (resume.experience.length >= 3) {
    strengths.push('Comprehensive work experience documentation');
  }

  // Projects
  if (resume.projects.length >= 2) {
    strengths.push('Strong project portfolio demonstrates practical experience');
  }

  // Action verbs
  const actionVerbs = countActionVerbs(resume.content);
  if (actionVerbs >= 10) {
    strengths.push(`Effective use of ${actionVerbs} action verbs to demonstrate achievements`);
  }

  // Quantifiable results
  const metrics = extractMetrics(resume.content);
  if (metrics.length >= 3) {
    strengths.push('Good use of quantifiable metrics and results');
  }

  return strengths;
}

/**
 * Identify resume weaknesses
 */
function identifyWeaknesses(
  resume: ParsedResume,
  atsScore: ATSScoreResult
): string[] {
  const weaknesses: string[] = [];

  // Low scores
  if (atsScore.overallScore < 60) {
    weaknesses.push('Low ATS score may result in automatic rejection');
  }

  if (atsScore.skillsScore < 60) {
    weaknesses.push('Insufficient skills match with job requirements');
  }

  if (atsScore.keywordScore < 50) {
    weaknesses.push('Missing critical keywords from job description');
  }

  // Missing sections
  if (resume.skills.length < 5) {
    weaknesses.push('Limited skills listed - add more relevant technical and soft skills');
  }

  if (resume.experience.length === 0) {
    weaknesses.push('No work experience section detected');
  }

  if (resume.education.length === 0) {
    weaknesses.push('Missing education information');
  }

  if (resume.projects.length === 0) {
    weaknesses.push('No projects section - consider adding relevant projects');
  }

  // Content quality
  const actionVerbs = countActionVerbs(resume.content);
  if (actionVerbs < 5) {
    weaknesses.push('Lacks strong action verbs - use words like "achieved", "led", "developed"');
  }

  const metrics = extractMetrics(resume.content);
  if (metrics.length < 2) {
    weaknesses.push('Few quantifiable achievements - add specific numbers, percentages, or metrics');
  }

  // Length issues
  if (resume.content.length < 800) {
    weaknesses.push('Resume appears too brief - add more detail to experience and achievements');
  }

  if (resume.content.length > 5000) {
    weaknesses.push('Resume may be too lengthy - consider condensing to most relevant information');
  }

  return weaknesses;
}

/**
 * Analyze bullet point quality
 */
function analyzeBulletPoints(resume: ParsedResume): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 100;

  const content = resume.experience.join('\n');
  
  // Check for bullet points
  const bulletPoints = content.match(/^[\s]*[•\-*]\s+/gm);
  if (!bulletPoints || bulletPoints.length < 3) {
    score -= 30;
    feedback.push('Add bullet points to structure your experience');
  }

  // Check for STAR format (Situation, Task, Action, Result)
  const hasContext = /(?:led|managed|coordinated|oversaw)/gi.test(content);
  const hasAction = /(?:developed|created|implemented|designed|built)/gi.test(content);
  const hasResult = /(?:increased|decreased|improved|reduced|achieved)/gi.test(content);

  if (!hasAction) {
    score -= 25;
    feedback.push('Include strong action verbs at the start of each bullet point');
  }

  if (!hasResult) {
    score -= 25;
    feedback.push('Add measurable results and outcomes to your accomplishments');
  }

  if (!hasContext) {
    score -= 10;
    feedback.push('Provide context about your role and responsibilities');
  }

  // Check bullet length
  const lines = content.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
  const tooLong = lines.filter(l => l.length > 150);
  const tooShort = lines.filter(l => l.length < 30);

  if (tooLong.length > 0) {
    score -= 10;
    feedback.push('Some bullet points are too long - aim for 1-2 lines each');
  }

  if (tooShort.length > lines.length / 2) {
    score -= 10;
    feedback.push('Many bullet points lack detail - expand with specific achievements');
  }

  return { score: Math.max(0, score), feedback };
}

/**
 * Analyze language quality
 */
function analyzeLanguageQuality(resume: ParsedResume): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 100;

  const content = resume.content;

  // Check for passive voice
  const passiveIndicators = /(?:was|were|been|being)\s+\w+ed/gi;
  const passiveMatches = content.match(passiveIndicators);
  if (passiveMatches && passiveMatches.length > 5) {
    score -= 15;
    feedback.push('Reduce passive voice - use active voice for stronger impact');
  }

  // Check for first person pronouns (should be minimal in resumes)
  const firstPerson = content.match(/\b(?:I|me|my|mine)\b/gi);
  if (firstPerson && firstPerson.length > 3) {
    score -= 10;
    feedback.push('Minimize use of first-person pronouns (I, me, my)');
  }

  // Check for jargon overload
  const sentenceCount = content.split(/[.!?]+/).length;
  const complexWords = content.match(/\b\w{12,}\b/g);
  if (complexWords && complexWords.length > sentenceCount * 0.3) {
    score -= 10;
    feedback.push('Simplify complex terminology where possible for better readability');
  }

  // Check for clichés
  const cliches = [
    'team player', 'think outside the box', 'go-getter', 'hard worker',
    'detail-oriented', 'self-motivated', 'results-driven'
  ];
  
  const foundCliches = cliches.filter(cliche => 
    content.toLowerCase().includes(cliche)
  );

  if (foundCliches.length > 2) {
    score -= 15;
    feedback.push('Replace clichés with specific examples and achievements');
  }

  // Sentiment analysis
  const tokens = tokenizer.tokenize(content.toLowerCase());
  const sentimentScore = sentiment.getSentiment(tokens);
  
  if (sentimentScore < -0.5) {
    score -= 10;
    feedback.push('Overall tone appears negative - frame experiences more positively');
  }

  return { score: Math.max(0, score), feedback };
}

/**
 * Analyze impact and quantifiable results
 */
function analyzeImpact(resume: ParsedResume): {
  hasQuantifiableResults: boolean;
  examples: string[];
  suggestions: string[];
} {
  const metrics = extractMetrics(resume.content);
  const suggestions: string[] = [];

  if (metrics.length === 0) {
    suggestions.push('Add specific numbers: "Increased sales by 25%"');
    suggestions.push('Include time frames: "Reduced processing time from 2 hours to 30 minutes"');
    suggestions.push('Quantify team size: "Led a team of 5 developers"');
    suggestions.push('Show scale: "Managed database with 1M+ records"');
  } else if (metrics.length < 3) {
    suggestions.push('Add more quantifiable achievements throughout your experience');
  }

  return {
    hasQuantifiableResults: metrics.length >= 2,
    examples: metrics,
    suggestions,
  };
}

/**
 * Generate comprehensive improvement suggestions
 */
function generateImprovements(
  resume: ParsedResume,
  atsScore: ATSScoreResult,
  bulletQuality: any,
  languageQuality: any,
  impactAnalysis: any
): string[] {
  const improvements: string[] = [];

  // Priority improvements based on ATS score
  if (atsScore.missingSkills.length > 0) {
    improvements.push(
      `HIGH PRIORITY: Add these missing skills - ${atsScore.missingSkills.slice(0, 3).join(', ')}`
    );
  }

  if (atsScore.missingKeywords.length > 0) {
    improvements.push(
      `Add critical keywords: ${atsScore.missingKeywords.slice(0, 3).join(', ')}`
    );
  }

  // Bullet point improvements
  if (bulletQuality.score < 70) {
    improvements.push(...bulletQuality.feedback.slice(0, 2));
  }

  // Language improvements
  if (languageQuality.score < 70) {
    improvements.push(...languageQuality.feedback.slice(0, 2));
  }

  // Impact improvements
  if (!impactAnalysis.hasQuantifiableResults) {
    improvements.push(...impactAnalysis.suggestions.slice(0, 2));
  }

  // Formatting improvements
  if (atsScore.formattingScore < 80) {
    improvements.push('Improve resume formatting for better ATS compatibility');
  }

  return improvements.slice(0, 10); // Top 10 improvements
}

/**
 * Helper: Count action verbs in content
 */
function countActionVerbs(content: string): number {
  const actionVerbs = [
    'achieved', 'administered', 'analyzed', 'arranged', 'built', 'calculated',
    'collaborated', 'completed', 'conducted', 'coordinated', 'created', 'delivered',
    'designed', 'developed', 'directed', 'established', 'evaluated', 'executed',
    'facilitated', 'generated', 'implemented', 'improved', 'increased', 'initiated',
    'launched', 'led', 'managed', 'optimized', 'organized', 'planned', 'produced',
    'reduced', 'redesigned', 'resolved', 'streamlined', 'supervised', 'trained'
  ];

  let count = 0;
  const lowerContent = content.toLowerCase();
  
  actionVerbs.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = lowerContent.match(regex);
    if (matches) count += matches.length;
  });

  return count;
}

/**
 * Helper: Extract metrics and numbers from content
 */
function extractMetrics(content: string): string[] {
  const metrics: string[] = [];

  // Pattern for numbers with context
  const patterns = [
    /(?:increased|decreased|improved|reduced|grew|grew by|saved|generated|achieved)\s+[^.]*?(?:\d+(?:,\d{3})*(?:\.\d+)?%?|\$\d+[kmb]?)[^.]*/gi,
    /\d+(?:,\d{3})*(?:\.\d+)?%\s+(?:increase|decrease|improvement|growth|reduction)/gi,
    /\$\d+(?:,\d{3})*(?:\.\d+)?[kmb]?\s+(?:revenue|sales|savings|budget)/gi,
    /(?:team of|managed|led)\s+\d+\s+(?:people|developers|members|engineers)/gi,
  ];

  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      metrics.push(...matches.map(m => m.trim()));
    }
  });

  return [...new Set(metrics)]; // Remove duplicates
}

/**
 * Optional: Enhanced AI analysis using OpenAI
 */
export async function enhanceWithOpenAI(
  resume: ParsedResume,
  jobDescription: string
): Promise<string[]> {
  // This would integrate with OpenAI API for more advanced analysis
  // For now, returns structured prompts for potential OpenAI integration
  
  const prompts = [
    'Suggest 3 specific improvements to make this resume more competitive',
    'Identify gaps between this resume and the job requirements',
    'Recommend how to better quantify achievements',
  ];

  // In production, you would call OpenAI API here
  // const response = await openai.chat.completions.create({...})
  
  return prompts;
}
