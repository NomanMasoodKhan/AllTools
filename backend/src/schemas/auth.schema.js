import { z } from 'zod';

import { ALLOWED_ROLES, PASSWORD_MIN_LENGTH } from '../config/constants.js';

export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(128),
  role: z.enum(ALLOWED_ROLES)
});

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128)
});
