import { errorHandler } from '@/lib/apiErrorHandler';
import OrderService from '@/services/order.service';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const res = await OrderService.getCurrentUserOrders({
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || 10),
    status: searchParams.get('status') || undefined
  });

  return NextResponse.json(res);
});

export const POST = errorHandler(async (req: Request) => {
  const body = await req.json();
  const url = await OrderService.createNewOrder(body);
  return NextResponse.json({ url }, { status: 201 });
});