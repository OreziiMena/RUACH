import { NextResponse } from "next/server";
import { errorHandler } from "@/lib/apiErrorHandler";
import CartService from "@/services/cart.service";

export const GET = errorHandler(async () => {
  const cart = await CartService.getUserCart();

  return NextResponse.json(cart);
});

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const cartItem = await CartService.addItemToCart(body);

  return NextResponse.json(cartItem);
});
