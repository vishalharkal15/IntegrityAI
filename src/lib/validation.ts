/**
 * Input validation utilities using Zod
 */

import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Resume upload schema
export const resumeUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ], { errorMap: () => ({ message: 'Only PDF and DOCX files are allowed' }) }),
  fileSize: z.number().max(5242880, 'File size must be less than 5MB'),
});

// Job description schema
export const jobDescriptionSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  company: z.string().optional(),
  description: z.string().min(50, 'Job description must be at least 50 characters'),
});

// ATS analysis request schema
export const atsAnalysisSchema = z.object({
  resumeId: z.string().cuid('Invalid resume ID'),
  jobDescription: jobDescriptionSchema,
});

// Token refresh schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResumeUploadInput = z.infer<typeof resumeUploadSchema>;
export type JobDescriptionInput = z.infer<typeof jobDescriptionSchema>;
export type ATSAnalysisInput = z.infer<typeof atsAnalysisSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
