"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import styles from "../auth.module.css"; 
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {

        const res = await signIn('credentials', { email, password, redirect: false })
        if (!res || res.error) {
            throw new Error(res?.error || "Login failed");
        }
      
      router.push("/");

    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      

      {/* Right Column: Login Form */}
      <div className={styles.formColumn}>
        <div className={styles.authBox}>
          <Link href="/" style={{ display: 'inline-flex', marginBottom: '2rem', color: 'rgba(253, 251, 247, 0.5)' }}>
            <ArrowLeft size={20} />
          </Link>

          <header className={styles.header}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Enter your details to access your collection.</p>
          </header>

          <form onSubmit={handleLogin} className={styles.form}>
            {errorMsg && <div style={{ color: '#E2725B', fontSize: '0.85rem', textAlign: 'center' }}>{errorMsg}</div>}

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

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  required 
                  className={styles.input}
                  style={{ width: "100%", paddingRight: "3rem" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <Link href="/forgot-password" className={`${styles.link} ${styles.forgotPassword}`}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "LOGGING IN..." : "LOG IN"}
            </button>
          </form>

          <div className={styles.footerLinks}>
            <p>
              <span style={{ opacity: 0.6 }}>Don&apos;t have an account? </span>
              <Link href="/signup" className={styles.link}>Create Account</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Left Column: Editorial Image */}
      <div className={styles.imageColumn}>
        <Image
          src="/Assets/IMG_0993.JPG"
          alt="Luxury fashion model editorial"
          fill
          priority
          sizes="50vw"
          className={styles.brandImage}
        />
        <div className={styles.imageOverlay} />
      </div>
    </div>
  );
}