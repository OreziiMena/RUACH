import { NextResponse } from "next/server";
import OrderService from "@/services/order.service";
import { errorHandler } from "@/lib/apiErrorHandler";

export const GET = errorHandler(async (request, { params }) => {
  const { id } = await params;
  if (!id) {
    throw Object.assign(new Error('Order ID is required'), { status: 400 });
  }

  const url = await OrderService.initializePaymentForOrder(id);

  return NextResponse.json({ url });
});