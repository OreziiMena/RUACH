import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/apiErrorHandler';
import UserService from '@/services/user.service';

export const GET = errorHandler(async () => {
  const user = await UserService.getProfile();

  return NextResponse.json(user);
});

export const PUT = errorHandler(async (request) => {
  const body = await request.json();
  const updatedUser = await UserService.updateProfile(body);
  return NextResponse.json(updatedUser);
});
