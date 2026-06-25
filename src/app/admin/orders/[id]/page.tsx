"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { ArrowLeft, Copy, CheckCircle2, Clock, Save, Edit, ChevronDown } from "lucide-react";
import { handleClientError } from "@/lib/clientErrorHandler";
import styles from "./adminOrderDetails.module.css";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/orders/admin/${orderId}`);
      const fetchedOrder = response.data?.data || response.data;
      
      setOrder(fetchedOrder);
      setEditStatus(fetchedOrder.status);
      setEditNote(fetchedOrder.admin_note || fetchedOrder.adminNote || "");
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUpdate = async () => {
    try {
      setIsSaving(true);
      await axios.patch(`/api/orders/admin/${orderId}`, {
        status: editStatus,
        note: editNote 
      });
      await fetchOrder(); 
    } catch (error: any) {
      handleClientError(error); 
    } finally {
      setIsSaving(false);
    }
  };

  const formatNaira = (amount: number) => {
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

  const getStatusLabel = (statusValue: string) => {
    return STATUS_OPTIONS.find(opt => opt.value === statusValue)?.label || statusValue || "Select Status";
  };

  if (isLoading) return <div className={styles.loadingWrapper}>Loading order details...</div>;
  if (!order) return <div className={styles.loadingWrapper}>Order not found.</div>;

  const subtotal = order.orderItems?.reduce((sum: any, item: any) => {
    const itemPrice = item.price_at_purchase || item.priceAtPurchase || item.price || item.product?.price || 0;
    return sum + (itemPrice * item.quantity);
  }, 0) || 0;

  const getShippingDetails = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'within_port_harcourt':
        return { name: "Port Harcourt Delivery", fee: 5000 };
      case 'outside_port_harcourt_doors':
        return { name: "Door Delivery", fee: 20000 };
      case 'outside_port_harcourt_pickup':
        return { name: "Pickup", fee: 10000 };
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
      <nav className={styles.nav}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={20} /> Back to Admin Orders
        </button>
      </nav>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.orderIdTitle}>Order #{order.id?.split('-')[0].toUpperCase()}</h1>
          <p className={styles.dateText}>Placed on {formatDate(order.createdAt || order.created_at)}</p>
          
          <button onClick={handleCopy} className={styles.copyBtn}>
            <Copy size={16} /> {copied ? "Copied!" : "Copy Full ID"}
          </button>
        </header>

        <div className={styles.gridContainer}>
          <div className={styles.leftColumn}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Customer Timeline</h2>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIconWrapper}>
                    {getStatusState('PENDING') === 'completed' ? <CheckCircle2 size={24} className={styles.iconCompleted} /> : <Clock size={24} className={styles.iconPending} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}><h3>Order Pending</h3></div>
                  </div>
                </div>

                <div className={styles.timelineItem}>
                  <div className={styles.timelineIconWrapper}>
                    {getStatusState('PROCESSING') === 'completed' ? <CheckCircle2 size={24} className={styles.iconCompleted} /> : <Clock size={24} className={styles.iconPending} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}><h3>Processing</h3></div>
                  </div>
                </div>

                <div className={styles.timelineItem}>
                  <div className={styles.timelineIconWrapper}>
                    {getStatusState('SHIPPED') === 'completed' ? <CheckCircle2 size={24} className={styles.iconCompleted} /> : <Clock size={24} className={styles.iconPending} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}><h3>Shipped</h3></div>
                  </div>
                </div>

                <div className={styles.timelineItem}>
                  <div className={styles.timelineIconWrapper}>
                    {getStatusState('DELIVERED') === 'completed' ? <CheckCircle2 size={24} className={styles.iconCompleted} /> : <Clock size={24} className={styles.iconPending} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}><h3>Delivered</h3></div>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Order Items ({order.orderItems?.length || 0})</h2>
              <div className={styles.itemsList}>
                {order.orderItems?.map((item: any) => {
                  const itemPrice = item.price_at_purchase || item.priceAtPurchase || item.price || item.product?.price || 0;
                  const itemImage = item.product?.imageUrl || item.product?.image || (item.product?.images && item.product.images[0]) || "/placeholder.png";

                  return (
                    <div key={item.id} className={styles.itemRow}>
                      <div className={styles.itemImageContainer}>
                        <Image src={itemImage} alt={item.product?.name || "Product"} fill unoptimized className={styles.itemImage} />
                      </div>
                      <div className={styles.itemDetails}>
                        <h3 className={styles.itemName}>{item.product?.name}</h3>
                        <div className={styles.itemMeta}>
                          <span>Quantity: {item.quantity}</span>
                          {item.size && <span className={styles.itemSize}>Size: {item.size}</span>}
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
                {order.shippingMethod && (
                  <div className={styles.totalRow}>
                    <span>Shipping ({shippingInfo.name}):</span>
                    <span>{formatNaira(shippingInfo.fee)}</span>
                  </div>
                )}
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
          </div>

          <div className={styles.rightColumn}>
            <section className={`${styles.card} ${styles.adminCard}`}>
              <h2 className={styles.cardTitle}><Edit size={20}/> Admin Controls</h2>
              
              <div className={styles.adminGrid}>
                <div className={styles.adminField}>
                  <label>Update Status</label>
                  <div className={styles.editStatusWrapper} style={{ position: 'relative' }}>
                    <div 
                      className={styles.customSelectTrigger}
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    >
                      <span>{getStatusLabel(editStatus)}</span>
                      <ChevronDown size={16} className={`${styles.selectIcon} ${isStatusDropdownOpen ? styles.iconOpen : ""}`} />
                    </div>

                    {isStatusDropdownOpen && (
                      <div className={styles.customSelectMenu}>
                        {STATUS_OPTIONS.map((option) => (
                          <div 
                            key={option.value}
                            className={`${styles.customSelectOption} ${editStatus === option.value ? styles.optionActive : ""}`}
                            onClick={() => {
                              setEditStatus(option.value);
                              setIsStatusDropdownOpen(false);
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.adminField}>
                  <label>Internal Admin Note</label>
                  <textarea 
                    className={styles.noteInput}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Add tracking numbers, delays, or internal memos here..."
                    rows={3}
                  />
                </div>
              </div>

              <button 
                className={styles.saveBtn} 
                onClick={handleSaveUpdate}
                disabled={isSaving || (editStatus === order.status && editNote === (order.admin_note || order.adminNote || ""))}
              >
                <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Customer & Shipping Info</h2>
              <div className={styles.addressInfo}>
                <p className={styles.contactName}>{order.contactName}</p>
                <p>{order.contactEmail}</p>
                <p>Phone: {order.contactPhone}</p>
                <div className={styles.divider}></div>
                <p>{order.streetAddress}</p>
                <p>{order.city}, {order.state}</p>
                <p>{order.country}</p>
                {order.zip_code && <p>ZIP: {order.zip_code}</p>}
                {order.shippingMethod && (
                  <>
                    <div className={styles.divider}></div>
                    <p style={{ margin: 0, color: 'var(--ivory, #FDFBF7)' }}>
                      <strong>Shipping Method:</strong> ({shippingInfo.name} - {formatNaira(shippingInfo.fee)})
                    </p>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}