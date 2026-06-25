import { DashboardStatsContract } from '@/contracts/stats';
import { prisma } from '@/lib/prisma';
import { OrderStatus, Role } from '@prisma/client';
import AuthService from './auth.service';

class DashboardService {
  static async getStats(): Promise<DashboardStatsContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const excludeFromRevenue = ['CANCELLED', 'PENDING'] as OrderStatus[];

    const [
      totalCustomers,
      currentMonthCustomers,
      totalProducts,
      totalProductsSoldAgg,
      totalOrders,
      currentMonthOrders,
      lastMonthOrders,
      totalRevenueAgg,
      currentMonthRevenueAgg,
      lastMonthRevenueAgg,
    ] = await Promise.all([
      // Total customers
      prisma.user.count({
        where: {
          role: Role.USER,
        },
      }),

      // Current month customers
      prisma.user.count({
        where: {
          role: Role.USER,
          createdAt: { gte: currentMonthStart },
        },
      }),

      // Total Products
      prisma.product.count({ where: { deleted_at: null } }),

      // Total Product Sold
      prisma.product.aggregate({
        _sum: { sales_count: true },
      }),

      // Total Orders
      prisma.order.count(),

      // Current Month Orders
      prisma.order.count({
        where: {
          created_at: { gte: currentMonthStart },
        },
      }),

      // Last month Orders
      prisma.order.count({
        where: {
          created_at: { gte: lastMonthStart, lt: lastMonthEnd },
        },
      }),

      // Total Revenue
      prisma.order.aggregate({
        where: { status: { notIn: excludeFromRevenue } },
        _sum: { totalAmount: true },
      }),

      // Current month revenue
      prisma.order.aggregate({
        where: {
          status: { notIn: excludeFromRevenue },
          created_at: { gte: currentMonthStart },
        },
        _sum: { totalAmount: true },
      }),

      // Last month revenue
      prisma.order.aggregate({
        where: {
          status: { notIn: excludeFromRevenue },
          created_at: { gte: lastMonthStart, lt: lastMonthEnd },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalProductsSold = totalProductsSoldAgg._sum?.sales_count ?? 0;

    const currentRevenue = currentMonthRevenueAgg._sum?.totalAmount ?? 0;
    const lastRevenue = lastMonthRevenueAgg._sum?.totalAmount ?? 0;

    const totalRevenue = totalRevenueAgg._sum?.totalAmount ?? 0;
    const revenueGrowth =
      lastRevenue > 0
        ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    const orderGrowth =
      lastMonthOrders > 0
        ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : currentMonthOrders > 0
          ? 100
          : 0;

    return {
      totalCustomers,
      currentMonthCustomers,
      totalProducts,
      totalProductsSold,
      totalOrders,
      orderGrowth,
      totalRevenue,
      revenueGrowth,
    };
  }
}

export default DashboardService;
