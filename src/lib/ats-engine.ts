/**
 * ATS Scoring Engine
 * 
 * Multi-factor scoring system that evaluates resumes against job descriptions
 * using weighted components:
 * - Skills Match: 40%
 * - Experience Relevance: 30%
 * - Keyword Density: 20%
 * - Formatting Quality: 10%
 */

import natural from 'natural';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

export interface ResumeData {
  content: string;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
}

export interface JobDescriptionData {
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  experience?: string;
}

export interface ATSScoreResult {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  keywordScore: number;
  formattingScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

// Weights for scoring components
const WEIGHTS = {
  skills: 0.40,
  experience: 0.30,
  keywords: 0.20,
  formatting: 0.10,
};

/**
 * Main ATS scoring function
 */
export function calculateATSScore(
  resume: ResumeData,
  jobDescription: JobDescriptionData
): ATSScoreResult {
  // Calculate individual component scores
  const skillsAnalysis = calculateSkillsScore(resume, jobDescription);
  const experienceAnalysis = calculateExperienceScore(resume, jobDescription);
  const keywordAnalysis = calculateKeywordScore(resume, jobDescription);
  const formattingAnalysis = calculateFormattingScore(resume);

  // Calculate weighted overall score
  const overallScore = Math.round(
    skillsAnalysis.score * WEIGHTS.skills +
    experienceAnalysis.score * WEIGHTS.experience +
    keywordAnalysis.score * WEIGHTS.keywords +
    formattingAnalysis.score * WEIGHTS.formatting
  );

  // Generate actionable suggestions
  const suggestions = generateSuggestions(
    skillsAnalysis,
    experienceAnalysis,
    keywordAnalysis,
    formattingAnalysis
  );

  return {
    overallScore,
    skillsScore: Math.round(skillsAnalysis.score),
    experienceScore: Math.round(experienceAnalysis.score),
    keywordScore: Math.round(keywordAnalysis.score),
    formattingScore: Math.round(formattingAnalysis.score),
    matchedSkills: skillsAnalysis.matched,
    missingSkills: skillsAnalysis.missing,
    matchedKeywords: keywordAnalysis.matched,
    missingKeywords: keywordAnalysis.missing,
    suggestions,
  };
}

/**
 * Calculate skills matching score (0-100)
 * Evaluates how well resume skills match job requirements
 */
function calculateSkillsScore(
  resume: ResumeData,
  jobDescription: JobDescriptionData
) {
  const resumeSkills = normalizeSkills(resume.skills);
  const requiredSkills = normalizeSkills(jobDescription.requiredSkills);
  const preferredSkills = normalizeSkills(jobDescription.preferredSkills);

  const allJobSkills = [...requiredSkills, ...preferredSkills];
  
  // Find matches using fuzzy matching
  const matched: string[] = [];
  const missing: string[] = [];

  for (const jobSkill of requiredSkills) {
    const isMatched = resumeSkills.some(resumeSkill => 
      skillsMatch(resumeSkill, jobSkill)
    );
    
    if (isMatched) {
      matched.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  }

  // Bonus points for preferred skills
  let preferredMatched = 0;
  for (const prefSkill of preferredSkills) {
    if (resumeSkills.some(resumeSkill => skillsMatch(resumeSkill, prefSkill))) {
      preferredMatched++;
      if (!matched.includes(prefSkill)) {
        matched.push(prefSkill);
      }
    }
  }

  // Calculate score
  const requiredMatchRatio = requiredSkills.length > 0 
    ? matched.filter(s => requiredSkills.includes(s)).length / requiredSkills.length 
    : 0;
  
  const preferredBonus = preferredSkills.length > 0 
    ? (preferredMatched / preferredSkills.length) * 20 
    : 0;

  const score = Math.min(100, (requiredMatchRatio * 80) + preferredBonus);

  return { score, matched, missing };
}

/**
 * Calculate experience relevance score (0-100)
 * Uses TF-IDF to measure semantic similarity
 */
function calculateExperienceScore(
  resume: ResumeData,
  jobDescription: JobDescriptionData
) {
  const tfidf = new TfIdf();
  
  // Add documents
  tfidf.addDocument(resume.experience.join(' '));
  tfidf.addDocument(jobDescription.description);

  // Extract top terms from job description
  const jobTerms: { term: string; score: number }[] = [];
  tfidf.listTerms(1).forEach((item) => {
    if (item.term.length > 3) { // Filter short words
      jobTerms.push({ term: item.term, score: item.tfidf });
    }
  });

  // Calculate how many job terms appear in resume
  const resumeText = resume.content.toLowerCase();
  let matchCount = 0;
  let totalWeight = 0;

  jobTerms.slice(0, 20).forEach(({ term, score }) => {
    totalWeight += score;
    if (resumeText.includes(term.toLowerCase())) {
      matchCount += score;
    }
  });

  const score = totalWeight > 0 ? (matchCount / totalWeight) * 100 : 0;

  return { 
    score, 
    relevantTerms: jobTerms.slice(0, 10).map(t => t.term),
    matched: jobTerms.filter(({ term }) => 
      resumeText.includes(term.toLowerCase())
    ).map(t => t.term)
  };
}

/**
 * Calculate keyword density and matching score (0-100)
 */
function calculateKeywordScore(
  resume: ResumeData,
  jobDescription: JobDescriptionData
) {
  const resumeText = resume.content.toLowerCase();
  const keywords = jobDescription.keywords.map(k => k.toLowerCase());

  const matched: string[] = [];
  const missing: string[] = [];
  let densityScore = 0;

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = resumeText.match(regex);
    
    if (matches && matches.length > 0) {
      matched.push(keyword);
      // Reward multiple mentions but with diminishing returns
      densityScore += Math.min(matches.length * 5, 15);
    } else {
      missing.push(keyword);
    }
  }

  // Calculate match ratio
  const matchRatio = keywords.length > 0 
    ? matched.length / keywords.length 
    : 0;

  // Combine match ratio (70%) and density (30%)
  const score = Math.min(100, (matchRatio * 70) + (densityScore / keywords.length * 30));

  return { score, matched, missing };
}

/**
 * Calculate ATS-friendly formatting score (0-100)
 * Checks for ATS compatibility issues
 */
function calculateFormattingScore(resume: ResumeData) {
  let score = 100;
  const issues: string[] = [];

  // Check for minimum content length
  if (resume.content.length < 500) {
    score -= 20;
    issues.push('Resume content is too short');
  }

  // Check for sections
  const hasSkills = resume.skills.length > 0;
  const hasExperience = resume.experience.length > 0;
  const hasEducation = resume.education.length > 0;

  if (!hasSkills) {
    score -= 30;
    issues.push('Missing skills section');
  }
  
  if (!hasExperience) {
    score -= 30;
    issues.push('Missing experience section');
  }

  if (!hasEducation) {
    score -= 20;
    issues.push('Missing education section');
  }

  // Check for bullet points (action words)
  const actionWords = [
    'achieved', 'managed', 'led', 'developed', 'created', 
    'improved', 'increased', 'decreased', 'implemented', 
    'designed', 'built', 'established', 'launched'
  ];
  
  const hasActionWords = actionWords.some(word => 
    resume.content.toLowerCase().includes(word)
  );

  if (!hasActionWords) {
    score -= 10;
    issues.push('Lacks strong action verbs');
  }

  return { score: Math.max(0, score), issues };
}

/**
 * Generate actionable suggestions based on analysis
 */
function generateSuggestions(
  skillsAnalysis: any,
  experienceAnalysis: any,
  keywordAnalysis: any,
  formattingAnalysis: any
): string[] {
  const suggestions: string[] = [];

  // Skills suggestions
  if (skillsAnalysis.score < 70 && skillsAnalysis.missing.length > 0) {
    suggestions.push(
      `Add these critical skills: ${skillsAnalysis.missing.slice(0, 5).join(', ')}`
    );
  }

  // Experience suggestions
  if (experienceAnalysis.score < 60) {
    suggestions.push(
      'Expand your experience descriptions to include more relevant keywords and achievements'
    );
  }

  // Keyword suggestions
  if (keywordAnalysis.score < 70 && keywordAnalysis.missing.length > 0) {
    suggestions.push(
      `Include these important keywords: ${keywordAnalysis.missing.slice(0, 5).join(', ')}`
    );
  }

  // Formatting suggestions
  if (formattingAnalysis.issues.length > 0) {
    suggestions.push(...formattingAnalysis.issues.map(
      (issue: string) => `Formatting: ${issue}`
    ));
  }

  // General suggestions
  if (skillsAnalysis.score >= 80 && keywordAnalysis.score >= 80) {
    suggestions.push('Excellent keyword optimization! Consider quantifying your achievements with metrics.');
  }

  return suggestions;
}

/**
 * Normalize skills for better matching
 */
function normalizeSkills(skills: string[]): string[] {
  return skills.map(skill => 
    skill.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s+#.]/gi, '')
  );
}

/**
 * Check if two skills match (with fuzzy matching)
 */
function skillsMatch(skill1: string, skill2: string): boolean {
  const s1 = skill1.toLowerCase().trim();
  const s2 = skill2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return true;

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return true;

  // Common abbreviations and variations
  const variations: Record<string, string[]> = {
    'javascript': ['js', 'javascript', 'ecmascript'],
    'typescript': ['ts', 'typescript'],
    'python': ['py', 'python'],
    'react': ['reactjs', 'react.js', 'react'],
    'node': ['nodejs', 'node.js', 'node'],
    'mongodb': ['mongo', 'mongodb'],
    'postgresql': ['postgres', 'postgresql', 'psql'],
    'aws': ['amazon web services', 'aws'],
    'gcp': ['google cloud platform', 'gcp', 'google cloud'],
    'ci/cd': ['cicd', 'ci/cd', 'continuous integration'],
  };

  for (const [key, variants] of Object.entries(variations)) {
    if (variants.includes(s1) && variants.includes(s2)) {
      return true;
    }
  }

  // Levenshtein distance for typos
  const distance = natural.LevenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  const similarity = 1 - distance / maxLength;

  return similarity > 0.85; // 85% similarity threshold
}

/**
 * Extract keywords from job description
 */
export function extractKeywords(text: string): string[] {
  const tfidf = new TfIdf();
  tfidf.addDocument(text.toLowerCase());

  const keywords: string[] = [];
  tfidf.listTerms(0).forEach((item) => {
    if (item.term.length > 3 && item.tfidf > 1) {
      keywords.push(item.term);
    }
  });

  return keywords.slice(0, 30); // Top 30 keywords
}
