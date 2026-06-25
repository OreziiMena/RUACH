import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const CartItemInclude = {
  product: {
    include: {
      category: true,
    },
  },
};

const Cartinclude = {
  items: {
    include: CartItemInclude,
  },
};

export const findCartByUserId = async (userId: string) => {
  const existingCart = await prisma.cart.findUnique({
    where: { user_id: userId },
    include: Cartinclude,
  });

  if (existingCart) {
    return existingCart;
  }

  const newCart = await prisma.cart.create({
    data: {
      user: { connect: { id: userId } },
    },
    include: Cartinclude,
  });

  return newCart;
};

export const createCartItem = async (cartId: string, productId: string, data: Prisma.CartItemCreateInput) => {
  const cartItem = await prisma.cartItem.create({
    data,
    include: CartItemInclude,
  });

  return cartItem;
};

export const updateCartItemQuantity = async (cartItemId: string, data: Prisma.CartItemUpdateInput) => {
  const updatedCartItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data,
    include: CartItemInclude,
  });

  return updatedCartItem;
};

export const deleteCartItem = async (cartItemId: string) => {
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
};

