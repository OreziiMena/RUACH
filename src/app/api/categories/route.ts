import { NextResponse } from "next/server";
import { errorHandler } from "@/lib/apiErrorHandler";
import CategoryService from "@/services/category.service";

export const GET = errorHandler(async () => {
  const categories = await CategoryService.fetchAllCategories();

  return NextResponse.json(categories);
});

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const category = await CategoryService.createNewCategory(body);

  return NextResponse.json(category)
})