'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '../app/store/cartStore';
import styles from './NewCollections.module.css';
import { ProductContract } from '../contracts/product';
import React from 'react';

//Format currency
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
};

function ProductCard({ product }: { product: ProductContract }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { items, addItem, removeItem } = useCartStore();

  const isInCart = items.some((item) => item.product.id === product.id);

  // 'inStock' isn't in the backend contract yet, I'LL assume it's true for now!
  const isAvailable = product.stock_count > 0;

  const handleCartClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    // await addToCart(product.id)

    if (isInCart) {
      await removeItem(product.id, product.sizes[0]);
    } else {
      await addItem({ productId: product.id, quantity: 1, size: product.sizes[0] });
    }
    setIsLoading(false);
  };

  return (
    <article className={styles.card}>
      <Link href={`/product/${product.slug}`} className={styles.imageLink}>
        <div className={styles.imageContainer}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className={styles.image}
          />
        </div>
      </Link>

      <div className={styles.details}>
        <h2 className={styles.productName}>{product.name}</h2>

        <div className={styles.statusWrapper}>
          <div className={styles.firstStat}>
            <span className={styles.currentPrice}>
              {formatNaira(product.price)}
            </span>
          </div>

          {isAvailable ? (
            <span className={styles.inStock}>In Stock</span>
          ) : (
            <span className={styles.outOfStock}>Out of Stock</span>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 ? (

        <Link 
          href={`/product/${product.slug}`} 
          className={styles.cartBtn} 
        >
          <span>ADD TO CART</span>
        </Link>

        ) : (

        <button
          type="button"
          onClick={handleCartClick}
          disabled={!isAvailable || isLoading}
          className={isInCart ? styles.removeBtn : styles.cartBtn}
        >
          <ShoppingCart className={styles.icon} />
          {isLoading ? (
            <span>{isInCart ? 'Removing...' : 'Adding...'}</span>
          ) : !isAvailable ? (
            'Unavailable'
          ) : isInCart ? (
            'Remove from Cart'
          ) : (
            'Add to Cart'
          )}
        </button>

        )}
      </div>
    </article>
  );
}

export default function CollectionsPage({
  initialProducts = [],
}: {
  initialProducts?: ProductContract[];
}) {
  const products = initialProducts;

  return (
    <main className={styles.pageWrapper}>
      {/* <Navbar /> */}

      <h1 className={styles.pageTitle}>New Collections</h1>
      <p className={styles.pageSubtitle}>Discover Our Latest Arrivals</p>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className={styles.seeMoreWrapper}>
        <Link href="/collection" className={styles.seeMoreBtn}>
          See More Collections
          <ArrowRight className={styles.heroButtonIcon} />
        </Link>
      </div>
    </main>
  );
}
