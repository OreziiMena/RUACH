"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import styles from "./Newsletter.module.css";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      //  Replace this setTimeout with actual API call 
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulating network request

      setStatus("success");
      setMessage("Welcome to the inner circle. Check your inbox to confirm.");
      setEmail(""); // Clear the input
      
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <section className={styles.sectionWrapper}>
      {/* Left Column: Premium Fashion Image (Desktop only) */}
      <div className={styles.imageColumn}>
        <Image
          src="/Assets/RUACH logo.png"
          alt="Moorafrika Brand Editorial Look"
          fill
          sizes="50vw"
          priority
          className={styles.brandImage}
        />
        <div className={styles.imageOverlay} />
      </div>

      {/* Right Column: Left-aligned Subscription Content */}
      <div className={styles.contentColumn}>
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className={styles.title}>The Inner Circle</h1>
          <p className={styles.subtitle}>
            Subscribe to receive early access to new collections, exclusive editorial content, and private event invitations.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle"); // Clear error when typing
                }}
                placeholder="Enter your email address"
                className={styles.input}
                disabled={status === "loading" || status === "success"}
                required
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={status === "loading" || status === "success" || !email}
            >
              {status === "loading" ? "Subscribing..." : "Join the List"}
              {status !== "loading" && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Dynamic Feedback Messages */}
          {status === "success" && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`${styles.message} ${styles.success}`}
            >
              <CheckCircle size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: '-3px' }} />
              {message}
            </motion.div>
          )}

          {status === "error" && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`${styles.message} ${styles.error}`}
            >
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: '-3px' }} />
              {message}
            </motion.div>
          )}

          <p className={styles.disclaimer}>
            By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}