"use client";

import React, { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Upload, Trash2, ChevronDown, X } from "lucide-react";
import { handleClientError } from "@/lib/clientErrorHandler";
import Image from "next/image";
import styles from "../../new/addProduct.module.css";
import { toast } from "sonner";
import CloudflareR2StorageClient from "@/lib/storage";
import { CategoryContract } from "@/contracts/category";

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { slug } = use(params);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryContract[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_count: "",
    categoryId: "-1",
    imageKeys: [] as string[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get<CategoryContract[]>("/api/categories"),
          axios.get(`/api/products/${slug}`)
        ]);
        setCategories(catRes.data);
        setFormData(prodRes.data);
        setImagePreviews(prodRes.data.imageUrls || [prodRes.data.imageUrl]);
        setSizes(
          Array.isArray(prodRes.data.sizes) 
            ? prodRes.data.sizes 
            : (typeof prodRes.data.sizes === 'string' ? prodRes.data.sizes.split(",") : [])
        );
         const category =catRes.data.find((c) => c.name === prodRes.data.category);
         setFormData((prev) => ({...prev, categoryId: category ? category.id.toString() : "-1" }));
      } catch (error) {
        handleClientError(error);
      }
    };
    fetchData();
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (newSize && !sizes.includes(newSize.toUpperCase())) {
      setSizes([...sizes, newSize.toUpperCase()]);
      setNewSize("");
    }
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newUploads = await Promise.all(
        imageFiles.map((file) => CloudflareR2StorageClient.uploadMedia(file, "products"))
      );

      const newKeys = newUploads.map((u) => u.key);
      const allKeys = [...(Array.isArray(formData.imageKeys) ? formData.imageKeys : []), ...newKeys];

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock_count: Number(formData.stock_count),
        categoryId: Number(formData.categoryId),
        sizes: sizes,
        imageKey: allKeys[0] || "",
        thumbnailKeys: allKeys
      };

      await axios.put(`/api/products/${slug}`, payload);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    toast("Are you sure you want to delete this product?", {
      action: {
        label: "Yes, Delete",
        onClick: async () => {
          try {
            await axios.delete(`/api/products/${slug}`);
            toast.success("Product deleted successfully");
            router.push("/admin/products");
          } catch (error) {
            handleClientError(error);
          }
        },
      },
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Product</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.mediaSection}>
          <div className={styles.mediaGrid}>
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className={styles.imagePreviewBox}>
                <Image src={preview} alt="Preview" fill className={styles.previewImage} />
                <button type="button" className={styles.removeImgBtn} onClick={() => removeImage(idx)}><X size={16} /></button>
              </div>
            ))}
            <div className={styles.uploadTriggerBox} onClick={() => fileInputRef.current?.click()}>
              <Upload size={24} /> <span>Add Images</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" style={{ display: "none" }} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Product Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Category</label>
          <div className={styles.customSelectTrigger} onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
            <span>{formData.categoryId === "-1" ? "Select Category" : categories.find(c => c.id.toString() === formData.categoryId)?.name}</span>
            <ChevronDown size={16} className={isCategoryOpen ? styles.iconOpen : ""} />
          </div>
          {isCategoryOpen && (
            <div className={styles.customSelectMenu}>
              {categories.map((category) => (
                <div key={category.id} className={`${styles.customSelectOption} ${formData.categoryId === category.id.toString() ? styles.optionActive : ""}`}
                  onClick={() => { setFormData({ ...formData, categoryId: category.id.toString() }); setIsCategoryOpen(false); }}>
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </div>
        
      <div className={styles.inputGroup}>
        <label className={styles.label}>Description</label>
        <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className={styles.input} placeholder="Description" />
      </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Price</label>
          <input required type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} placeholder="Price" />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Stock Count</label>
          <input required type="number" name="stock_count" value={formData.stock_count} onChange={handleChange} className={styles.input} placeholder="Stock" />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Product Sizes</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input type="text" placeholder="e.g. XL" className={styles.input} value={newSize} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())} />
            <button type="button" onClick={addSize} style={{ background: '#3b82f6', color: 'white', padding: '0 16px', borderRadius: '4px', border: 'none' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sizes.map((size, index) => (
              <span key={index} style={{ background: '#27272a', color: '#fff', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                {size}
                <button type="button" onClick={() => removeSize(index)} style={{ marginLeft: '8px' }}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? "UPDATING..." : "UPDATE PRODUCT"}
          </button>
          <button type="button" onClick={handleDelete} className={styles.deleteBtn} style={{ background: '#8B3A2B', color: 'white', padding: '0 20px', borderRadius: '4px' }}>
            <Trash2 size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}