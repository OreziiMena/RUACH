"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../auth.module.css";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const res = await axios.post("/api/auth/forgot-password", { email });
      setMessage(res.data.message || "Password reset email has been sent.");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Failed to request password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authBox}>
      <Link href="/login" style={{ display: 'inline-flex', marginBottom: '2rem', color: 'rgba(253, 251, 247, 0.5)' }}>
        <ArrowLeft size={20} />
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>Enter your email to receive a password reset link.</p>
      </header>

      {message ? (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <p style={{ color: "var(--ivory)", opacity: 0.8, fontSize: "0.95rem", lineHeight: "1.6" }}>
            {message}
          </p>
          <Link href="/login" className={styles.submitBtn} style={{ textDecoration: "none", textAlign: "center" }}>
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMsg && (
            <div style={{ color: '#E2725B', fontSize: '0.85rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input 
              type="email" 
              id="email" 
              required 
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "SENDING..." : "SEND PASSWORD RESET"}
          </button>
        </form>
      )}
    </div>
  );
}
