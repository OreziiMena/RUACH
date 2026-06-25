"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Search, ChevronDown, Edit, Plus } from "lucide-react"; 
import styles from "../../collection/collection.module.css";
import adminStyles from "../admin.module.css";
import { ProductContract } from "@/contracts/product";
import { CategoryContract } from "@/contracts/category";
import { PagedResponse } from "@/contracts/response";
import { handleClientError } from "@/lib/clientErrorHandler";

type PageItem = number | "...";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminProductList() {
  const [products, setProducts] = useState<ProductContract[]>([]);
  const [categories, setCategories] = useState<CategoryContract[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [sortOption, setSortOption] = useState("popularity");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const lastAppliedSearchRef = useRef("");
  const lastAppliedCategoryRef = useRef(-1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<CategoryContract[]>("/api/categories");
        setCategories(res.data);
      } catch (error) { handleClientError(error); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtersChanged = lastAppliedSearchRef.current !== debouncedSearchQuery || lastAppliedCategoryRef.current !== selectedCategory;
    if (filtersChanged && currentPage !== 1) { setCurrentPage(1); return; }

    const fetchProducts = async () => {
      const urlParams = new URLSearchParams({ page: currentPage.toString(), orderBy: sortOption });
      if (debouncedSearchQuery) urlParams.append("search", debouncedSearchQuery);
      if (selectedCategory !== -1) urlParams.append("categoryId", selectedCategory.toString());

      try {
        const response = await axios.get<PagedResponse<ProductContract>>(`/api/products?${urlParams.toString()}`);
        setProducts(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) { handleClientError(error); } finally { setIsLoading(false); }
    };
    fetchProducts();
  }, [debouncedSearchQuery, selectedCategory, currentPage, sortOption]);

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

  const getCategoryLabel = (id: number) => {
    if (id === -1) return "All Categories";
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : "All Categories";
  };

  const getSortLabel = (val: string) => {
    switch(val) {
      case "popularity": return "Most Popular";
      case "createdAt": return "Latest";
      case "price_asc": return "Price: Low to High";
      case "price_desc": return "Price: High to Low";
      default: return "Most Popular";
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ textAlign: "left" }}>
          <h1 className={styles.title} style={{ marginBottom: "0.25rem" }}>Your Products</h1>
          <p className={styles.subtitle}>Manage your store products</p>
        </div>
        <Link href="/admin/products/new" className={adminStyles.actionBtn} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={18} /> Add New Product
        </Link>
      </header>

      <div className={styles.filtersContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.dropdownsWrapper}>
          <div className={styles.filterWrapper}>
            <div className={styles.customSelectTrigger} onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
              <span>{getCategoryLabel(selectedCategory)}</span>
              <ChevronDown size={16} />
            </div>
            {isCategoryOpen && (
              <div className={styles.customSelectMenu}>
                <div className={styles.customSelectOption} onClick={() => { setSelectedCategory(-1); setIsCategoryOpen(false); }}>All Categories</div>
                {categories.map((cat) => (
                  <div key={cat.id} className={styles.customSelectOption} onClick={() => { setSelectedCategory(cat.id); setIsCategoryOpen(false); }}>{cat.name}</div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.filterWrapper}>
            <div className={styles.customSelectTrigger} onClick={() => setIsSortOpen(!isSortOpen)}>
              <span>{getSortLabel(sortOption)}</span>
              <ChevronDown size={16} />
            </div>
            {isSortOpen && (
              <div className={styles.customSelectMenu}>
                {[{l:"Most Popular", v:"popularity"}, {l:"Latest", v:"createdAt"}, {l:"Price: Low to High", v:"price_asc"}, {l:"Price: High to Low", v:"price_desc"}].map((s) => (
                  <div key={s.v} className={styles.customSelectOption} onClick={() => { setSortOption(s.v); setIsSortOpen(false); }}>{s.l}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>Loading inventory...</div>
      ) : (
        <>
          <div className={styles.productGrid}>
            {products.map((product) => (
              <Link href={`/admin/products/${product.slug}/edit`} key={product.id} className={styles.productCard}>
                <div className={styles.imageContainer} style={{ position: 'relative', height: '200px' }}>
                  <Image src={product.imageUrl} alt={product.name} fill className={styles.productImage} />
                </div>
                <div className={styles.productDetails}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>{formatNaira(product.price)}</p>
                  <div className={styles.gridCartBtn} style={{ backgroundColor: '#8B3A2B', color: 'white', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Edit size={16} /> EDIT PRODUCT
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Inventory pages">
              <button className={styles.paginationButton} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
              <div className={styles.paginationNumbers}>
                {visiblePages().map((page, index) => (
                  <button 
                    key={index} 
                    className={page === currentPage ? styles.paginationButtonActive : styles.paginationButton} 
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button className={styles.paginationButton} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}