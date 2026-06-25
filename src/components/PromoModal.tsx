"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./PromoModal.module.css";

export default function PromoModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the promo modal in this session/browser
    const hasDismissed = localStorage.getItem("ruach_h_fashion_promo_dismissed");
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("ruach_h_fashion_promo_dismissed", "true");
  };

  const handleSignUpClick = () => {
    handleClose();
    router.push("/signup");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className={styles.modalBox}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={styles.closeBtn}
              aria-label="Close promotion modal"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {/* Badge */}
            <span className={styles.badge}>MEMBER PRIVILEGE</span>


            {/* Description */}
            <p className={styles.description}>
              Join RUACH H. FASHION today. Register your account to receive early access to new collections and good discount rates.
            </p>

            {/* Action Buttons */}
            <button
              onClick={handleSignUpClick}
              className={styles.actionBtn}
            >
              SIGN UP NOW
            </button>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
