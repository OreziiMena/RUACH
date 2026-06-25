"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import styles from "../auth.module.css";
import axios from "axios";
import { handleClientError } from "@/lib/clientErrorHandler";
    

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await axios.post('/api/auth/register', { name, email, password });
      // Redirect to the homepage
      router.push("/");

    } catch (error) {
      handleClientError(error, { setErrorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Left Column: Editorial Image */}
      <div className={styles.imageColumn}>
        <Image
          src="/Assets/IMG_0993.JPG"
          alt="Luxury fashion model editorial signup"
          fill
          priority
          sizes="50vw"
          className={styles.brandImage}
        />
        <div className={styles.imageOverlay} />
      </div>

      {/* Right Column: Signup Form */}
      <div className={styles.formColumn}>
        <div className={styles.authBox}>
          <Link href="/" style={{ display: 'inline-flex', marginBottom: '2rem', color: 'rgba(253, 251, 247, 0.5)' }}>
            <ArrowLeft size={20} />
          </Link>

          <header className={styles.header}>
            <h1 className={styles.title}>Join Mo&apos;orafrika</h1>
            <p className={styles.subtitle}>Create an account for exclusive access.</p>
          </header>

          <form onSubmit={handleSignup} className={styles.form}>
            {errorMsg && <div style={{ color: '#E2725B', fontSize: '0.85rem', textAlign: 'center' }}>User already exists</div>}

            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <input 
                id="name" 
                required 
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className={styles.footerLinks}>
            <p>
              <span style={{ opacity: 0.6 }}>Already have an account? </span>
              <Link href="/login" className={styles.link}>Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}