import z from 'zod';

export const createUserSchema = z.object({
  email: z.email('Invalid email format'),
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const loginUserSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
