import { cartMapper, mapCartItem } from '@/mapper/cart';
import {
  createCartItem,
  deleteCartItem,
  findCartByUserId,
  updateCartItemQuantity,
} from '@/repositories/cart.repository';
import AuthService from './auth.service';
import { CartContract, CartItemContract } from '@/contracts/cart';
import {
  createCartItemSchema,
  updateCartItemSchema,
} from '@/validationSchemas/cart';
import z from 'zod';
import { BadRequestError, NotFoundError } from '@/lib/errors';

class CartService {
  static async getUserCart(): Promise<CartContract> {
    const user = await AuthService.authorizeUser();
    const cart = await findCartByUserId(user.id);
    return cartMapper(cart);
  }

  static async addItemToCart(
    data: z.infer<typeof createCartItemSchema>,
  ): Promise<CartItemContract> {
    const user = await AuthService.authorizeUser();

    const { productId, quantity, size } = createCartItemSchema.parse(data);
    const cart = await findCartByUserId(user.id);

    if (
      cart.items.some(
        (item) => item.productId === productId && item.size === size,
      )
    ) {
      throw new BadRequestError(
        'Product variant already in cart. Use update to change quantity.',
      );
    }

    const cartItem = await createCartItem(cart.id, productId, {
      quantity,
      size,
      cart: { connect: { id: cart.id } },
      product: { connect: { id: productId } },
    });
    return mapCartItem(cartItem);
  }

  static async updateCartItemQuantity(
    data: z.infer<typeof updateCartItemSchema>,
  ): Promise<CartItemContract> {
    const user = await AuthService.authorizeUser();

    const { quantity, size, productId } = updateCartItemSchema.parse(data);
    const cart = await findCartByUserId(user.id);
    const cartItem = cart.items.find(
      (item) => item.productId === productId && item.size === size,
    );
    if (!cartItem) {
      const cartItem = await createCartItem(cart.id, productId, {
        quantity,
        size,
        cart: { connect: { id: cart.id } },
        product: { connect: { id: productId } },
      });
      return mapCartItem(cartItem);
    }

    const updatedCartItem = await updateCartItemQuantity(cartItem.id, {
      quantity,
    });
    return mapCartItem(updatedCartItem);
  }

  static async removeItemFromCart(
    productId: string,
    size: string | null,
  ): Promise<void> {
    if (!size) throw new BadRequestError('Product size not in request');
    const user = await AuthService.authorizeUser();
    const cart = await findCartByUserId(user.id);
    const cartItem = cart.items.find(
      (item) => item.productId === productId && item.size === size,
    );
    if (!cartItem) {
      throw new NotFoundError('Product variant not found in cart');
    }

    await deleteCartItem(cartItem.id);
    return;
  }

  static async clearCartItems(items: CartItemContract[]): Promise<void> {
    const deletePromises = items.map((item) => deleteCartItem(item.id));
    await Promise.all(deletePromises);
  }
}

export default CartService;
