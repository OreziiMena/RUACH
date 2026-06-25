import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/apiErrorHandler';
import UserService from '@/services/user.service';

export const PUT = errorHandler(async (request) => {
  const body = await request.json();
  const res = await UserService.updatePassword(body);

  return NextResponse.json(res);
});