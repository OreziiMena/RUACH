import { errorHandler } from '@/lib/apiErrorHandler';
import CartService from '@/services/cart.service';
import { NextResponse } from 'next/server';

export const PUT = errorHandler(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const updatedCartItem = await CartService.updateCartItemQuantity({ ...body, productId: id });

  return NextResponse.json(updatedCartItem);
});

export const DELETE = errorHandler(async (req, { params }) => {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const size = searchParams.get('size');

  await CartService.removeItemFromCart(id!, size);

  return NextResponse.json({ message: 'Cart item removed successfully' });
});
