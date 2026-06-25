import { CartContract, CartItemContract } from "@/contracts/cart";
import { productMapper } from "./product";
import { Prisma } from "@prisma/client";

type CartWithItems = Prisma.CartGetPayload<{
  include: { items: { include: { product: { include: { category: true } } } } }
}>;

type CartItemWithProduct = CartWithItems["items"][number];

export const mapCartItem = (cartItem: CartItemWithProduct): CartItemContract => ({
  id: cartItem.id,
  cartId: cartItem.cartId,
  productId: cartItem.productId,
  quantity: cartItem.quantity,
  size: cartItem.size,
  product: productMapper(cartItem.product),
  createdAt: cartItem.created_at,
  updatedAt: cartItem.updated_at,
});

export const cartMapper = (cart: CartWithItems): CartContract => ({
  id: cart.id,
  userId: cart.user_id,
  items: cart.items.map(mapCartItem),
  createdAt: cart.created_at,
  updatedAt: cart.updated_at,
});