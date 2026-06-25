import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/apiErrorHandler';
import CategoryService from '@/services/category.service';

export const PUT = errorHandler(async (request, { params }) => {
  const _params = await params;
  const id = Number(_params.id);

  const body = await request.json();
  const category = await CategoryService.updateCategory(id, body);

  return NextResponse.json(category);
});

export const DELETE = errorHandler(async (request, { params }) => {
  const _params = await params;
  const id = Number(_params.id);

  await CategoryService.deleteCategory(id);

  return NextResponse.json({});
});
