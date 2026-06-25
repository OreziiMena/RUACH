import { ProductContract } from '@/contracts/product';
import { PagedResponse } from '@/contracts/response';
import { BadRequestError, NotFoundError } from '@/lib/errors';
import { productMapper } from '@/mapper/product';
import {
  countProducts,
  createProduct,
  findProductBySlug,
  findProducts,
  updateProduct as _updateProduct,
} from '@/repositories/product.repository';
import { createProductSchema } from '@/validationSchemas/product';
import { Prisma } from '@prisma/client';
import z from 'zod';
import slugify from 'slugify';
import AuthService from './auth.service';
import { v4 as uuidv4 } from 'uuid';
import { pageResponseMapper } from '@/mapper/pagedResponse';

interface GetProductParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  orderBy?: string;
}

class ProductService {
  private static orderMapping: Record<string, Prisma.ProductOrderByWithRelationInput> = {
    name: { name: 'asc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    popularity: { sales_count: 'desc' },
    createdAt: { created_at: 'desc' },
  };

  static async getProducts(
    payload: GetProductParams,
  ): Promise<PagedResponse<ProductContract>> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      orderBy = 'createdAt',
    } = payload;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
      ...(categoryId && { categoryId }),

      deleted_at: null,
    };

    const orderByClause = this.orderMapping[orderBy] || { created_at: 'desc' };

    const [products, total] = await Promise.all([
      findProducts(where, skip, limit, orderByClause),
      countProducts(where),
    ]);

    return pageResponseMapper({
      data: products.map(productMapper),
      page,
      limit,
      total,
    });
  }

  static async getProductBySlug(slug: string): Promise<ProductContract> {
    const product = await findProductBySlug(slug);
    if (!product || product.deleted_at) {
      throw new NotFoundError('Product not found');
    }
    return productMapper(product);
  }

  static async createNewProduct(
    payload: z.infer<typeof createProductSchema>,
  ): Promise<ProductContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const { categoryId, ...data } = createProductSchema.parse(payload);
    const slug = slugify(data.name, { lower: true, strict: true });

    const existingProduct = await findProductBySlug(slug);
    if (existingProduct)
      throw new BadRequestError('Product with the same name already exists');

    const product = await createProduct({
      ...data,
      slug,

      category: { connect: { id: categoryId } },
    });

    return productMapper(product);
  }

  static async updateProduct(
    slug: string,
    payload: z.infer<typeof createProductSchema>,
  ): Promise<ProductContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const { categoryId, ...data } = createProductSchema.parse(payload);
    const newSlug = slugify(data.name, { lower: true, strict: true });

    const existingProduct = await findProductBySlug(slug);
    if (!existingProduct || existingProduct.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    const product = await _updateProduct(slug, {
      ...data,
      slug: newSlug,

      category: { connect: { id: categoryId } },
    });

    return productMapper(product);
  }

  static async deleteProduct(slug: string): Promise<void> {
    await AuthService.authorizeUser(['ADMIN']);

    await _updateProduct(slug, {
      deleted_at: new Date(),
      slug: uuidv4(), // Change slug to a random value to prevent conflicts with future products
    });

    return;
  }

  static async updateSoldProduct(
    slug: string,
    quantityChange: number,
  ): Promise<void> {
    await _updateProduct(slug, {
      stock_count: { increment: quantityChange },
      sales_count: { increment: -quantityChange },
    });

    return;
  }
}

export default ProductService;
