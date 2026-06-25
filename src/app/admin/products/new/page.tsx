"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Upload, X , CheckCircle2, AlertCircle, ChevronDown} from "lucide-react";
import { handleClientError } from "@/lib/clientErrorHandler";
import Image from "next/image";
import styles from "../new/addProduct.module.css"; 
import { toast } from "sonner";
import CloudflareR2StorageClient from "@/lib/storage";
import { CategoryContract } from "@/contracts/category";

export default function AddNewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryContract[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_count: "",
    categoryId: "-1", 
    sizes: "S, M, L, XL" 
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await axios.get<CategoryContract[]>("/api/categories");
        const fetchedCategories = categoriesResponse.data;

        setCategories(fetchedCategories);

      } catch (error) {
        handleClientError(error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      if (imageFiles.length + filesArray.length > 10) {
        alert("You can only upload a maximum of 10 images.");
        return;
      }

      const newFiles = [...imageFiles, ...filesArray];
      setImageFiles(newFiles);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles(imageFiles.filter((_, idx) => idx !== indexToRemove));
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImagePreviews(imagePreviews.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    if (formData.categoryId === "-1") {
      toast.error("Please select a category.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const { key, url } = await CloudflareR2StorageClient.uploadMedia(file, "products");
        return { key, url };
      });
      const uploadedData = await Promise.all(uploadPromises);

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock_count: Number(formData.stock_count),
        categoryId: Number(formData.categoryId),
        sizes: formData.sizes.split(",").map(s => s.trim()).filter(Boolean),
        imageKey: uploadedData[0].key,
        thumbnailKeys: uploadedData.slice(1).map(d => d.key)
      };

      await axios.post("/api/products", payload);
      
     setStatus({ type: 'success', message: "Product added successfully!" });
     setTimeout(() => router.push("/admin"), 1200);

    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className={styles.container}>
        <h1 className={styles.title}>Add New Product</h1>

        {status && (

        <div className={`${styles.statusBanner} ${styles[status.type]}`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {status.message}
        </div>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.mediaSection}>
            <h3 className={styles.sectionTitle}>Add Images</h3>
            <div className={styles.mediaGrid}>
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className={styles.imagePreviewBox}>
                  <Image src={preview} alt="Preview" fill className={styles.previewImage} />
                  {idx === 0 && <span className={styles.mainBadge}>MAIN</span>}
                  <button type="button" onClick={() => removeImage(idx)} className={styles.removeImgBtn}><X size={14} /></button>
                </div>
              ))}
              {imageFiles.length < 10 && (
                <div className={styles.uploadTriggerBox} onClick={() => fileInputRef.current?.click()}>
                  <Upload size={24} /> <span>Upload</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" multiple style={{ display: "none" }} />
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Product Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} />
            </div>
           
           <div className={styles.inputGroup}>
          <label className={styles.label}>Category</label>
          
          {/* Custom Dropdown Trigger */}
          <div 
            className={styles.customSelectTrigger} 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <span>
              {formData.categoryId === "-1" 
                ? "Select Category" 
                : categories.find(c => c.id.toString() === formData.categoryId)?.name}
            </span>
                
            <ChevronDown size={16} className={isCategoryOpen ? styles.iconOpen : ""} />
          </div>

         
          {isCategoryOpen && (
            <div className={styles.customSelectMenu}>
              {/* You can remove this static 'Select Category' option if you want to force a choice */}
              
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className={`${styles.customSelectOption} ${formData.categoryId === category.id.toString() ? styles.optionActive : ""}`}
                  onClick={() => {
                    setFormData({ ...formData, categoryId: category.id.toString() });
                    setIsCategoryOpen(false);
                  }}
                >
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Description</label>
            <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Price (₦)</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Stock Count</label>
              <input required type="number" name="stock_count" value={formData.stock_count} onChange={handleChange} className={styles.input} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Sizes (Comma separated)</label>
            <input required type="text" name="sizes" value={formData.sizes} onChange={handleChange} className={styles.input} />
          </div>

          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? "ADDING..." : "ADD PRODUCT"}
          </button>
        </form>
      </div>
  );
}