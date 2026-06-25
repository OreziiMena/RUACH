"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import styles from "../auth.module.css";
import axios from "axios";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!token) {
      setErrorMsg("Reset token is missing. Please request a new link.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        newPassword,
      });
      setSuccessMsg(res.data.message || "Password reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Failed to reset password. Token may be invalid or expired.");
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
        <h1 className={styles.title}>New Password</h1>
        <p className={styles.subtitle}>Enter your new password to secure your account.</p>
      </header>

      {successMsg ? (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <p style={{ color: "#4CAF50", fontWeight: 600, fontSize: "1rem" }}>
            {successMsg}
          </p>
          <p style={{ color: "var(--ivory)", opacity: 0.6, fontSize: "0.85rem" }}>
            Redirecting to login page...
          </p>
          <Link href="/login" className={styles.submitBtn} style={{ textDecoration: "none", textAlign: "center" }}>
            Go to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMsg && (
            <div style={{ color: '#E2725B', fontSize: '0.85rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {!token && (
            <div style={{ color: '#E2725B', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
              Warning: Reset token is missing from URL.
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword" className={styles.label}>New Password</label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showNewPassword ? "text" : "password"} 
                id="newPassword" 
                required 
                className={styles.input}
                style={{ width: "100%", paddingRight: "3rem" }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button 
                type="button" 
                className={styles.eyeBtn}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                id="confirmPassword" 
                required 
                className={styles.input}
                style={{ width: "100%", paddingRight: "3rem" }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button 
                type="button" 
                className={styles.eyeBtn}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading || !token}>
            {isLoading ? "RESETTING..." : "RESET PASSWORD"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.authBox} style={{ textAlign: "center", color: "var(--ivory)", opacity: 0.6 }}>Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
