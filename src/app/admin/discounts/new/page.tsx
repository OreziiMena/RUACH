"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Upload, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { handleClientError } from "@/lib/clientErrorHandler";
import CloudflareR2StorageClient from "@/lib/storage";
import styles from "../../products/new/addProduct.module.css";

export default function NewDiscountPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [targetType, setTargetType] = useState<"global" | "category" | "products">("global");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [isTargetTypeOpen, setIsTargetTypeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    percentage: "",
    categoryId: "",
    expiresAt: ""
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(Array.isArray(res.data) ? res.data : (res.data.data || []));
      } catch (error) {
        handleClientError(error);
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data);
      } catch (error) {
        handleClientError(error);
      }
    };
    fetchProducts();
    fetchCategories();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleProductToggle = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (targetType === "category" && !formData.categoryId) {
      toast.error("Please select a category");
      setIsSubmitting(false);
      return;
    }

    if (targetType === "products" && selectedProductIds.length === 0) {
      toast.error("Please select at least one product");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageKey = null;
      if (imageFile) {
        const upload = await CloudflareR2StorageClient.uploadMedia(imageFile, "discounts");
        imageKey = upload.key;
      }

      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        percentage: Number(formData.percentage),
        productId: targetType === "products" && selectedProductIds.length === 1 ? selectedProductIds[0] : null,
        categoryId: targetType === "category" ? Number(formData.categoryId) : null,
        productIds: targetType === "products" ? selectedProductIds : [],
        expiresAt: new Date(formData.expiresAt),
        imageKey: imageKey || undefined
      };

      await axios.post("/api/discounts", payload);

      toast.success("Discount created successfully!");
      router.push("/admin/discounts");
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Discount</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.mediaSection}>
          <h3 className={styles.sectionTitle} style={{ color: '#a1a1aa', fontSize: '1rem', marginBottom: '0.75rem', fontFamily: 'var(--font-clean, sans-serif)' }}>
            Discount Banner Image (Optional)
          </h3>
          <div className={styles.mediaGrid}>
            {preview ? (
              <div className={styles.imagePreviewBox}>
                <Image src={preview} alt="Preview" fill className={styles.previewImage} />
                <button type="button" onClick={removeImage} className={styles.removeImgBtn}><X size={14} /></button>
              </div>
            ) : (
              <div className={styles.uploadTriggerBox} onClick={() => fileInputRef.current?.click()}>
                <Upload size={24} /> <span>Upload Banner</span>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" style={{ display: "none" }} />
        </div>
        
        <input 
          required 
          placeholder="Discount Title (e.g. Summer Flash Sale)" 
          className={styles.input} 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
        />

        <textarea 
          placeholder="Description" 
          className={styles.input} 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
        />
        
        <div className={styles.inputRow}>
          <input 
            required 
            type="number" 
            placeholder="Percentage (0-100)" 
            className={styles.input} 
            value={formData.percentage} 
            onChange={(e) => setFormData({...formData, percentage: e.target.value})} 
          />
          <input 
            required 
            type="date" 
            className={styles.input} 
            value={formData.expiresAt} 
            onChange={(e) => setFormData({...formData, expiresAt: e.target.value})} 
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Discount Target Type</label>
          <div 
            className={styles.customSelectTrigger} 
            onClick={() => {
              setIsTargetTypeOpen(!isTargetTypeOpen);
              setIsCategoryOpen(false);
            }}
          >
            <span>
              {targetType === "global" && "All Products (Global Discount)"}
              {targetType === "category" && "Category-wide Discount"}
              {targetType === "products" && "Specific Product(s) Discount"}
            </span>
            <ChevronDown size={16} className={`${styles.selectIcon} ${isTargetTypeOpen ? styles.iconOpen : ""}`} />
          </div>

          {isTargetTypeOpen && (
            <div className={styles.customSelectMenu}>
              <div 
                className={`${styles.customSelectOption} ${targetType === "global" ? styles.optionActive : ""}`}
                onClick={() => {
                  setTargetType("global");
                  setIsTargetTypeOpen(false);
                }}
              >
                All Products (Global Discount)
              </div>
              <div 
                className={`${styles.customSelectOption} ${targetType === "category" ? styles.optionActive : ""}`}
                onClick={() => {
                  setTargetType("category");
                  setIsTargetTypeOpen(false);
                }}
              >
                Category-wide Discount
              </div>
              <div 
                className={`${styles.customSelectOption} ${targetType === "products" ? styles.optionActive : ""}`}
                onClick={() => {
                  setTargetType("products");
                  setIsTargetTypeOpen(false);
                }}
              >
                Specific Product(s) Discount
              </div>
            </div>
          )}
        </div>

        {targetType === "category" && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>Select Target Category</label>
            <div 
              className={styles.customSelectTrigger} 
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                setIsTargetTypeOpen(false);
              }}
            >
              <span>
                {categories.find(c => String(c.id) === formData.categoryId)?.name || "Select Category"}
              </span>
              <ChevronDown size={16} className={`${styles.selectIcon} ${isCategoryOpen ? styles.iconOpen : ""}`} />
            </div>

            {isCategoryOpen && (
              <div className={styles.customSelectMenu}>
                {categories.map((c) => (
                  <div 
                    key={c.id}
                    className={`${styles.customSelectOption} ${formData.categoryId === String(c.id) ? styles.optionActive : ""}`}
                    onClick={() => {
                      setFormData({...formData, categoryId: String(c.id)});
                      setIsCategoryOpen(false);
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {targetType === "products" && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>Select Target Product(s)</label>
            <input
              type="text"
              placeholder="Search products..."
              className={styles.input}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={{ marginBottom: '0.75rem' }}
            />
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              border: '1px solid #27272a', 
              borderRadius: '6px',
              padding: '0.75rem',
              backgroundColor: 'rgba(253, 251, 247, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {filteredProducts.length === 0 ? (
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>No products found</p>
              ) : (
                filteredProducts.map((p) => {
                  const isChecked = selectedProductIds.includes(p.id);
                  return (
                    <label key={p.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      padding: '4px 0',
                      userSelect: 'none'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => handleProductToggle(p.id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{p.name}</span>
                    </label>
                  );
                })
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.5rem' }}>
              {selectedProductIds.length} product(s) selected
            </p>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          {isSubmitting ? "CREATING..." : "CREATE DISCOUNT"}
        </button>
      </form>
    </div>
  );
}