import { errorHandler } from '@/lib/apiErrorHandler';
import OrderService from '@/services/order.service';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const res = await OrderService.getAllOrders({
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || 10),
    status: searchParams.get('status') || undefined
  });

  return NextResponse.json(res);
});
