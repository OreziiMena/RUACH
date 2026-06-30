"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, Heart, ChevronDown, LayoutDashboard } from "lucide-react";
import styles from "./Navbar.module.css";
import { useSession, signOut } from "next-auth/react";
import { useWishlistStore } from "@/app/store/wishliststore";

const MenuIcon = ({ className, strokeWidth = 1.5 }: { className?: string, strokeWidth?: number }) => (
  <svg className={className} strokeWidth={strokeWidth} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = ({ className, strokeWidth = 1.5 }: { className?: string, strokeWidth?: number }) => (
  <svg className={className} strokeWidth={strokeWidth} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 

  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN";

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleResources = () => setIsResourcesOpen(!isResourcesOpen);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navInner}>
          <div className={styles.leftSide}>
            <Link href="/" className={styles.logoLink}>
              <div className={styles.logoWrapper}>
                <Image
                  src="/Assets/RUACH logo.png"
                  alt="RUACH H. FASHION Logo"
                  fill
                  unoptimized
                  className={styles.logoImage}
                />
              </div>
              <span className={styles.brandText}>RUACH H. FASHION</span>
            </Link>

            <div className={styles.desktopNav}>
              <Link href="/" className={styles.navLink}>Home</Link>
              <Link href="/about" className={styles.navLink}>About</Link>
              <Link href="/collection" className={styles.navLink}>Collection</Link>
              <div
                className={styles.dropdownContainer}
                onMouseEnter={() => setIsResourcesOpen(true)}
                onMouseLeave={() => setIsResourcesOpen(false)}
              >
                <button className={styles.dropdownBtn}>
                  Info <ChevronDown className={styles.chevronIcon} />
                </button>
                <AnimatePresence>
                  {isResourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={styles.dropdownMenu}
                    >
                      <Link href="/faq" className={styles.dropdownItem}>FAQs</Link>
                      <Link href="/size-guide" className={styles.dropdownItem}>Size Guide</Link>
                      <Link href="/contact" className={styles.dropdownItem}>Contact</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className={styles.rightSide}>
            {user ? (
              <div className={styles.desktopAuthSection}>
                <div
                  className={styles.dropdownContainer}
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <button className={styles.dropdownBtn} style={{ textTransform: 'none' }}>
                    <span className={styles.welcomeText}>Welcome, {user.name}!</span>
                    <ChevronDown className={styles.chevronIcon} />
                  </button>
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={styles.dropdownMenu}
                        style={{ right: 0, left: 'auto' }}
                      >
                        <Link href="/orders" className={styles.dropdownItem}>My Order History</Link>
                        {isAdmin && <Link href="/admin" className={styles.dropdownItem} style={{ color: 'var(--terracotta)', fontWeight: 600 }}>Admin Dashboard</Link>}
                        <button 
                          onClick={() => signOut()} 
                          className={styles.dropdownItem}
                          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className={styles.authLinks}>
                <Link href="/login" className={styles.authLink}>Login</Link>
                <span className={styles.authDivider}>/</span>
                <Link href="/signup" className={styles.authLink}>Sign Up</Link>
              </div>
            )}

            <Link href="/wishlist" className={styles.iconBtn} style={{ position: "relative", display: "inline-flex" }}>
              <Heart strokeWidth={1.5} className={styles.iconSize} />
              {wishlistCount > 0 && (
                <span className={styles.wishlistBadge}>
                  {wishlistCount}
                </span>
              )}
            </Link>
            

            <div className={styles.mobileMenuBtnContainer}>
              <button onClick={toggleMobileMenu} className={styles.mobileMenuBtn}>
                {isMobileMenuOpen ? <CloseIcon strokeWidth={1.5} className={styles.mobileIconSize} /> : <MenuIcon strokeWidth={1.5} className={styles.mobileIconSize} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.mobileMenu}
          >
            <div className={styles.mobileMenuInner}>
              <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link href="/about" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
              <Link href="/collection" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Collection</Link>

              <div className={styles.mobileDropdownSection}>
                <button onClick={toggleResources} className={styles.mobileDropdownBtn}>
                  Info
                  <ChevronDown className={`${styles.chevronIcon} ${isResourcesOpen ? styles.rotate180 : ""}`} />
                </button>
                <AnimatePresence>
                  {isResourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.mobileDropdownContent}
                    >
                      <Link href="/faq" className={styles.mobileSubLink} onClick={() => setIsMobileMenuOpen(false)}>FAQs</Link>
                      <Link href="/size-guide" className={styles.mobileSubLink} onClick={() => setIsMobileMenuOpen(false)}>Size Guide</Link>
                      <Link href="/contact" className={styles.mobileSubLink} onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={styles.mobileAuthSection}>
                {user ? (
                  <>
                    <Link href="/orders" className={styles.mobileAuthBtn} onClick={() => setIsMobileMenuOpen(false)}>My Order History</Link>
                    {isAdmin && <Link href="/admin" className={styles.mobileAuthBtn} onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--terracotta)' }}>Admin Dashboard</Link>}
                    <button 
                      onClick={() => { signOut(); setIsMobileMenuOpen(false); }} 
                      className={styles.mobileAuthBtn}
                      style={{ color: 'var(--burnt-umber)' }}
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={styles.mobileAuthBtn} onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                    <Link href="/signup" className={styles.mobileAuthBtnPrimary} onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}