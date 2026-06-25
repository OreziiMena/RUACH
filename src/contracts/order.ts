import { OrderStatus } from '@prisma/client';
import { ProductContract } from './product';
import { UserContract } from './user';
import { ShippingMethod } from '@/types';

export interface OrderItemContract {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  size: string;

  product: ProductContract;

  createdAt: Date;
  updatedAt: Date;
}

export interface UserOrderContract {
  id: string;
  userId: string;
  totalAmount: number;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string | null;
  country: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  paymentReference: string | null;
  note: string | null;
  adminNote: string | null;
  status: OrderStatus;
  shippingMethod: ShippingMethod;
  orderItems: OrderItemContract[];

  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface AdminOrderContract extends UserOrderContract {
  user: UserContract;
}
