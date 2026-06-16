import { z } from 'zod';

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const SignupSchema = z.object({
  opportunityId: z.string().uuid(),
});

export const ProfileUpdateSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  availability: z.any().optional(),
});
