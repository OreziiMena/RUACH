"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { List, Trash2, Edit2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { handleClientError } from "@/lib/clientErrorHandler";
import { CategoryContract } from "@/contracts/category";
import styles from "../admin.module.css";

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState<CategoryContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Custom modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<CategoryContract[]>("/api/categories");
      setCategories(response.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    setIsCreating(true);
    try {
      const response = await axios.post<CategoryContract>("/api/categories", {
        name: newCategoryName.trim(),
      });
      toast.success(`Category "${response.data.name}" created successfully!`);
      setCategories((prev) => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName("");
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (cat: CategoryContract) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.put<CategoryContract>(`/api/categories/${id}`, {
        name: editingName.trim(),
      });
      toast.success("Category updated successfully!");
      setCategories((prev) =>
        prev
          .map((cat) => (cat.id === id ? response.data : cat))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setCategoryToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/categories/${categoryToDelete.id}`);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully!`);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ textAlign: "left", marginBottom: "3rem" }}>
        <h1 className={styles.title} style={{ marginBottom: "0.25rem" }}>Categories</h1>
        <p className={styles.subtitle}>Manage product categories for collections and store filtering</p>
      </header>

      {/* CREATE CATEGORY BLOCK */}
      <section className={styles.section} style={{ marginBottom: "3rem" }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: "1rem" }}>Create New Category</h3>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: "1rem", maxWidth: "600px" }}>
          <input
            type="text"
            required
            placeholder="Category Name (e.g. Kaftans, Outerwear)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: "rgba(253, 251, 247, 0.03)",
              border: "1px solid #27272a",
              color: "#FDFBF7",
              padding: "0.85rem",
              borderRadius: "6px",
              outline: "none",
              fontSize: "1rem",
              fontFamily: "var(--font-clean, sans-serif)",
            }}
          />
          <button
            type="submit"
            disabled={isCreating}
            className={styles.actionBtn}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0 1.5rem",
              cursor: "pointer",
              height: "48px",
            }}
          >
            <Plus size={18} /> {isCreating ? "Creating..." : "Create"}
          </button>
        </form>
      </section>

      {/* CATEGORY LIST GRID */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: "1.5rem" }}>Existing Categories</h3>
        
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "#a1a1aa" }}>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#a1a1aa", border: "1px solid #27272a", borderRadius: "8px", background: "rgba(253, 251, 247, 0.02)" }}>
            <List size={48} style={{ margin: "0 auto 1rem auto", color: "#3f3f46" }} />
            <p style={{ fontSize: "1.1rem" }}>No categories found. Create one above to get started.</p>
          </div>
        ) : (
          <div className={styles.ordersList} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={styles.orderCard}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.5rem",
                    gap: "1.5rem",
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: "flex", flex: 1, gap: "1rem" }}>
                      <input
                        type="text"
                        required
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        style={{
                          flex: 1,
                          backgroundColor: "rgba(20, 20, 20, 0.9)",
                          border: "1px solid #8B3A2B",
                          color: "#FDFBF7",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "4px",
                          outline: "none",
                          fontSize: "0.95rem",
                        }}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          disabled={isUpdating}
                          style={{
                            background: "#8B3A2B",
                            border: "none",
                            color: "#FDFBF7",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                          }}
                        >
                          <Save size={14} /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            background: "transparent",
                            border: "1px solid #3f3f46",
                            color: "#a1a1aa",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ textAlign: "left" }}>
                        <h4 className={styles.orderId} style={{ margin: 0, fontSize: "1.1rem" }}>
                          {cat.name}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "#71717a" }}>ID: {cat.id}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button
                          onClick={() => handleStartEdit(cat)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#a1a1aa",
                            cursor: "pointer",
                            padding: "0.5rem",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#FDFBF7")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
                          title="Edit Category"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(cat.id, cat.name)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "0.5rem",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {isDeleteModalOpen && categoryToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Delete Category</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete the category "{categoryToDelete.name}"? <br></br> This will remove it from all products. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCategoryToDelete(null);
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
