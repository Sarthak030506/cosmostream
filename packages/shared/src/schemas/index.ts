import { z } from 'zod';

// User schemas
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  website: z.string().url().optional(),
});

// Video schemas
export const createVideoSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  category: z.string().optional(),
});

export const updateVideoSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  category: z.string().optional(),
});

// Forum schemas
export const createThreadSchema = z.object({
  title: z.string().min(5).max(200),
  category: z.string(),
  tags: z.array(z.string()).max(5),
  content: z.string().min(10).max(10000),
});

export const createPostSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1).max(10000),
});

// Course schemas
export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
});

export const addModuleSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(3).max(200),
  videoIds: z.array(z.string().uuid()),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type AddModuleInput = z.infer<typeof addModuleSchema>;
