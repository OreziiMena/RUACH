"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Tag, Trash2, Plus, Calendar, Percent } from "lucide-react";
import { toast } from "sonner";
import { handleClientError } from "@/lib/clientErrorHandler";
import { DiscountContract } from "@/contracts/discounts";
import styles from "../admin.module.css";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminDiscountList() {
  const [discounts, setDiscounts] = useState<DiscountContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Custom modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get<DiscountContract[]>("/api/discounts");
      setDiscounts(response.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleDeleteClick = (id: string, title: string) => {
    setDiscountToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!discountToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/discounts/${discountToDelete.id}`);
      toast.success(`Discount "${discountToDelete.title}" deleted successfully!`);
      setDiscounts((prev) => prev.filter((d) => d.id !== discountToDelete.id));
      setIsDeleteModalOpen(false);
      setDiscountToDelete(null);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ textAlign: "left" }}>
          <h1 className={styles.title} style={{ marginBottom: "0.25rem" }}>Discounts & Sales</h1>
          <p className={styles.subtitle}>Manage active global and product-specific discounts</p>
        </div>
        <Link href="/admin/discounts/new" className={styles.actionBtn} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={18} /> Create Discount
        </Link>
      </header>

      {isLoading ? (
        <div className={styles.container} style={{ textAlign: "center", padding: "5rem 0" }}>
          <p style={{ color: "#a1a1aa" }}>Loading discounts...</p>
        </div>
      ) : discounts.length === 0 ? (
        <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#a1a1aa", border: "1px solid #27272a", borderRadius: "8px", background: "rgba(253, 251, 247, 0.02)" }}>
          <Tag size={48} style={{ margin: "0 auto 1rem auto", color: "#3f3f46" }} />
          <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>No discounts found.</p>
          <Link href="/admin/discounts/new" className={styles.actionBtnSecondary} style={{ textDecoration: "none", padding: "0.75rem 1.5rem" }}>
            Add Your First Discount
          </Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {discounts.map((discount) => {
            const isExpired = new Date(discount.expiresAt) < new Date();
            
            return (
              <div key={discount.id} className={styles.orderCard} style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "50px", height: "50px", borderRadius: "8px", backgroundColor: isExpired ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)", color: isExpired ? "#ef4444" : "#10b981" }}>
                  <Percent size={24} />
                </div>

                <div style={{ flex: 1, textAlign: "left" }}>
                  <h3 className={styles.orderId} style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {discount.title}
                    <span className={`${styles.statusBadge} ${isExpired ? styles.cancelled : styles.completed}`} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                      {isExpired ? "Expired" : "Active"}
                    </span>
                  </h3>
                  
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#a1a1aa" }}>
                    {discount.description || "No description provided."}
                  </p>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.5rem", fontSize: "0.8rem", color: "#71717a" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <strong>Target:</strong> {
                        discount.product 
                          ? `Product: ${discount.product.name}` 
                          : discount.category 
                            ? `Category: ${discount.category.name}` 
                            : discount.productIds && discount.productIds.length > 0 
                              ? `Specific Products (${discount.productIds.length})` 
                              : "All Products (Global)"
                      }
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Calendar size={14} /> 
                      <strong>Expires:</strong> {new Date(discount.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: "700", color: isExpired ? "#a1a1aa" : "#8B3A2B" }}>
                    -{discount.percentage}%
                  </span>
                  
                  <button
                    onClick={() => handleDeleteClick(discount.id, discount.title)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    title="Delete Discount"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isDeleteModalOpen && discountToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Delete Discount</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete the discount "{discountToDelete.title}"? <br></br> This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDiscountToDelete(null);
                }} 
                disabled={isDeleting}
                className={styles.modalKeepBtn}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isDeleting}
                className={styles.modalConfirmBtn}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
