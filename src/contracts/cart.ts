import { ProductContract } from "./product";

export interface CartItemContract {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  size: string;

  product: ProductContract;

  createdAt: Date;
  updatedAt: Date;
}

export interface CartContract {
  id: string;
  userId: string;
  items: CartItemContract[];

  createdAt: Date;
  updatedAt: Date;
}