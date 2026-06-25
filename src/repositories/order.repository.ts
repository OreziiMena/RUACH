import { prisma } from '@/lib/prisma';
import { OrderStatus, Prisma } from '@prisma/client';

const OrderItemInclude = {
  product: {
    include: {
      category: true,
    },
  },
};

const OrderInclude = {
  orderItems: {
    include: OrderItemInclude,
  },
};

const AdminOrderInclude = {
  user: true,
  orderItems: {
    include: OrderItemInclude,
  },
};

export const findOrders = async (
  isAdmin: boolean,
  where: Prisma.OrderWhereInput,
  skip: number,
  limit: number,
) => {
  return await prisma.order.findMany({
    where,
    include: isAdmin ? AdminOrderInclude : OrderInclude,
    skip,
    take: limit,
  });
};

export const findUniqueOrder = async (
  where: Prisma.OrderWhereUniqueInput,
  isAdmin: boolean,
) => {
  return await prisma.order.findUnique({
    where,
    include: isAdmin ? AdminOrderInclude : OrderInclude,
  });
};

export const countOrders = async (where: Prisma.OrderWhereInput) => {
  return await prisma.order.count({
    where,
  });
};

export const createOrder = async (data: Prisma.OrderCreateInput) => {
  return await prisma.order.create({
    data,
  });
};

export const createOrderItems = async (
  data: Prisma.OrderItemCreateManyInput[],
) => {
  return prisma.orderItem.createMany({
    data,
  });
};

export const updateOrderStatus = async (
  orderId: string,
  payload: { status: OrderStatus; note?: string; adminNote?: string },
) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: {
      status: payload.status,
      note: payload.note,
      admin_note: payload.adminNote,
    },
  });
};

export const updateOrderAdminNote = async (
  orderId: string,
  adminNote: string,
) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { admin_note: adminNote },
  });
};

export const deleteOrder = async (orderId: string) => {
  return await prisma.order.delete({
    where: { id: orderId },
  });
};
