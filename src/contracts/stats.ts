export interface DashboardStatsContract {
  totalCustomers: number;
  currentMonthCustomers: number;

  totalProducts: number;
  totalProductsSold: number;

  totalOrders: number;
  orderGrowth: number;

  totalRevenue: number;
  revenueGrowth: number;
}
