"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./checkout.module.css";
import { useCartStore } from "@/app/store/cartStore";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { handleClientError } from "@/lib/clientErrorHandler";
import { ProductContract } from "@/contracts/product";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
];

export default function CheckoutPage() {
  const router = useRouter();
  const { status, data } = useSession();
  const user = data?.user;
  const { items } = useCartStore();

  const [formData, setFormData] = useState({
    firstName: user?.name ? user.name.split(" ")[0] : "",
    lastName: user?.name ? user.name.split(" ")[1] : "",
    address: user?.address || "",
    city: "",
    postalCode: "",
    state: "Lagos",
    country: "NG",
    email: user?.email || "",
    phone: user?.phone || ""
  });

  const [shippingMethod, setShippingMethod] = useState("door");

  const [isProcessing, setIsProcessing] = useState(false);
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

  const subtotal = items.reduce((acc, item) => acc + (getDiscountedPrice(item.product) * item.quantity), 0);
  const tax = subtotal * 0.075;

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.info('Please log in to proceed to checkout');
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/collection");
    }
  }, [items, router]);

  const calculateShippingCost = (state: string, shippingMethod: string) => {
    if (state === "Rivers") {
      return 5000;
    }

    switch (shippingMethod) {
      case "door":
        return 20000;
      case "pick-up":
        return 10000;
      default:
        return 0;
    }
  };

  const mapShippingToMethod = (state: string, shippingMethod: string) => {
    if (state === "Rivers") {
      return "within_port_harcourt";
    }

    switch (shippingMethod) {
      case "door":
        return "outside_port_harcourt_doors";
      case "pick-up":
        return "outside_port_harcourt_pickup";
      default:
        return "outside_port_harcourt_doors";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      country: newCountry,
      state: newCountry === "NG" ? "Lagos" : "" 
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await axios.post("/api/orders", {
        streetAddress: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        zipCode: formData.postalCode,
        contactName: `${formData.firstName} ${formData.lastName}`,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        shippingMethod: mapShippingToMethod(formData.state, shippingMethod)
      });

      window.location.href = response.data.url;
    } catch (error) {
      handleClientError(error);
      setIsProcessing(false);
    }
  };

  const shippingCost = calculateShippingCost(formData.state, shippingMethod);
  const total = subtotal + shippingCost + tax;

  return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>CHECKOUT</h1>
          <p className={styles.subtitle}>Fill in your details to complete your purchase</p>
        </header>

        <div className={styles.containerr}>
          <div className={styles.formSection}>
            <form onSubmit={handleCheckout} className={styles.form}>
              <section className={styles.formGroup}>
                <div className={styles.inputGrid}>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="firstName">First name</label>
                    <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="lastName">Last name</label>
                    <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.inputWrapper} style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="address">Street number and name or P.O box</label>
                    <input type="text" id="address" value={formData.address} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="city">City</label>
                    <input type="text" id="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  
                  <div className={styles.inputWrapper}>
                    <label htmlFor="country">Country</label>
                    <select id="country" value={formData.country} onChange={handleCountryChange} required>
                      <option value="NG">Nigeria</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>

                  <div className={styles.inputWrapper}>
                    <label htmlFor="state">State / Province</label>
                    {formData.country === "NG" ? (
                      <select id="state" value={formData.state} onChange={handleInputChange} required>
                        <option value="" disabled>Select State</option>
                        {NIGERIAN_STATES.map((stateName) => (
                          <option key={stateName} value={stateName}>
                            {stateName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        id="state" 
                        value={formData.state} 
                        onChange={handleInputChange} 
                        placeholder="e.g. California, London"
                        required 
                      />
                    )}
                  </div>
                </div>
              </section>

              <section className={styles.formGroup}>
                <h2 className={styles.sectionTitle}>Enter Contact Info</h2>
                <div className={styles.inputGrid}>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="phone">Mobile phone number</label>
                    <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} required />
                  </div>
                </div>
              </section>

              <section className={styles.formGroup}>
                <h2 className={styles.sectionTitle}>Select a Shipping Method</h2>
                <div className={styles.radioGroup}>
                  <label className={`${styles.radioLabel} ${shippingMethod === "door" ? styles.activeRadio : ""}`}>
                    <div className={styles.radioInfo}>
                      <input 
                        type="radio" 
                        name="shipping" 
                        value="door" 
                        checked={shippingMethod === "door"}
                        onChange={(e) => setShippingMethod(e.target.value)}
                      />
                      <span>Door-to-Door</span>
                    </div>
                    <span>{formatNaira(calculateShippingCost(formData.state, "door"))}</span>
                  </label>
                  <label className={`${styles.radioLabel} ${shippingMethod === "pick-up" ? styles.activeRadio : ""}`}>
                    <div className={styles.radioInfo}>
                      <input 
                        type="radio" 
                        name="shipping" 
                        value="pick-up" 
                        checked={shippingMethod === "pick-up"}
                        onChange={(e) => setShippingMethod(e.target.value)}
                      />
                      <span>Pick-up</span>
                    </div>
                    <span>{formatNaira(calculateShippingCost(formData.state, "pick-up"))}</span>
                  </label>
                </div>
              </section>

              <button type="submit" className={styles.submitBtn} disabled={isProcessing}>
                {isProcessing ? "PROCESSING..." : "CONTINUE TO PAYMENT"}
              </button>
            </form>
          </div>

          <aside className={styles.summarySection}>
            <div className={styles.stickyContainer}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>
              
              <div className={styles.cartItems}>
                {items.length === 0 ? (
                  <p style={{ color: '#a1a1aa' }}>Your cart is empty.</p>
                ) : (
                  items.map((item) => {
                    const pct = getProductDiscountPercentage(item.product);
                    const discountedPrice = pct ? item.product.price * (1 - pct / 100) : null;
                    return (
                      <div key={`${item.product.id}-${item.size || 'default'}`} className={styles.cartItem}>
                        <div className={styles.itemImage}>
                          <Image 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            width={60}
                            height={80}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </div>
                        <div className={styles.itemDetails}>
                          <h3>{item.product.name}</h3>
                          <p>Size: {item.size || "Standard"} | Qty: {item.quantity}</p>
                          {discountedPrice !== null ? (
                            <p className={styles.itemPrice}>
                              <span style={{ color: '#8B3A2B', fontWeight: 600, marginRight: '0.5rem' }}>
                                {formatNaira(discountedPrice)}
                              </span>
                              <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.85em' }}>
                                {formatNaira(item.product.price)}
                              </span>
                            </p>
                          ) : (
                            <p className={styles.itemPrice}>{formatNaira(item.product.price)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={styles.calculations}>
                <div className={styles.calcRow}>
                  <span>Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <div className={styles.calcRow}>
                  <span>Shipping</span>
                  <span>{formatNaira(shippingCost)}</span>
                </div>
                <div className={styles.calcRow}>
                  <span>VAT (7.5%)</span>
                  <span>{formatNaira(tax)}</span>
                </div>
                <div className={`${styles.calcRow} ${styles.totalRow}`}>
                  <span>Estimated total</span>
                  <span>{formatNaira(total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
  );
}