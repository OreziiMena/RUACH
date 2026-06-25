import z from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be a positive number"),
  stock_count: z.number().int().nonnegative("Stock count must be a non-negative integer"),
  categoryId: z.number().positive("Category ID is required"),
  sizes: z.array(z.string()).default([]),
  imageKey: z.string().min(1, "Image key is required"),
  thumbnailKeys: z.array(z.string()).default([]),
});