import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/apiErrorHandler';
import UserService from '@/services/user.service';

export const dynamic = 'force-dynamic';

export const GET = errorHandler(async (_, { params }) => {
  const _params = await params;
  const user = await UserService.getUserProfile(_params.id!);

  return NextResponse.json(user);
});
