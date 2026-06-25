"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, Package, Users, TrendingUp, 
  Plus, BarChart2, Settings, Eye, Tag,
  DollarSign,
  List
} from "lucide-react";
import styles from "./admin.module.css";
import { DashboardStatsContract } from "@/contracts/stats";
import { PagedResponse } from "@/contracts/response";
import { AdminOrderContract } from "@/contracts/order";
import { handleClientError } from "@/lib/clientErrorHandler";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminDashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<AdminOrderContract[]>([]);
  const [stats, setStats] = useState<DashboardStatsContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const fetchAdminData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          axios.get<DashboardStatsContract>("/api/stats"),
          axios.get<PagedResponse<AdminOrderContract>>("/api/orders/admin?limit=5")
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data.data);
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [authStatus]);

  if (authStatus === "loading" || isLoading) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', paddingTop: '10rem' }}>
        <p style={{ color: '#a1a1aa' }}>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
          </div>
        </header>

        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Revenue</span>
              <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <h2 className={styles.kpiValue}>₦{stats?.totalRevenue || 0}</h2>
            <p className={styles.kpiTrend}>
              <TrendingUp size={14} /> +{stats?.revenueGrowth || 0}% from last month
            </p>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Orders</span>
              <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <ShoppingCart size={20} />
              </div>
            </div>
            <h2 className={styles.kpiValue}>{stats?.totalOrders || 0}</h2>
            <p className={styles.kpiTrend}>
              <TrendingUp size={14} /> +{stats?.orderGrowth || 0}% from last month
            </p>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Products</span>
              <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                <Package size={20} />
              </div>
            </div>
            <h2 className={styles.kpiValue}>{stats?.totalProducts || 0}</h2>
            <p className={styles.kpiSubtext}>{stats?.totalProductsSold || 0} sold</p>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Customers</span>
              <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
                <Users size={20} />
              </div>
            </div>
            <h2 className={styles.kpiValue}>{stats?.totalCustomers || 0}</h2>
            <p className={styles.kpiSubtext}>+{stats?.currentMonthCustomers || 0} new this month</p>
          </div>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.quickActionsGrid}>
            <Link href="/admin/products/new" className={styles.actionBtn}>
              <Plus size={18} /> Add New Product
            </Link>
            <Link href="/admin/discounts" className={styles.actionBtnSecondary}>
              <Tag size={18} /> Manage Discounts
            </Link>
            <Link href="/admin/orders" className={styles.actionBtnSecondary}>
              <Package size={18} /> Manage Orders
            </Link>
          </div>
        </section>

        <div className={styles.mainSplit}>
          <section className={styles.section}>
            <Link className={styles.sectionHeader} href="/admin/orders">
              <h3 className={styles.sectionTitle}>Recent Orders</h3>
              <button className={styles.viewAllBtn}><Eye size={16} /> View All</button>
            </Link>

            <div className={styles.ordersList}>
              {orders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#a1a1aa', border: '1px solid #27272a', borderRadius: '8px' }}>
                  No recent orders found.
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderInfo}>
                      <p className={styles.orderId}>#{String(order.id).slice(-8).toUpperCase()}</p>
                      <p className={styles.orderCustomer}>{order.user.name} • {order.orderItems.length} items</p>
                    </div>
                    
                    <div className={styles.orderMeta}>
                      <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                        {order.status}
                      </span>
                      <p className={styles.orderTotal}>{formatNaira(order.totalAmount)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Admin Tools</h3>
            <div className={styles.toolsGrid}>
              <Link href="/admin/orders" className={styles.toolCard}>
                <ShoppingCart size={24} className={styles.toolIcon} />
                <span>Orders</span>
              </Link>
              <Link href="/admin/products" className={styles.toolCard}>
                <Package size={24} className={styles.toolIcon} />
                <span>Products</span>
              </Link>
              <Link href="/admin/discounts" className={styles.toolCard}>
                <Tag size={24} className={styles.toolIcon} />
                <span>Discounts</span>
              </Link>
              <Link href="/admin/categories" className={styles.toolCard}>
                <List size={24} className={styles.toolIcon} />
                <span>Categories</span>
              </Link>
              
            </div>
          </section>
        </div>
      </div>
  );
}