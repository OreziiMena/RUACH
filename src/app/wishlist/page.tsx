"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useWishlistStore } from "@/app/store/wishliststore";
import { Trash2, ShoppingBag, HeartOff } from "lucide-react";
import styles from "./wishlist.module.css";
import { ProductContract } from "@/contracts/product";

export default function WishlistPage() {
  const { items, toggleWishlist, clearWishlist } = useWishlistStore();
  const [wishlistProducts, setWishlistProducts] = useState<ProductContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hydration fix for Zustand persist
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch the full product data whenever the saved slugs change
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (items.length === 0) {
        setWishlistProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // 1. Create the array, attaching a .catch() to EACH request to prevent master crashes
        const fetchPromises = items.map((slug) => 
          axios.get(`/api/products/${slug}`).catch((err) => {
            console.warn(`Failed to fetch wishlist item: ${slug}`);
            return null; 
          })
        );
        
        // 2. Fire them all off simultaneously
        const responses = await Promise.all(fetchPromises);
        
        // 3. Filter out any failed requests (nulls) and extract product payloads
        const fullProducts = responses
          .filter((res) => res !== null) 
          .map((res) => res!.data);
          
        // 4. Save clean data to local state
        setWishlistProducts(fullProducts);
        
      } catch (error) {
        console.error("Failed to fetch wishlist items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      fetchWishlistProducts();
    }
  }, [items, isMounted]);

  if (!isMounted) return null;

  return (
      <div className={styles.container}>
        
        {/* Header Layout with clean 'Clear All' functionality */}
        <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className={styles.title}>Your Wishlist</h1>
            <p className={styles.subtitle}>
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'} saved
            </p>
          </div>
          {items.length > 0 && (
            <button 
              onClick={() => clearWishlist()}
              style={{
                background: 'none',
                border: 'none',
                color: '#b33a3a',
                cursor: 'pointer',
                fontSize: '0.85rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                paddingBottom: '0.5rem'
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <HeartOff size={48} className={styles.emptyIcon} />
            <h2>Your wishlist is empty</h2>
            <p>Save pieces you love to build your perfect RUACH H. FASHION collection.</p>
            <Link href="/collection" className={styles.continueBtn}>
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className={styles.grid}>
            {isLoading
              ? // Loading skeletons matching items count
                Array.from({ length: items.length || 3 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard}></div>
                ))
              : wishlistProducts.map((product) => (
                  <div key={product.id} className={styles.productCard}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={product.imageUrl || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className={styles.image}
                        style={{ objectFit: "cover" }}
                      />
                      
                      {/* FIXED: Changed from product.id to product.slug to map store data accurately */}
                      <button
                        onClick={() => toggleWishlist(product.slug)}
                        className={styles.removeBtn}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className={styles.details}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <p className={styles.price}>₦{product.price.toLocaleString()}</p>
                      
                      <Link href={`/product/${product.slug}`} className={styles.viewBtn}>
                        <ShoppingBag size={16} />
                        VIEW DETAILS
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
  );
}