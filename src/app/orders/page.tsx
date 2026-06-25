"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Search, ChevronDown, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { handleClientError } from "@/lib/clientErrorHandler";
import { UserOrderContract } from "@/contracts/order"; 
import styles from "./orders.module.css";
import { PagedResponse } from "@/contracts/response";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<UserOrderContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<PagedResponse<UserOrderContract>>("/api/orders");
        setOrders(response.data.data);
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getShippingDetails = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'within_port_harcourt':
        return { name: "Port Harcourt Delivery", fee: 5000 };
      case 'outside_port_harcourt_doors':
        return { name: "Door Delivery", fee: 20000 };
      case 'outside_port_harcourt_pickup':
        return { name: "Pickup", fee: 10000 };
      default:
        return { name: "Standard Shipping", fee: 0 };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.orderItems.some(item => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>My Orders</h1>
            <p className={styles.subtitle}>Track and manage your orders</p>
          </div>
          <div className={styles.orderCount}>
            <Package size={20} />
            <div className={styles.countText}>
              <span className={styles.countNumber}>{orders.length}</span> total<br />orders
            </div>
          </div>
        </header>

        <div className={styles.filtersCard}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by order ID or product name" 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className={styles.filterWrapper}>
            <div 
                className={styles.customSelectTrigger} 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <span>{statusFilter === "ALL" ? "All Orders" : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}</span>
                <ChevronDown size={16} className={`${styles.selectIcon} ${isDropdownOpen ? styles.iconOpen : ""}`} />
            </div>

            {isDropdownOpen && (
                <div className={styles.customSelectMenu}>
                {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                    <div 
                    key={status}
                    className={`${styles.customSelectOption} ${statusFilter === status ? styles.optionActive : ""}`}
                    onClick={() => {
                        setStatusFilter(status);
                        setIsDropdownOpen(false);
                    }}
                    >
                    {status === "ALL" ? "All Orders" : status.charAt(0) + status.slice(1).toLowerCase()}
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>Loading your orders...</div>
        ) : filteredOrders.length > 0 ? (
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => {
              const MAX_VISIBLE_ITEMS = 3;
              const visibleItems = order.orderItems.slice(0, MAX_VISIBLE_ITEMS);
              const remainingCount = order.orderItems.length - MAX_VISIBLE_ITEMS;

              return (
                <div key={order.id} className={styles.orderCard}>
                  
                  <div className={styles.cardHeader}>
                    <h2 className={styles.orderId}>Order #{order.id}</h2>
                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                      <Package size={14} />
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {formatDate(order.createdAt)}
                    </span>
                    <span className={styles.metaPrice}>{formatNaira(order.totalAmount)}</span>
                    <span className={styles.metaCount}>{order.orderItems.length} items</span>
                  </div>

                  {/* Horizontal Image Row Preview */}
                  {order.orderItems.length > 0 && (
                    <div className={styles.horizontalItemPreview}>
                      <div className={styles.imageRow}>
                        {visibleItems.map((item, index) => (
                          <div key={item.id || index} className={styles.miniImageWrapper}>
                            <Image 
                              src={item.product.imageUrl || "/placeholder.png"} 
                              alt={item.product.name}
                              fill
                              unoptimized
                              className={styles.miniImage}
                            />
                            {/* CHANGED: Always shows quantity badge */}
                            <span className={styles.qtyBadge}>x{item.quantity}</span>
                          </div>
                        ))}
                        
                        {remainingCount > 0 && (
                          <div className={styles.remainingBubble}>
                            +{remainingCount}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Link href={`/orders/${order.id}`} className={styles.viewDetailsBtn}>
                    <Eye size={16} /> View Details
                  </Link>

                  <div className={styles.shippingPreview}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                    <span>Shipping ({getShippingDetails(order.shippingMethod).name}): to {order.contactName}, {order.streetAddress}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}