import { NextResponse } from "next/server";
import { errorHandler } from "@/lib/apiErrorHandler";
import UserService from "@/services/user.service";

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const { message } = await UserService.forgotPassword(body);

  return NextResponse.json({ message });
});