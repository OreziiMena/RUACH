"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/app/store/cartStore";
import styles from "./FloatingCart.module.css";

export default function FloatingCart() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Do not show on cart or checkout page
  if (pathname === "/cart" || pathname === "/checkout") {
    return null;
  }

  return (
    <Link href="/cart" className={styles.floatingCartBtn} aria-label="Open Cart">
      <ShoppingCart strokeWidth={1.5} className={styles.floatingCartIcon} />
      {items.length > 0 && (
        <span className={styles.floatingCartBadge}>
          {items.length}
        </span>
      )}
    </Link>
  );
}
