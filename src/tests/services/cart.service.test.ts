import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authorizeUserMock: vi.fn(),
  findCartByUserIdMock: vi.fn(),
  createCartItemMock: vi.fn(),
  updateCartItemQuantityMock: vi.fn(),
  deleteCartItemMock: vi.fn(),
  createCartItemSchemaParseMock: vi.fn(),
  updateCartItemSchemaParseMock: vi.fn(),
  cartMapperMock: vi.fn(),
  mapCartItemMock: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  default: {
    authorizeUser: mocks.authorizeUserMock,
  },
}));

vi.mock('@/repositories/cart.repository', () => ({
  findCartByUserId: mocks.findCartByUserIdMock,
  createCartItem: mocks.createCartItemMock,
  updateCartItemQuantity: mocks.updateCartItemQuantityMock,
  deleteCartItem: mocks.deleteCartItemMock,
}));

vi.mock('@/validationSchemas/cart', () => ({
  createCartItemSchema: {
    parse: mocks.createCartItemSchemaParseMock,
  },
  updateCartItemSchema: {
    parse: mocks.updateCartItemSchemaParseMock,
  },
}));

vi.mock('@/mapper/cart', () => ({
  cartMapper: mocks.cartMapperMock,
  mapCartItem: mocks.mapCartItemMock,
}));

import CartService from '@/services/cart.service';
import { NotFoundError } from '@/lib/errors';

describe('CartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the current user cart', async () => {
    const cart = { id: 'cart-1', user_id: 'user-1', items: [] };

    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findCartByUserIdMock.mockResolvedValue(cart);
    mocks.cartMapperMock.mockReturnValue({ id: 'cart-1' });

    await expect(CartService.getUserCart()).resolves.toEqual({ id: 'cart-1' });

    expect(mocks.findCartByUserIdMock).toHaveBeenCalledWith('user-1');
    expect(mocks.cartMapperMock).toHaveBeenCalledWith(cart);
  });

  it('adds an item to the authenticated user cart', async () => {
    const cart = { id: 'cart-1', user_id: 'user-1', items: [] };
    const createdCartItem = { id: 'item-1' };

    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.createCartItemSchemaParseMock.mockReturnValue({
      productId: 'product-1',
      quantity: 2,
      size: 'M',
    });
    mocks.findCartByUserIdMock.mockResolvedValue(cart);
    mocks.createCartItemMock.mockResolvedValue(createdCartItem);
    mocks.mapCartItemMock.mockReturnValue({ id: 'item-1' });

    await expect(
      CartService.addItemToCart({
        productId: 'product-1',
        quantity: 2,
        size: 'M',
      } as never),
    ).resolves.toEqual({ id: 'item-1' });

    expect(mocks.createCartItemMock).toHaveBeenCalledWith('cart-1', 'product-1', {
      quantity: 2,
      size: 'M',
      cart: { connect: { id: 'cart-1' } },
      product: { connect: { id: 'product-1' } },
    });
    expect(mocks.mapCartItemMock).toHaveBeenCalledWith(createdCartItem);
  });

  it('updates the quantity of an existing cart item', async () => {
    const cart = {
      id: 'cart-1',
      user_id: 'user-1',
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          size: 'L',
        },
      ],
    };
    const updatedCartItem = { id: 'item-1', quantity: 5 };

    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.updateCartItemSchemaParseMock.mockReturnValue({
      productId: 'product-1',
      quantity: 5,
      size: 'L',
    });
    mocks.findCartByUserIdMock.mockResolvedValue(cart);
    mocks.updateCartItemQuantityMock.mockResolvedValue(updatedCartItem);
    mocks.mapCartItemMock.mockReturnValue({ id: 'item-1', quantity: 5 });

    await expect(
      CartService.updateCartItemQuantity({
        productId: 'product-1',
        quantity: 5,
        size: 'L',
      } as never),
    ).resolves.toEqual({ id: 'item-1', quantity: 5 });

    expect(mocks.updateCartItemQuantityMock).toHaveBeenCalledWith('item-1', {
      quantity: 5,
    });
    expect(mocks.mapCartItemMock).toHaveBeenCalledWith(updatedCartItem);
  });

  it('creates a cart item when updating a cart item that does not exist', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.updateCartItemSchemaParseMock.mockReturnValue({
      productId: 'product-1',
      quantity: 5,
      size: 'L',
    });
    mocks.findCartByUserIdMock.mockResolvedValue({
      id: 'cart-1',
      user_id: 'user-1',
      items: [],
    });
    mocks.createCartItemMock.mockResolvedValue({ id: 'item-1', quantity: 5 });
    mocks.mapCartItemMock.mockReturnValue({ id: 'item-1', quantity: 5 });

    await expect(
      CartService.updateCartItemQuantity({
        productId: 'product-1',
        quantity: 5,
        size: 'L',
      } as never),
    ).resolves.toEqual({ id: 'item-1', quantity: 5 });

    expect(mocks.createCartItemMock).toHaveBeenCalledWith('cart-1', 'product-1', {
      quantity: 5,
      size: 'L',
      cart: { connect: { id: 'cart-1' } },
      product: { connect: { id: 'product-1' } },
    });
  });

  it('removes an existing item from the cart', async () => {
    const cart = {
      id: 'cart-1',
      user_id: 'user-1',
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          size: 'M',
        },
      ],
    };

    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findCartByUserIdMock.mockResolvedValue(cart);

    await expect(CartService.removeItemFromCart('product-1', 'M')).resolves.toBeUndefined();

    expect(mocks.deleteCartItemMock).toHaveBeenCalledWith('item-1');
  });

  it('throws when removing a missing cart item', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findCartByUserIdMock.mockResolvedValue({
      id: 'cart-1',
      user_id: 'user-1',
      items: [],
    });

    await expect(CartService.removeItemFromCart('product-1', 'M')).rejects.toBeInstanceOf(NotFoundError);
  });
});
