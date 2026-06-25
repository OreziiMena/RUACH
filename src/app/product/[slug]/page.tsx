"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, AlertCircle, Heart, Ruler, Check } from "lucide-react";
import { useCartStore } from "@/app/store/cartStore";
import { useWishlistStore } from "@/app/store/wishliststore";
import { ProductContract } from "@/contracts/product";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { handleClientError } from "@/lib/clientErrorHandler";
import styles from "./product.module.css";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [product, setProduct] = useState<ProductContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [discounts, setDiscounts] = useState<any[]>([]);
  
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isQuantityUpdating, setIsQuantityUpdating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showSizeError, setShowSizeError] = useState(false);

  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = product ? isInWishlist(product.slug) : false;
  
  const { items, addItem, removeItem, updateQuantity } = useCartStore();

  const existingCartItem = selectedSize 
    ? items.find((item) => item.productId === product?.id && item.size === selectedSize)
    : items.find((item) => item.productId === product?.id);

  const isInCart = !!existingCartItem;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get<ProductContract>(`/api/products/${slug}`);
        const productData = response.data; 
        
        setProduct(productData);
        setActiveImage(productData.imageUrl); 
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get<any[]>("/api/discounts");
        const now = new Date();
        const active = response.data.filter(
          (d) => new Date(d.expiresAt) > now
        );
        setDiscounts(active);
      } catch (error) {
        console.error("Failed to fetch discounts", error);
      }
    };
    fetchDiscounts();
  }, []);

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

  const pct = product ? getProductDiscountPercentage(product) : null;
  const discountedPrice = product && pct ? product.price * (1 - pct / 100) : null;

  useEffect(() => {
    const syncPageAndCartData = () => {
      if (existingCartItem) {
        setQuantity(existingCartItem.quantity);
        setSelectedSize(existingCartItem.size)
      } else {
        setQuantity(1);
      }
    }
    syncPageAndCartData()
  }, [existingCartItem])

  const handleMobileScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    const newIndex = Math.round(scrollLeft / clientWidth);
    setCurrentMobileIndex(newIndex);
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>Loading product details...</div>
    );
  }

  if (!product) {
    return (
      <div className={styles.error}>Product not found.</div>
    );
  }

  const isAvailable = product.stock_count > 0;
  const galleryImages = [product.imageUrl, ...(product.thumbnails || [])];

  const handleCartAction = async () => {
    if (!product) return;

    if (isInCart && existingCartItem) {
      setIsAdding(true);
      try {
        await removeItem(product.id, existingCartItem.size);
      } catch (error) {
        console.error("Failed to remove item", error);
      } finally {
        setIsAdding(false);
      }
    } else {
      if (!selectedSize) {
        setShowSizeError(true);
        
        setTimeout(() => {
          setShowSizeError(false);
        }, 3000); // Hides after 3 seconds
        
        return;
      }
      
      setIsAdding(true);
      try {
        await addItem({ 
          productId: product.id, 
          quantity: quantity, 
          size: selectedSize 
        });
        
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 2500);
        
      } catch (error) {
        console.error("Failed to add item", error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleQuantityAction = async(action: 'increase' | 'decrease') => {
    const inCart = items.find((item) => item.productId === product?.id && item.size === selectedSize)
    setIsQuantityUpdating(true);
    if (action === 'increase') {
      setQuantity(quantity + 1);
      if (!inCart) return setIsQuantityUpdating(false);
      await updateQuantity({
        productId: product.id,
        size: existingCartItem?.size || "",
        quantity: quantity + 1
      });
    } else {
      setQuantity(quantity - 1);
      if (!inCart) return setIsQuantityUpdating(false);
      await updateQuantity({
        productId: product.id,
        size: existingCartItem?.size || "",
        quantity: quantity - 1
      });
    }
    setIsQuantityUpdating(false);
  };

  return (
      <div className={styles.container}>
        
        <div className={styles.gallerySection}>
          
          <div className={styles.thumbnailStrip}>
            {galleryImages.map((img, idx) => (
              <button 
                key={idx} 
                className={`${styles.thumbBtn} ${activeImage === img ? styles.activeThumb : ""}`}
                onClick={() => setActiveImage(img)}
              >
                <Image 
                  src={img} 
                  alt={`${product.name} view ${idx + 1}`} 
                  fill 
                  sizes="80px"
                  className={styles.thumbImg} 
                />
              </button>
            ))}
          </div>
          
          <div className={styles.mainImageContainer}>
            <Image 
              src={activeImage} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className={styles.mainImg} 
            />
          </div>

          <div 
            className={styles.mobileCarousel} 
            ref={carouselRef}
            onScroll={handleMobileScroll}
          >
            {galleryImages.map((img, idx) => (
              <div key={idx} className={styles.mobileCarouselFrame}>
                <Image 
                  src={img} 
                  alt={`${product.name} mobile swipe view ${idx + 1}`} 
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  className={styles.mainImg}
                />
              </div>
            ))}
          </div>

          <div className={styles.carouselDots}>
            {galleryImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`${styles.dot} ${currentMobileIndex === idx ? styles.activeDot : ""}`}
              />
            ))}
          </div>

        </div>

        <div className={styles.detailsSection}>
          <h1 className={styles.title}>{product.name}</h1>
          {discountedPrice !== null ? (
            <div className={styles.priceContainer}>
              <span className={styles.discountedPrice}>
                {formatNaira(discountedPrice)}
              </span>
              <span className={styles.slashedPrice}>
                {formatNaira(product.price)}
              </span>
              {pct && (
                <span className={styles.discountBadge}>
                  -{pct}%
                </span>
              )}
            </div>
          ) : (
            <p className={styles.price}>{formatNaira(product.price)}</p>
          )}
          
          <div className={styles.description}>
            <p>{product.description}</p>
          </div>

          <div className={styles.selectorGroup}>
            <div className={styles.sizeHeader}>
              <span className={styles.label}>Size:</span>
              <Link href="/size-guide" className={styles.sizeGuidePill}>
                <Ruler size={14} /> Size guide
              </Link>
            </div>
           
           <div className={styles.pillGrid}>
              {(Array.isArray(product.sizes)
                ? product.sizes
                : (typeof product.sizes === 'string' ? (product.sizes as string).split(",") : [])
              ).map((size, index) => {
                const cleanSize = typeof size === 'string' ? size.trim() : '';
                if (!cleanSize) return null;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(cleanSize)}
                    className={`${styles.sizePill} ${selectedSize === cleanSize ? styles.activePill : ""}`}
                  >
                    {cleanSize}
                  </button>
                );
              })}
            </div>
            </div>

          <div className={styles.selectorGroup}>
            <span className={styles.label}>Qty:</span>
            <div className={styles.quantityControls}>
              <button 
                onClick={() => handleQuantityAction('decrease')}
                disabled={quantity <= 1 || isQuantityUpdating}
                className={styles.qtyBtn}
              >-</button>
              <span className={styles.qtyNumber}>{quantity}</span>
              <button 
                onClick={() => handleQuantityAction('increase')}
                disabled={quantity >= product.stock_count || isQuantityUpdating}
                className={styles.qtyBtn}
              >+</button>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              onClick={handleCartAction}
              disabled={!isAvailable || isAdding || isSuccess}
              className={styles.addToCartBtn}
              style={{
                backgroundColor:  isInCart ? "transparent" : "",
                color : isInCart ? " #ef4444" : "",
                border: isInCart ? "1px solid #ef4444" : "",
              }}
            >
              {isInCart ? (
                "REMOVE FROM CART"
              ) : !isAvailable ? (
                "OUT OF STOCK"
              ) : (
                <>
                  <ShoppingCart size={20} />
                  ADD TO CART
                </>
              )}
            </button>
            
            <button 
              onClick={() => toggleWishlist(product.slug)} 
              className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ""}`}
              aria-label="Add to Wishlist"
            >
              <Heart 
                size={24} 
                fill={isWishlisted ? "#ef4444" : "none"} 
                color={isWishlisted ? "#ef4444" : "#FDFBF7"}
              />
            </button>
          </div>

          {!isAvailable && (
            <p className={styles.outOfStockMsg}>
              <AlertCircle size={16} /> This item is currently unavailable.
            </p>
          )}
        </div>
        <AnimatePresence>
        {showSizeError && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            style={{
              position: "fixed",
              bottom: "2rem",
              left: "50%",
              backgroundColor: "#ef4444",
              color: "#FDFBF7",
              padding: "0.75rem 1.5rem",
              borderRadius: "50px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 100,
              width: "max-content",
              maxWidth: "90vw",
              fontFamily: "var(--font-clean, sans-serif)",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            <AlertCircle size={18} />
            <span style={{ fontFamily: "var(--font-clean, sans-serif)", fontSize: "0.9rem", fontWeight: 500 }}>
              Please select a size first!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      
  );
}