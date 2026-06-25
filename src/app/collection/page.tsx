"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Search, ChevronDown } from "lucide-react";
import styles from "./collection.module.css";
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

export default function CollectionPage() {
  const [products, setProducts] = useState<ProductContract[]>([]);
  const [categories, setCategories] = useState<CategoryContract[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeDiscount = discounts[currentIndex] || null;
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [sortOption, setSortOption] = useState("popularity");

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const lastAppliedSearchRef = useRef("");
  const lastAppliedCategoryRef = useRef(-1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await axios.get<CategoryContract[]>("/api/categories");
        setCategories(categoriesResponse.data);
      } catch (error) {
        handleClientError(error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get<any[]>("/api/discounts");
        const now = new Date();
        const active = response.data.filter(
          (d) => new Date(d.expiresAt) > now
        );
        setDiscounts(active);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Failed to fetch discounts", error);
      }
    };
    fetchDiscounts();
  }, []);

  useEffect(() => {
    if (discounts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % discounts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [discounts.length]);

  useEffect(() => {
    if (!activeDiscount) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(activeDiscount.expiresAt) - +new Date();
      if (difference <= 0) return null;

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
      if (!time) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeDiscount]);

  useEffect(() => {
    const filtersChanged =
      lastAppliedSearchRef.current !== debouncedSearchQuery ||
      lastAppliedCategoryRef.current !== selectedCategory;

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    const fetchFilteredProducts = async () => {
      const urlParams = new URLSearchParams();

      urlParams.append("page", currentPage.toString());
      if (debouncedSearchQuery !== "") {
        urlParams.append("search", debouncedSearchQuery);
      }
      if (selectedCategory !== -1) {
        urlParams.append("categoryId", selectedCategory.toString());
      }
      urlParams.append("orderBy", sortOption);

      const url = `/api/products?${urlParams.toString()}`;

      try {
        const response = await axios.get<PagedResponse<ProductContract>>(url);
        if (filtersChanged) {
          lastAppliedSearchRef.current = debouncedSearchQuery;
          lastAppliedCategoryRef.current = selectedCategory;
        }
        setProducts(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
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

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedCategory(-1);
    setCurrentPage(1);
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

  const getProductDiscountPercentage = (p: ProductContract) => {
    const percentages = discounts.map((d) => {
      const matchesProduct = d.productId === p.id || (Array.isArray(d.productIds) && d.productIds.includes(p.id));
      if (matchesProduct) return d.percentage;

      const matchesCategory = d.category && d.category.name === p.category;
      if (matchesCategory) return d.percentage;

      const isGlobal = !d.productId && !d.categoryId && (!Array.isArray(d.productIds) || d.productIds.length === 0);
      if (isGlobal) return d.percentage;

      return 0;
    });

    const maxPct = Math.max(0, ...percentages);
    return maxPct > 0 ? maxPct : null;
  };

  return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>OUR COLLECTION</h1>
          <p className={styles.subtitle}>Explore our latest arrivals and premium selections</p>

          {activeDiscount && (
            <div className={styles.discountBanner}>
              <span className={styles.badge}>-{activeDiscount.percentage}%</span>
              <div className={styles.bannerText}>
                <h3>{activeDiscount.title}</h3> 
                {activeDiscount.description && <p>{activeDiscount.description}</p>}
              </div>
              {timeLeft ? (
                <div className={styles.countdownContainer}>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownNumber}>{String(timeLeft.days).padStart(2, "0")}</span>
                    <span className={styles.countdownLabel}>Days</span>
                  </div>
                  <div className={styles.countdownDivider}>:</div>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span className={styles.countdownLabel}>Hrs</span>
                  </div>
                  <div className={styles.countdownDivider}>:</div>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span className={styles.countdownLabel}>Mins</span>
                  </div>
                  <div className={styles.countdownDivider}>:</div>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, "0")}</span>
                    <span className={styles.countdownLabel}>Secs</span>
                  </div>
                </div>
              ) : (
                <div className={styles.expiredLabel}>Sale Ended</div>
              )}

              {discounts.length > 1 && (
                <div className={styles.bannerDots}>
                  {discounts.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.bannerDot} ${idx === currentIndex ? styles.bannerDotActive : ""}`}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
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
            {/* Category Dropdown */}
            <div className={styles.filterWrapper}>
              <div 
                className={styles.customSelectTrigger} 
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsSortOpen(false);
                }}
              >
                <span>{getCategoryLabel(selectedCategory)}</span>
                <ChevronDown size={16} className={`${styles.selectIcon} ${isCategoryOpen ? styles.iconOpen : ""}`} />
              </div>

              {isCategoryOpen && (
                <div className={styles.customSelectMenu}>
                  <div 
                    className={`${styles.customSelectOption} ${selectedCategory === -1 ? styles.optionActive : ""}`}
                    onClick={() => {
                      setSelectedCategory(-1);
                      setIsCategoryOpen(false);
                    }}
                  >
                    All Categories
                  </div>
                  {categories.map((category) => (
                    <div 
                      key={category.id}
                      className={`${styles.customSelectOption} ${selectedCategory === category.id ? styles.optionActive : ""}`}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsCategoryOpen(false);
                      }}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className={styles.filterWrapper}>
              <div 
                className={styles.customSelectTrigger} 
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsCategoryOpen(false);
                }}
              >
                <span>{getSortLabel(sortOption)}</span>
                <ChevronDown size={16} className={`${styles.selectIcon} ${isSortOpen ? styles.iconOpen : ""}`} />
              </div>

              {isSortOpen && (
                <div className={styles.customSelectMenu}>
                  {[
                    { label: "Most Popular", value: "popularity" },
                    { label: "Latest", value: "createdAt" },
                    { label: "Price: Low to High", value: "price_asc" },
                    { label: "Price: High to Low", value: "price_desc" }
                  ].map((s) => (
                    <div 
                      key={s.value}
                      className={`${styles.customSelectOption} ${sortOption === s.value ? styles.optionActive : ""}`}
                      onClick={() => {
                        setSortOption(s.value);
                        setIsSortOpen(false);
                      }}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


        {isLoading ? (
          <div className={styles.loadingState}>Loading collection...</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No products found matching your criteria.</p>
            <button 
              className={styles.clearBtn}
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className={styles.productGrid}>
              {products.map((product) => {
                const pct = getProductDiscountPercentage(product);
                const discountedPrice = pct ? product.price * (1 - pct / 100) : null;

                return (
                  <Link href={`/product/${product.slug}`} key={product.id} className={styles.productCard}>
                    
                    <div className={styles.imageContainer}>
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={styles.productImage}
                      />
                      {pct && (
                        <span className={styles.gridBadge}>
                          -{pct}%
                        </span>
                      )}
                    </div>

                    <div className={styles.productDetails}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.productName}>{product.name}</h3>
                        {product.stock_count > 0 ? (
                          <span className={styles.inStockBadge}>In Stock</span>
                        ) : (
                          <span className={styles.outOfStockBadge}>Sold Out</span>
                        )}
                      </div>
                      
                      {discountedPrice !== null ? (
                        <div className={styles.priceContainer}>
                          <span className={styles.discountedPrice}>
                            {formatNaira(discountedPrice)}
                          </span>
                          <span className={styles.slashedPrice}>
                            {formatNaira(product.price)}
                          </span>
                        </div>
                      ) : (
                        <p className={styles.productPrice}>{formatNaira(product.price)}</p>
                      )}
                      
                      <div className={styles.gridCartBtn}>
                        ADD TO CART
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Collection pages">
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
          </>
        )}
      </div>
  );
}