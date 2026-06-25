"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Package, MapPin, Eye, Edit, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { handleClientError } from "@/lib/clientErrorHandler";
import styles from "./adminOrders.module.css";

type PageItem = number | "...";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [openStatusEditDropdownId, setOpenStatusEditDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/orders/admin?limit=${limit}&page=${page}`);
      setOrders(response.data?.data || response.data || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleSaveUpdate = async (orderId: string) => {
    try {
      setIsSaving(true);
      await axios.patch(`/api/orders/admin/${orderId}`, {
        status: editStatus,
        note: editNote
      });
      setEditingOrderId(null);
      setOpenStatusEditDropdownId(null);
      await fetchOrders(currentPage);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (order: any) => {
    setEditingOrderId(order.id);
    setEditStatus(order.status);
    setEditNote(order.admin_note || order.adminNote || "");
    setOpenStatusEditDropdownId(null);
  };

  const visiblePages = (): PageItem[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const pages: PageItem[] = [1];
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    if (startPage > 2) pages.push("...");
    for (let page = startPage; page <= endPage; page += 1) pages.push(page);
    if (endPage < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.contactName && order.contactName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatNaira = (amount: number) => {
    const validAmount = amount || 0;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(validAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB');
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

  const getStatusLabel = (statusValue: string) => {
    return STATUS_OPTIONS.find(opt => opt.value === statusValue)?.label || statusValue;
  };

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Manage Orders</h1>
            <p className={styles.subtitle}>Review and update customer orders</p>
          </div>
          <div className={styles.orderCount}>
            <Package size={20} />
            <span className={styles.countNumber}>{orders.length}</span>
            <span className={styles.countText}>orders </span>
          </div>
        </header>

        <div className={styles.filtersCard}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterWrapper}>
            <div
              className={styles.customSelectTrigger}
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            >
              <span>{getStatusLabel(statusFilter)}</span>
              <ChevronDown size={16} className={`${styles.selectIcon} ${isFilterDropdownOpen ? styles.iconOpen : ""}`} />
            </div>

            {isFilterDropdownOpen && (
              <div className={styles.customSelectMenu}>
                {STATUS_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`${styles.customSelectOption} ${statusFilter === option.value ? styles.optionActive : ""}`}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setIsFilterDropdownOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>No orders found matching your criteria.</div>
        ) : (
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => {
              const isEditing = editingOrderId === order.id;
              const isStatusMenuOpen = openStatusEditDropdownId === order.id;

              return (
                <article key={order.id} className={styles.orderCard}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.orderId}>
                      Order #{order.id.split('-')[0].toUpperCase()}
                    </h2>

                    {isEditing ? (
                      <div className={styles.editStatusWrapper}>
                        <div
                          className={styles.customSelectTrigger}
                          style={{ padding: '0.5rem 1rem', background: '#1a1a1a', minWidth: '140px' }}
                          onClick={() => setOpenStatusEditDropdownId(isStatusMenuOpen ? null : order.id)}
                        >
                          <span>{getStatusLabel(editStatus)}</span>
                          <ChevronDown size={16} className={`${styles.selectIcon} ${isStatusMenuOpen ? styles.iconOpen : ""}`} />
                        </div>

                        {isStatusMenuOpen && (
                          <div className={styles.customSelectMenu} style={{ top: 'calc(100% + 4px)', zIndex: 100 }}>
                            {STATUS_OPTIONS.map((option) => (
                              <div
                                key={option.value}
                                className={`${styles.customSelectOption} ${editStatus === option.value ? styles.optionActive : ""}`}
                                onClick={() => {
                                  setEditStatus(option.value);
                                  setOpenStatusEditDropdownId(null);
                                }}
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                        <Package size={14} />
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>

                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                      📅 {formatDate(order.createdAt || order.created_at)}
                    </span>
                    <span className={`${styles.metaItem} ${styles.metaPrice}`}>
                      {formatNaira(order.totalAmount)}
                    </span>
                    <span className={styles.metaItem}>
                      {order.orderItems?.length || 0} items
                    </span>
                  </div>

                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{order.contactName}</span>
                    <span>{order.contactEmail}</span>
                  </div>

                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className={styles.itemsListPreview}>
                      {order.orderItems.map((item: any) => {
                        const itemImage = item.product?.imageUrl || item.product?.image || "/placeholder.png";
                        return (
                          <div key={item.id} className={styles.itemPreview}>
                            <div className={styles.itemImageWrapper}>
                              <Image
                                src={itemImage}
                                alt={item.product?.name || "Product"}
                                fill
                                unoptimized
                                className={styles.itemImage}
                              />
                            </div>
                            <div className={styles.itemDetails}>
                              <h3 className={styles.itemName}>{item.product?.name}</h3>
                              <p className={styles.itemQty}>Qty: {item.quantity} | Size: {item.size || "N/A"}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isEditing && (
                    <div className={styles.editSection}>
                      <label className={styles.editLabel}>Admin Note</label>
                      <textarea
                        className={styles.noteInput}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Add internal notes here..."
                        rows={3}
                      />
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    {isEditing ? (
                      <div className={styles.editActionButtons}>
                        <button
                          className={styles.cancelEditBtn}
                          onClick={() => {
                            setEditingOrderId(null);
                            setOpenStatusEditDropdownId(null);
                          }}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.saveBtn}
                          onClick={() => handleSaveUpdate(order.id)}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save Updates"}
                        </button>
                      </div>
                    ) : (
                      <button className={styles.startEditBtn} onClick={() => startEditing(order)}>
                        <Edit size={16} /> Quick Update
                      </button>
                    )}

                    <Link href={`/admin/orders/${order.id}`} className={styles.viewDetailsBtn}>
                      <Eye size={16} /> View Full Details
                    </Link>
                  </div>

                  <div className={styles.shippingPreview}>
                    <MapPin size={16} />
                    <span>Shipping ({getShippingDetails(order.shippingMethod).name}): to {order.contactName}, {order.streetAddress}, {order.city}</span>
                  </div>

                  {!isEditing && (order.admin_note || order.adminNote) && (
                    <div className={styles.existingNote}>
                      <strong>Admin Note:</strong> {order.admin_note || order.adminNote}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {totalPages > 1 && !isLoading && (
          <nav className={styles.pagination} aria-label="Orders pages">
            <button
              type="button"
              className={styles.paginationButton}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <div className={styles.paginationNumbers}>
              {visiblePages().map((page, index) => {
                if (page === "...") {
                  return (
                    <span key={`ellipsis-${index}`} className={styles.paginationEllipsis}>
                      ...
                    </span>
                  );
                }
                const pageNumber = page;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    className={pageNumber === currentPage ? styles.paginationButtonActive : styles.paginationButton}
                    onClick={() => setCurrentPage(pageNumber)}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.paginationButton}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}