import { NextResponse } from "next/server";
import AuthService from "@/services/auth.service";
import { errorHandler } from "@/lib/apiErrorHandler";

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const user = await AuthService.localSignup(body);

  return NextResponse.json(user, { status: 201 });
});