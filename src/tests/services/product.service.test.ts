import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authorizeUserMock: vi.fn(),
  countProductsMock: vi.fn(),
  createProductMock: vi.fn(),
  findProductBySlugMock: vi.fn(),
  findProductsMock: vi.fn(),
  updateProductMock: vi.fn(),
  createProductSchemaParseMock: vi.fn(),
  productMapperMock: vi.fn(),
  slugifyMock: vi.fn(),
  uuidv4Mock: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  default: {
    authorizeUser: mocks.authorizeUserMock,
  },
}));

vi.mock('@/repositories/product.repository', () => ({
  countProducts: mocks.countProductsMock,
  createProduct: mocks.createProductMock,
  findProductBySlug: mocks.findProductBySlugMock,
  findProducts: mocks.findProductsMock,
  updateProduct: mocks.updateProductMock,
}));

vi.mock('@/validationSchemas/product', () => ({
  createProductSchema: {
    parse: mocks.createProductSchemaParseMock,
  },
}));

vi.mock('@/mapper/product', () => ({
  productMapper: mocks.productMapperMock,
}));

vi.mock('slugify', () => ({
  default: mocks.slugifyMock,
}));

vi.mock('uuid', () => ({
  v4: mocks.uuidv4Mock,
}));

import ProductService from '@/services/product.service';
import { BadRequestError, NotFoundError } from '@/lib/errors';

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches paginated products with the expected filters', async () => {
    mocks.findProductsMock.mockResolvedValue([{ id: 'product-1' }]);
    mocks.countProductsMock.mockResolvedValue(1);
    mocks.productMapperMock.mockReturnValue({ id: 'product-1' });

    const result = await ProductService.getProducts({
      page: 2,
      limit: 5,
      search: 'shoe',
      categoryId: 3,
    });

    expect(mocks.findProductsMock).toHaveBeenCalledWith(
      {
        name: {
          contains: 'shoe',
          mode: 'insensitive',
        },
        categoryId: 3,
        deleted_at: null,
      },
      5,
      5,
      {
        created_at: 'desc',
      },
    );
    expect(result.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  it('throws when a product slug is missing', async () => {
    mocks.findProductBySlugMock.mockResolvedValue(null);

    await expect(ProductService.getProductBySlug('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('creates a product with a generated slug and connected category', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.createProductSchemaParseMock.mockReturnValue({
      name: 'Blue Shirt',
      description: 'A shirt',
      price: 25,
      categoryId: 4,
      sizes: ['M'],
      imageKey: 'products/blue-shirt.png',
      thumbnailKeys: ['products/blue-shirt-thumb.png'],
    });
    mocks.slugifyMock.mockReturnValue('blue-shirt');
    mocks.findProductBySlugMock.mockResolvedValue(null);
    mocks.createProductMock.mockResolvedValue({ id: 'product-1' });
    mocks.productMapperMock.mockReturnValue({ id: 'product-1' });

    await expect(
      ProductService.createNewProduct({
        name: 'Blue Shirt',
        description: 'A shirt',
        price: 25,
        categoryId: 4,
        sizes: ['M'],
        imageKey: 'products/blue-shirt.png',
        thumbnailKeys: ['products/blue-shirt-thumb.png'],
      } as never),
    ).resolves.toEqual({ id: 'product-1' });

    expect(mocks.createProductMock).toHaveBeenCalledWith({
      name: 'Blue Shirt',
      description: 'A shirt',
      price: 25,
      sizes: ['M'],
      imageKey: 'products/blue-shirt.png',
      thumbnailKeys: ['products/blue-shirt-thumb.png'],
      slug: 'blue-shirt',
      category: { connect: { id: 4 } },
    });
  });

  it('rejects duplicate product names', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.createProductSchemaParseMock.mockReturnValue({
      name: 'Blue Shirt',
      description: 'A shirt',
      price: 25,
      categoryId: 4,
      sizes: [],
      imageKey: 'products/blue-shirt.png',
      thumbnailKeys: [],
    });
    mocks.slugifyMock.mockReturnValue('blue-shirt');
    mocks.findProductBySlugMock.mockResolvedValue({ id: 'product-1' });

    await expect(
      ProductService.createNewProduct({
        name: 'Blue Shirt',
        description: 'A shirt',
        price: 25,
        categoryId: 4,
        sizes: [],
        imageKey: 'products/blue-shirt.png',
        thumbnailKeys: [],
      } as never),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('updates an existing product', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.createProductSchemaParseMock.mockReturnValue({
      name: 'Updated Shirt',
      description: 'Updated shirt',
      price: 30,
      categoryId: 5,
      sizes: ['L'],
      imageKey: 'products/updated-shirt.png',
      thumbnailKeys: ['products/updated-shirt-thumb.png'],
    });
    mocks.slugifyMock.mockReturnValue('updated-shirt');
    mocks.findProductBySlugMock.mockResolvedValue({ id: 'product-1', deleted_at: null });
    mocks.updateProductMock.mockResolvedValue({ id: 'product-1' });
    mocks.productMapperMock.mockReturnValue({ id: 'product-1' });

    await expect(
      ProductService.updateProduct('old-shirt', {
        name: 'Updated Shirt',
        description: 'Updated shirt',
        price: 30,
        categoryId: 5,
        sizes: ['L'],
        imageKey: 'products/updated-shirt.png',
        thumbnailKeys: ['products/updated-shirt-thumb.png'],
      } as never),
    ).resolves.toEqual({ id: 'product-1' });

    expect(mocks.updateProductMock).toHaveBeenCalledWith('old-shirt', {
      name: 'Updated Shirt',
      description: 'Updated shirt',
      price: 30,
      sizes: ['L'],
      imageKey: 'products/updated-shirt.png',
      thumbnailKeys: ['products/updated-shirt-thumb.png'],
      slug: 'updated-shirt',
      category: { connect: { id: 5 } },
    });
  });

  it('soft deletes a product by replacing the slug and timestamping it', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.uuidv4Mock.mockReturnValue('new-random-slug');

    await ProductService.deleteProduct('old-slug');

    expect(mocks.updateProductMock).toHaveBeenCalledWith('old-slug', {
      deleted_at: expect.any(Date),
      slug: 'new-random-slug',
    });
  });
});
