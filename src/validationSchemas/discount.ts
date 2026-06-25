import z from "zod";

export const createDiscountSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
  percentage: z.number().min(0).max(100),
  productId: z.string().nullable().optional(),
  categoryId: z.number().nullable().optional(),
  productIds: z.array(z.string()).optional(),
  expiresAt: z.preprocess((val) => {
    if (typeof val === 'string' || val instanceof Date) return new Date(val);
    return val;
  }, z.date()),
  imageKey: z.string().optional(),
});