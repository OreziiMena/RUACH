import z from "zod";

export const createCartItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().positive(),
  size: z.string(),
});

export const updateCartItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().positive(),
  size: z.string(),
});