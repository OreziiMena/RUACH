import { NextResponse } from "next/server";
import { errorHandler } from "@/lib/apiErrorHandler";
import DiscountService from "@/services/discount.service";

export const GET = errorHandler(async () => {
  const discounts = await DiscountService.fetchAllDiscounts();

  return NextResponse.json(discounts);
});

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const discount = await DiscountService.createNewDiscount(body);

  return NextResponse.json(discount, { status: 201 });
});