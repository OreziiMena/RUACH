"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./contact.module.css";

// A custom TikTok SVG since it's not standard in Lucide
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Message sent successfully!"); // Replace with a sleek toast notification
    }, 1500);
  };

  return (
      <div className={styles.container}>
        
        {/* Page Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>We are here to assist you with your collection.</p>
        </header>

        <div className={styles.grid}>
          
          {/* LEFT COLUMN: The Form */}
          <section className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.form}>
              
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>Full Name</label>
                <input type="text" id="name" required className={styles.input} />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <input type="email" id="email" required className={styles.input} />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="order" className={styles.label}>Order Number (Optional)</label>
                <input type="text" id="order" className={styles.input} />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="message" className={styles.label}>Message</label>
                <textarea id="message" required className={styles.textarea}></textarea>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
              </button>
              
            </form>
          </section>

          {/* RIGHT COLUMN: The Information */}
          <section className={styles.infoSection}>
            
            <div className={styles.infoBlock}>
              <h2 className={styles.infoTitle}>Client Services</h2>
              <p className={styles.infoText}>
                All orders are confirmed upon full payment.<br /><br />
                Some pieces are made in limited quantities or produced on demand, 
                so processing begins immediately after confirmation. <br /><br />
                Orders cannot be changed or canceled once production has started.<br /><br />
                Production Time<br /><br />
                • Ready-to-wear: 3–7 working days <br /><br />
                • Made-to-order: 7–21 working days
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h2 className={styles.infoTitle}>Get in Touch</h2>
              <a href="mailto:ruachhfashion@gmail.com" className={styles.infoLink}>ruachhfashion@gmail.com</a>
              <a href="tel:+2348100837851" className={styles.infoLink}>+234 810 083 7851</a>
            </div>

            <div className={styles.infoBlock}>
              <h2 className={styles.infoTitle}>Assistance</h2>
              <Link href="/faq" className={styles.infoLink}>Frequently Asked Questions</Link>
              <Link href="./policies" className={styles.infoLink}>Shipping & Returns Policy</Link>
            </div>

            <div className={styles.socialBlock}>
              <h2 className={styles.infoTitle}>Follow Us</h2>
              <div className={styles.socialIcons}>
                <a href="https://www.instagram.com/moorafrika?igsh=bXZyOHRhOHEybTk0&utm_source=qr" aria-label="Instagram" className={styles.socialIcon}><InstagramIcon className={styles.socialIconSvg} /></a>
                <a href="#" aria-label="Twitter" className={styles.socialIcon}><TwitterIcon className={styles.socialIconSvg} /></a>
                <a href="#" aria-label="TikTok" className={styles.socialIcon}><TikTokIcon className={styles.socialIconSvg} /></a>
                <a href="#" aria-label="Facebook" className={styles.socialIcon}><FacebookIcon className={styles.socialIconSvg} /></a>
              </div>
            </div>

          </section>

        </div>
      </div>
  );
}