import { DiscountContract } from '@/contracts/discounts';
import CloudflareStorageServer from '@/services/cloudflare/storage';
import { Prisma } from '@prisma/client';
import { productMapper } from './product';

export const discountMapper = (
  discount: Prisma.DiscountGetPayload<{
    include: { product: { include: { category: true } }; category: true };
  }>,
): DiscountContract => ({
  id: discount.id,
  title: discount.title,
  description: discount.description,
  percentage: discount.percentage,
  productId: discount.productId,
  categoryId: discount.categoryId,
  productIds: discount.productIds,
  imageUrl: discount.imageKey
    ? CloudflareStorageServer.generatePublicUrl(discount.imageKey)
    : null,
  product: discount.product ? productMapper(discount.product) : null,
  category: discount.category ? { id: discount.category.id, name: discount.category.name } : null,
  expiresAt: discount.expiresAt,
  createdAt: discount.created_at,
  updatedAt: discount.updated_at,
});
