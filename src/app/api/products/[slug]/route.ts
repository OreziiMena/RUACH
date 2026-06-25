import { errorHandler } from '@/lib/apiErrorHandler';
import ProductService from '@/services/product.service';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (_, { params }) => {
  const { slug } = await params;

  const res = await ProductService.getProductBySlug(slug!);

  return NextResponse.json(res, { status: 200 });
});

export const PUT = errorHandler(async (req: Request, { params }) => {
  const { slug } = await params;
  const payload = await req.json();

  const res = await ProductService.updateProduct(slug!, payload);

  return NextResponse.json(res, { status: 200 });
});

export const DELETE = errorHandler(async (_, { params }) => {
  const { slug } = await params;

  await ProductService.deleteProduct(slug!);

  return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
});