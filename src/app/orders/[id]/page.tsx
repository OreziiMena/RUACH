"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { ArrowLeft, Copy, CheckCircle2, Clock } from "lucide-react";
import { handleClientError } from "@/lib/clientErrorHandler";
import styles from "./id.module.css";
import { UserOrderContract } from "@/contracts/order";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<UserOrderContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Fetch Order Data
  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<UserOrderContract>(`/api/orders/${orderId}`);
      // Safely extract data depending on how the backend wraps it
      setOrder(response.data);
      console.log(typeof response.data.createdAt)
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  // Action: Copy ID
  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Action: Pay (Wired to /pay GET route)
  const handlePay = async () => {
    try {
      setIsActionLoading(true);
      const response = await axios.get(`/api/orders/${orderId}/pay`);
      if (response.data.url) {
        window.location.href = response.data.url; // Redirect to payment gateway
      }
    } catch (error) {
      handleClientError(error);
      setIsActionLoading(false);
    }
  };

    // This opens the modal
    const handleCancelClick = () => {
    setIsCancelModalOpen(true);
    };

    // This runs when they confirm inside the modal
    const confirmCancel = async () => {
    try {
        setIsActionLoading(true);
        await axios.get(`/api/orders/${orderId}/cancel`);
        await fetchOrder(); // Refresh data to show CANCELLED status
        setIsCancelModalOpen(false); // Close modal on success
    } catch (error) {
        handleClientError(error);
    } finally {
        setIsActionLoading(false);
    }
    };

  const formatNaira = (amount: number) => {
    // Safety check just in case the total amount is undefined
    const validAmount = amount || 0;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(validAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusState = (stepStatus: string) => {
    if (!order?.status) return 'pending';
    const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (order.status === 'CANCELLED') return stepStatus === 'PENDING' ? 'completed' : 'pending';
    
    const currentIndex = statuses.indexOf(order.status);
    const stepIndex = statuses.indexOf(stepStatus);
    
    if (stepIndex <= currentIndex) return 'completed';
    return 'pending';
  };

  if (isLoading) return <div className={styles.loadingWrapper}>Loading order...</div>;
  if (!order) return <div className={styles.loadingWrapper}>Order not found.</div>;

  const subtotal = order.orderItems?.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0) || 0;

  const getShippingDetails = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'within_port_harcourt':
        return { name: "Within Port Harcourt", fee: 5000 };
      case 'outside_port_harcourt_doors':
        return { name: "Outside Port Harcourt (Door Delivery)", fee: 20000 };
      case 'outside_port_harcourt_pickup':
        return { name: "Outside Port Harcourt (Pickup)", fee: 10000 };
      default:
        return { name: "Standard Shipping", fee: 0 };
    }
  };

  const shippingInfo = getShippingDetails(order.shippingMethod);
  const shippingFee = order.shippingMethod ? shippingInfo.fee : 0;
  const hasTax = order.totalAmount > (subtotal + shippingFee) || order.status === 'PENDING';
  const tax = hasTax ? subtotal * 0.075 : 0;
  const displayedTotal = hasTax ? (subtotal + shippingFee + tax) : order.totalAmount;

  return (
    <main className={styles.pageWrapper}>
      {/* Top Navigation */}
      <nav className={styles.nav}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={20} /> Back to Orders
        </button>
      </nav>

      <div className={styles.container}>
        {/* Header Information */}
        <header className={styles.header}>
          <h1 className={styles.orderIdTitle}>Order #{order.id?.split('-')[0].toUpperCase()}</h1>
          <p className={styles.dateText}>Placed on {formatDate(order.createdAt.toString())}</p>
          
          <div className={styles.statusBadgeWrapper}>
            <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase() || 'pending']}`}>
              {order.status ? order.status.charAt(0) + order.status.slice(1).toLowerCase() : 'Pending'}
            </span>
          </div>

          <button onClick={handleCopy} className={styles.copyBtn}>
            <Copy size={16} /> {copied ? "Copied!" : "Copy ID"}
          </button>
        </header>

        {/* Section 1: Order Status Timeline */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Order Status</h2>
          <div className={styles.timeline}>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIconWrapper}>
                {getStatusState('PENDING') === 'completed' ? <CheckCircle2 size={24} className={styles.iconCompleted} /> : <Clock size={24} className={styles.iconPending} />}
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <h3>Order Pending</h3>
                  <span>{formatDate(order.createdAt.toString())}</span>
                </div>
                <p>Your order is awaiting payment for processing</p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIconWrapper}>
                {getStatusState('PROCESSING') === 'completed' ? <CheckCircle2 size={24} className={styles.iconCompleted} /> : <Clock size={24} className={styles.iconPending} />}
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <h3>Processing</h3>
                  {getStatusState('PROCESSING') === 'completed' && <span>{formatDate(order.updatedAt.toString())}</span>}
                </div>
                <p>Your order is being prepared</p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIconWrapper}>
                {getStatusState('SHIPPED') === 'completed' ? <CheckCircle2 size={24} className={styles.iconCompleted} /> : <Clock size={24} className={styles.iconPending} />}
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <h3>Shipped</h3>
                </div>
                <p>Your order is on the way</p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIconWrapper}>
                {getStatusState('DELIVERED') === 'completed' ? <CheckCircle2 size={24} className={styles.iconCompleted} /> : <Clock size={24} className={styles.iconPending} />}
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <h3>Delivered</h3>
                </div>
                <p>Your order has been delivered</p>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Order Items */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Order Items ({order.orderItems?.length || 0})</h2>
          <div className={styles.itemsList}>
            {order.orderItems?.map((item) => {
              // Extract the correct price value safely
              const itemPrice = item.priceAtPurchase;
              // Extract image URL safely
              const itemImage = item.product.imageUrl;

              return (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemImageContainer}>
                    <Image 
                      src={itemImage} 
                      alt={item.product?.name || "Product"} 
                      fill 
                      unoptimized
                      className={styles.itemImage}
                    />
                  </div>
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.product?.name}</h3>
                    <div className={styles.itemMeta}>
                      <span>Quantity: {item.quantity}</span>
                      <span className={styles.itemPrice}>{formatNaira(itemPrice * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className={styles.summaryTotals}>
            <div className={styles.totalRow}>
              <span>Subtotal:</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Shipping ({shippingInfo.name}):</span>
              <span>{formatNaira(shippingInfo.fee)}</span>
            </div>
            {tax > 0 && (
              <div className={styles.totalRow}>
                <span>VAT (7.5%):</span>
                <span>{formatNaira(tax)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Total:</span>
              <span>{formatNaira(displayedTotal)}</span>
            </div>
          </div>
        </section>

        {/* Section 3: Payment */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Payment</h2>
          <div className={`${styles.totalRow} ${styles.paymentRow}`}>
            <span>Total Paid:</span>
            <span>{order.status === 'PENDING' ? formatNaira(0) : formatNaira(displayedTotal)}</span>
          </div>
          
          {/* Action Buttons if Pending */}
          {order.status === 'PENDING' && (
            <div className={styles.actionButtonGroup}>
              <button onClick={handlePay} disabled={isActionLoading} className={styles.payNowBtn}>
                {isActionLoading ? "Processing..." : "Pay Now"}
              </button>
              <button onClick={handleCancelClick} disabled={isActionLoading} className={styles.cancelBtn}>
                Cancel Order
              </button>
            </div>
          )}
        </section>

        {/* Section 4: Shipping Address */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Shipping Address</h2>
          <div className={styles.addressInfo}>
            <p className={styles.contactName}>{order.contactName}</p>
            <p>{order.streetAddress}</p>
            <p>{order.city}, {order.state}</p>
            <p>Phone: {order.contactPhone}</p>
            <div style={{ margin: '1rem 0', borderTop: '1px solid rgba(253, 251, 247, 0.1)' }}></div>
            <p style={{ margin: 0, color: 'var(--ivory, #FDFBF7)' }}>
              <strong>Shipping Method:</strong> {shippingInfo.name} ({formatNaira(shippingInfo.fee)})
            </p>
          </div>
        </section>

      </div>

      {/* Custom Cancel Modal */}
      {isCancelModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Cancel Order</h3>
            <p className={styles.modalText}>
              Are you sure you want to cancel Order #{order.id?.split('-')[0].toUpperCase()}? <br></br> This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button 
                onClick={() => setIsCancelModalOpen(false)} 
                disabled={isActionLoading}
                className={styles.modalKeepBtn}
              >
                No, Keep Order
              </button>
              <button 
                onClick={confirmCancel} 
                disabled={isActionLoading}
                className={styles.modalConfirmBtn}
              >
                {isActionLoading ? "Canceling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}