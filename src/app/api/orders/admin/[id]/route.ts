import { errorHandler } from '@/lib/apiErrorHandler';
import OrderService from '@/services/order.service';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (_, { params }) => {
  const { id } = await params;
  if (!id) {
    throw Object.assign(new Error('Order ID is required'), { status: 400 });
  }
  const data = await OrderService.getOrderById(id);

  return NextResponse.json(data);
});

export const PATCH = errorHandler(async (request, { params }) => {
  const { id } = await params;
  if (!id) {
    throw Object.assign(new Error('Order ID is required'), { status: 400 });
  }
  const payload = await request.json();

  await OrderService.adminUpdateOrder(id, payload);
  return NextResponse.json({ message: 'Order updated successfully' });
});
