import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/apiErrorHandler';
import DiscountService from '@/services/discount.service';

export const dynamic = 'force-dynamic';

export const GET = errorHandler(async (_, { params }) => {
  const { id } = await params;

  const discount = await DiscountService.fetchDiscountById(id!);

  return NextResponse.json(discount);
});

export const DELETE = errorHandler(async (request, { params }) => {
  const { id } = await params;

  await DiscountService.deleteDiscount(id!);

  return NextResponse.json({});
});
