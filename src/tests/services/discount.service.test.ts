import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authorizeUserMock: vi.fn(),
  createDiscountMock: vi.fn(),
  deleteDiscountMock: vi.fn(),
  getAllDiscountsMock: vi.fn(),
  getDiscountByIdMock: vi.fn(),
  discountMapperMock: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  default: {
    authorizeUser: mocks.authorizeUserMock,
  },
}));

vi.mock('@/repositories/discount.repository', () => ({
  createDiscount: mocks.createDiscountMock,
  deleteDiscount: mocks.deleteDiscountMock,
  getAllDiscounts: mocks.getAllDiscountsMock,
  getDiscountById: mocks.getDiscountByIdMock,
}));

vi.mock('@/mapper/discount', () => ({
  discountMapper: mocks.discountMapperMock,
}));

import DiscountService from '@/services/discount.service';
import { NotFoundError } from '@/lib/errors';

describe('DiscountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and maps all discounts', async () => {
    mocks.getAllDiscountsMock.mockResolvedValue([{ id: 'discount-1' }]);
    mocks.discountMapperMock.mockReturnValue({ id: 'discount-1' });

    await expect(DiscountService.fetchAllDiscounts()).resolves.toEqual([{ id: 'discount-1' }]);
  });

  it('fetches a discount by id', async () => {
    mocks.getDiscountByIdMock.mockResolvedValue({ id: 'discount-1' });
    mocks.discountMapperMock.mockReturnValue({ id: 'discount-1' });

    await expect(DiscountService.fetchDiscountById('discount-1')).resolves.toEqual({ id: 'discount-1' });
  });

  it('throws when a discount is missing', async () => {
    mocks.getDiscountByIdMock.mockResolvedValue(null);

    await expect(DiscountService.fetchDiscountById('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('creates a discount for admins', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.createDiscountMock.mockResolvedValue({ id: 'discount-1' });
    mocks.discountMapperMock.mockReturnValue({ id: 'discount-1' });

    await expect(
      DiscountService.createNewDiscount({
        title: 'Summer Sale',
        description: 'Sale',
        percentage: 20,
        productId: 'product-1',
        expiresAt: new Date('2026-06-01T00:00:00.000Z'),
        imageKey: 'discounts/sale.png',
      } as never),
    ).resolves.toEqual({ id: 'discount-1' });

    expect(mocks.createDiscountMock).toHaveBeenCalledWith({
      title: 'Summer Sale',
      description: 'Sale',
      percentage: 20,
      expiresAt: new Date('2026-06-01T00:00:00.000Z'),
      imageKey: 'discounts/sale.png',
      productIds: [],
      product: {
        connect: { id: 'product-1' },
      },
    });
  });

  it('creates a global discount without a product connection', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.createDiscountMock.mockResolvedValue({ id: 'discount-1' });
    mocks.discountMapperMock.mockReturnValue({ id: 'discount-1' });

    await expect(
      DiscountService.createNewDiscount({
        title: 'Global Sale',
        description: 'Sale',
        percentage: 20,
        productId: null,
        expiresAt: new Date('2026-06-01T00:00:00.000Z'),
        imageKey: 'discounts/sale.png',
      } as never),
    ).resolves.toEqual({ id: 'discount-1' });

    expect(mocks.createDiscountMock).toHaveBeenCalledWith({
      title: 'Global Sale',
      description: 'Sale',
      percentage: 20,
      expiresAt: new Date('2026-06-01T00:00:00.000Z'),
      imageKey: 'discounts/sale.png',
      productIds: [],
    });
  });

  it('deletes a discount for admins', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });

    await DiscountService.deleteDiscount('discount-1');

    expect(mocks.deleteDiscountMock).toHaveBeenCalledWith('discount-1');
  });
});
