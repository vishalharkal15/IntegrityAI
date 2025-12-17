/**
 * Resume Parser
 * 
 * Extracts structured data from PDF and DOCX resume files
 * Identifies sections: skills, experience, education, projects
 */

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedResume {
  content: string;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
}

/**
 * Main parsing function - routes to appropriate parser based on file type
 */
export async function parseResume(
  buffer: Buffer,
  fileType: string
): Promise<ParsedResume> {
  let content = '';

  try {
    if (fileType === 'application/pdf') {
      content = await parsePDF(buffer);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      content = await parseDOCX(buffer);
    } else {
      throw new Error('Unsupported file type');
    }

    // Extract structured data from content
    const skills = extractSkills(content);
    const experience = extractExperience(content);
    const education = extractEducation(content);
    const projects = extractProjects(content);
    const contactInfo = extractContactInfo(content);

    return {
      content,
      skills,
      experience,
      education,
      projects,
      contactInfo,
    };
  } catch (error) {
    throw new Error(`Failed to parse resume: ${error}`);
  }
}

/**
 * Parse PDF resume
 */
async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Parse DOCX resume
 */
async function parseDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Extract skills from resume content
 */
function extractSkills(content: string): string[] {
  const skills: Set<string> = new Set();

  // Common section headers for skills
  const skillsSections = [
    /skills?\s*:?\s*([\s\S]*?)(?=\n\n|\n[A-Z][a-z]+\s*:|\n(?:experience|education|projects|certifications))/gi,
    /technical\s+skills?\s*:?\s*([\s\S]*?)(?=\n\n|\n[A-Z][a-z]+\s*:)/gi,
    /core\s+competencies\s*:?\s*([\s\S]*?)(?=\n\n|\n[A-Z][a-z]+\s*:)/gi,
  ];

  // Extract from dedicated sections
  skillsSections.forEach(regex => {
    const matches = content.match(regex);
    if (matches) {
      matches.forEach(match => {
        extractSkillsFromText(match).forEach(skill => skills.add(skill));
      });
    }
  });

  // Also scan entire content for common tech skills
  const commonSkills = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin',
    // Web Technologies
    'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot',
    'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap',
    // Databases
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Oracle', 'SQL Server',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
    'Terraform', 'Ansible', 'CI/CD',
    // Tools & Others
    'Git', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'JIRA', 'Linux',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'AI', 'NLP', 'Data Science',
  ];

  const lowerContent = content.toLowerCase();
  commonSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (lowerContent.includes(skillLower)) {
      skills.add(skill);
    }
  });

  return Array.from(skills);
}

/**
 * Extract individual skills from a text block
 */
function extractSkillsFromText(text: string): string[] {
  const skills: string[] = [];
  
  // Split by common delimiters
  const delimiters = /[,;•\n|]/g;
  const parts = text.split(delimiters);

  parts.forEach(part => {
    const cleaned = part.trim()
      .replace(/^[-•*]\s*/, '') // Remove bullet points
      .replace(/\s+/g, ' ');    // Normalize whitespace

    if (cleaned.length > 1 && cleaned.length < 50) {
      skills.push(cleaned);
    }
  });

  return skills;
}

/**
 * Extract experience section
 */
function extractExperience(content: string): string[] {
  const experience: string[] = [];

  const experienceRegex = [
    /(?:work\s+)?experience\s*:?\s*([\s\S]*?)(?=\n\n[A-Z]|education|projects|skills|$)/gi,
    /professional\s+experience\s*:?\s*([\s\S]*?)(?=\n\n[A-Z]|education|$)/gi,
    /employment\s+history\s*:?\s*([\s\S]*?)(?=\n\n[A-Z]|education|$)/gi,
  ];

  experienceRegex.forEach(regex => {
    const matches = content.match(regex);
    if (matches && matches[0]) {
      // Split into individual job entries
      const jobs = matches[0].split(/\n(?=[A-Z][a-z]+.*(?:20\d{2}|19\d{2}))/);
      jobs.forEach(job => {
        const cleaned = job.trim();
        if (cleaned.length > 20) {
          experience.push(cleaned);
        }
      });
    }
  });

  return experience;
}

/**
 * Extract education section
 */
function extractEducation(content: string): string[] {
  const education: string[] = [];

  const educationRegex = [
    /education\s*:?\s*([\s\S]*?)(?=\n\n[A-Z]|experience|projects|skills|$)/gi,
    /academic\s+background\s*:?\s*([\s\S]*?)(?=\n\n[A-Z]|$)/gi,
  ];

  educationRegex.forEach(regex => {
    const matches = content.match(regex);
    if (matches && matches[0]) {
      const lines = matches[0].split('\n').filter(line => line.trim().length > 10);
      education.push(...lines.map(l => l.trim()));
    }
  });

  return education;
}

/**
 * Extract projects section
 */
function extractProjects(content: string): string[] {
  const projects: string[] = [];

  const projectsRegex = [
    /projects?\s*:?\s*([\s\S]*?)(?=\n\n[A-Z]|experience|education|skills|$)/gi,
    /key\s+projects?\s*:?\s*([\s\S]*?)(?=\n\n[A-Z]|$)/gi,
  ];

  projectsRegex.forEach(regex => {
    const matches = content.match(regex);
    if (matches && matches[0]) {
      // Split into individual projects
      const projectList = matches[0].split(/\n(?=[A-Z•\-*])/);
      projectList.forEach(project => {
        const cleaned = project.trim();
        if (cleaned.length > 20) {
          projects.push(cleaned);
        }
      });
    }
  });

  return projects;
}

/**
 * Extract contact information
 */
function extractContactInfo(content: string): ParsedResume['contactInfo'] {
  const contactInfo: ParsedResume['contactInfo'] = {};

  // Email
  const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
  }

  // Phone
  const phoneMatch = content.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    contactInfo.phone = phoneMatch[0];
  }

  // LinkedIn
  const linkedinMatch = content.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) {
    contactInfo.linkedin = linkedinMatch[0];
  }

  // GitHub
  const githubMatch = content.match(/github\.com\/[\w-]+/i);
  if (githubMatch) {
    contactInfo.github = githubMatch[0];
  }

  return contactInfo;
}

/**
 * Parse plain text resume (for paste functionality)
 */
export function parseTextResume(text: string): ParsedResume {
  return {
    content: text,
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    projects: extractProjects(text),
    contactInfo: extractContactInfo(text),
  };
}
