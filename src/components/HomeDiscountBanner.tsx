"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Percent, ChevronRight } from "lucide-react";
import styles from "./HomeDiscountBanner.module.css";

export default function HomeDiscountBanner() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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
        console.error("Failed to fetch discounts on homepage", error);
      }
    };
    fetchDiscounts();
  }, []);

  useEffect(() => {
    if (discounts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % discounts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [discounts.length]);

  if (discounts.length === 0) return null;

  const activeDiscount = discounts[currentIndex];

  const handleBannerClick = () => {
    router.push("/collection");
  };

  return (
    <div className={styles.fixedBannerContainer} onClick={handleBannerClick}>
      <div className={styles.bannerContent}>
        <div className={styles.badgeWrapper}>
          <Percent size={16} />
          <span className={styles.percentage}>-{activeDiscount.percentage}%</span>
        </div>
        
        <div className={styles.textContainer}>
          <h4 className={styles.title}>{activeDiscount.title}</h4>
          {activeDiscount.description && (
            <p className={styles.description}>{activeDiscount.description}</p>
          )}
        </div>

        <div className={styles.arrowWrapper}>
          <span className={styles.discoverText}>DISCOVER</span>
          <ChevronRight size={16} className={styles.arrowIcon} />
        </div>
      </div>

      {discounts.length > 1 && (
        <div className={styles.indicatorDots}>
          {discounts.map((_, idx) => (
            <span
              key={idx}
              className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
