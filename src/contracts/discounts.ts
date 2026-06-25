import { ProductContract } from "./product";
import { CategoryContract } from "./category";

export interface DiscountContract {
  id: string;
  title: string;
  description: string | null;
  percentage: number;
  productId: string | null;
  categoryId: number | null;
  productIds: string[];
  imageUrl: string | null;

  product?: ProductContract | null;
  category?: CategoryContract | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
