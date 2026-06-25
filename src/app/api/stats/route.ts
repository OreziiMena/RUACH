import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/apiErrorHandler';
import DashboardService from '@/services/dashboard.service';

export const GET = errorHandler(async () => {
  const stats = await DashboardService.getStats();

  return NextResponse.json(stats);
});
