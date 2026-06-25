import { ProductContract } from "@/contracts/product";
import { Prisma } from "@prisma/client";
import CloudflareStorageServer from "@/services/cloudflare/storage";

export const productMapper = (product: Prisma.ProductGetPayload<{
  include: { category: true }
}>): ProductContract => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price,
  stock_count: product.stock_count,
  sales_count: product.sales_count,
  imageUrl: CloudflareStorageServer.generatePublicUrl(product.imageKey),
  thumbnails: product.thumbnailKeys.map(CloudflareStorageServer.generatePublicUrl),
  sizes: Array.isArray(product.sizes) ? product.sizes : [],
  category: product.category.name,
  createdAt: product.created_at,
  updatedAt: product.updated_at,
});