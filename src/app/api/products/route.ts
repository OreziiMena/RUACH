import { errorHandler } from '@/lib/apiErrorHandler';
import ProductService from '@/services/product.service';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const res = await ProductService.getProducts({
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || 10),
    search: searchParams.get('search') || undefined,
    categoryId: searchParams.get('categoryId')
      ? Number(searchParams.get('categoryId'))
      : undefined,
    orderBy: searchParams.get('orderBy') || 'createdAt',
  });

  return NextResponse.json(res, { status: 200 });
});

export const POST = errorHandler(async (req: Request) => {
  const payload = await req.json();

  const res = await ProductService.createNewProduct(payload);

  return NextResponse.json(res, { status: 201 });
});