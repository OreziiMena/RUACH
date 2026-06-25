'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react'; // Changed to Trash2 to match your high-end design
import { useCartStore } from '../store/cartStore';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import { CartItemContract } from '@/contracts/cart';
import { ProductContract } from '@/contracts/product';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import axios from 'axios';

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const { items, removeItem, updateQuantity } = useCartStore();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get<any[]>('/api/discounts');
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

  const getDiscountedPrice = (product: ProductContract) => {
    const pct = getProductDiscountPercentage(product);
    if (pct) return product.price * (1 - pct / 100);
    return product.price;
  };

  const getDiscountedCartTotal = () => {
    return items.reduce((total, item) => {
      const discountedPrice = getDiscountedPrice(item.product);
      return total + discountedPrice * item.quantity;
    }, 0);
  };
  
  const handleUpdateQuantity = async (item: CartItemContract) => {
    setLoadingItemId(item.productId);
    await updateQuantity(item);
    setLoadingItemId(null);
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.info('Please log in to view your cart');
      router.push("/login");
    }
  }, [status, router]);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.title}>Your collection is empty</h1>
        <Link href="/collection" className={styles.continueBtn}>
          DISCOVER PIECES
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Shopping Cart</h1>
      </header>

<div className={styles.layout}>
{/* LEFT COLUMN: The Table */}
<div className={styles.tableContainer}>
    <table className={styles.table}>
    <thead>
        <tr>
        <th>THUMBNAIL</th>
        <th>PRODUCT TITLE</th>
        <th>PRICE</th>
        <th>QUANTITY</th>
        <th>TOTAL</th>
        <th>REMOVE</th>
        </tr>
    </thead>
<tbody>
  {items.map((item) => {
    const pct = getProductDiscountPercentage(item.product);
    const discountedPrice = pct ? item.product.price * (1 - pct / 100) : null;
    const itemPrice = discountedPrice !== null ? discountedPrice : item.product.price;
    const rowTotal = itemPrice * item.quantity;

    return (
      <tr key={item.id}>
        <td className={styles.thumbnailCell}>
          {/* --- WRAPPER ADDED HERE --- */}
          <Link href={`/product/${item.product.slug}`} className={styles.imageLink}>
            <div className={styles.imageWrapper}>
              <Image 
                src={item.product.imageUrl} 
                alt={item.product.name} 
                fill 
                className={styles.image} 
              />
            </div>
          </Link>
        </td>
        
        <td className={styles.titleCell}>
          <h2>{item.product.name}</h2>
          {item.size && <p>{item.size}</p>}
        </td>
        
        <td>
          {discountedPrice !== null ? (
            <div className={styles.priceContainer}>
              <span className={styles.discountedPrice}>
                ₦{discountedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className={styles.slashedPrice}>
                ₦{item.product.price.toLocaleString()}
              </span>
              <span className={styles.discountBadge}>
                -{pct}%
              </span>
            </div>
          ) : (
            `₦${item.product.price.toLocaleString()}`
          )}
        </td>
        
        <td>
            <div className={styles.qtySelector}>
            <button 
                type="button"
                className={styles.qtyBtn}
                onClick={() => handleUpdateQuantity({...item, quantity: item.quantity - 1})}
                disabled={loadingItemId === item.product.id || item.quantity <= 1}
            >
                −
            </button>
            
            <input 
                type="number" 
                min="1" 
                value={item.quantity} 
                onChange={(e) => handleUpdateQuantity({...item, quantity: parseInt(e.target.value) || 1})}
                className={styles.qtyInput}
            />

            <button 
                type="button"
                className={styles.qtyBtn}
                onClick={() => handleUpdateQuantity({...item, quantity: item.quantity + 1})}
                disabled={loadingItemId === item.product.id || item.quantity >= item.product.stock_count}
            >
                +
            </button>
            </div>
        </td>
        <td className={styles.totalCell}>
            ₦{rowTotal.toLocaleString()}
        </td>
        <td className={styles.removeCell}>
            <button 
                onClick={() => {
                    setLoadingItemId(item.product.id);
                    removeItem(item.product.id, item.size).then(() => setLoadingItemId(null));
                }} 
                className={styles.removeBtn}
                disabled={loadingItemId === item.product.id}
            >
                <Trash2 size={18} strokeWidth={1.5} />
            </button>
        </td>
      </tr>
    );
  })}
</tbody>
    </table>

    <Link href="/collection" className={styles.checkoutBtn}>
        ADD MORE PRODUCTS
    </Link>
</div>

        {/* RIGHT COLUMN: Cart Summary */}
        <aside className={styles.summaryContainer}>
          <div className={styles.summaryBox}>
            <h2 className={styles.summaryTitle}>Cart Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₦{getDiscountedCartTotal().toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>

            <div className={styles.summaryRowTotal}>
              <span>Total</span>
              <span>₦{getDiscountedCartTotal().toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>

  
            <Link href="/checkout" className={styles.checkoutBtn}>
                PROCEED TO CHECKOUT
            </Link>
          </div>
          
        </aside>
      </div>
    </div>
  );
}
