import { UserOrderContract, OrderItemContract, AdminOrderContract } from '@/contracts/order';
import { productMapper } from './product';
import { Prisma } from '@prisma/client';
import { userMapper } from './user';
import { ShippingMethod } from '@/types';

type UserOrderWithItems = Prisma.OrderGetPayload<{
  include: {
    orderItems: { include: { product: { include: { category: true } } } };
  };
}>;

export type AdminOrderWithUserAndItems = Prisma.OrderGetPayload<{
  include: {
    user: true;
    orderItems: { include: { product: { include: { category: true } } } };
  };
}>;

type OrderItemWithProduct = UserOrderWithItems['orderItems'][number];

export const mapOrderItem = (
  orderItem: OrderItemWithProduct,
): OrderItemContract => ({
  id: orderItem.id,
  orderId: orderItem.orderId,
  productId: orderItem.productId,
  quantity: orderItem.quantity,
  priceAtPurchase: orderItem.price_at_purchase,
  size: orderItem.size,
  product: productMapper(orderItem.product),
  createdAt: orderItem.created_at,
  updatedAt: orderItem.updated_at,
});

export const userOrderMapper = (
  order: UserOrderWithItems,
): UserOrderContract => ({
  id: order.id,
  userId: order.userId,
  totalAmount: order.totalAmount,
  streetAddress: order.street_address,
  city: order.city,
  state: order.state,
  zipCode: order.zip_code,
  country: order.country,
  contactName: order.contact_name,
  contactPhone: order.contact_phone,
  contactEmail: order.contact_email,
  paymentReference: order.payment_reference,
  note: order.note,
  adminNote: order.admin_note,
  status: order.status,
  shippingMethod: order.shippingMethod.toLowerCase() as ShippingMethod,
  orderItems: order.orderItems.map(mapOrderItem),
  shippedAt: order.shipped_at,
  deliveredAt: order.delivered_at,
  cancelledAt: order.cancelled_at,
  createdAt: order.created_at,
  updatedAt: order.updated_at,
});

export const adminOrderMapper = (
  order: AdminOrderWithUserAndItems,
): AdminOrderContract => ({
  ...userOrderMapper(order),
  user: userMapper(order.user),
});
