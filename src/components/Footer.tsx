"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import styles from "./Footer.module.css";
import Image from "next/image";

// Assuming we want a specific TikTok icon SVG since Lucide doesn't have a perfect one
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
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

export const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.868.118.571-.086 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logoLink}>
            <div className={styles.logoWrapper}>
                <Image
                  src="/Assets/brandd-logo.png"
                  alt="RUACH H. FASHION Logo"
                  fill
                  className={styles.logoImage}
                />
              </div>
              <span className={styles.logoText}>RUACH H. FASHION</span>
            </Link>
            <p className={styles.brandDescription}>
              Discover our latest collection blending contemporary design with timeless aesthetics. Crafted for those who dare to stand out.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://www.instagram.com/moorafrika?igsh=bXZyOHRhOHEybTk0&utm_source=qr" className={styles.socialLink}>
                <InstagramIcon className={styles.socialIcon} />
              </a>
              <a href="#" className={styles.socialLink}>
                <TikTokIcon className={styles.socialIcon} />
              </a>
              <a href="#" className={styles.socialLink}>
                <FacebookIcon className={styles.socialIcon} />
              </a>
              <a href="#" className={styles.socialLink}>
                <TwitterIcon className={styles.socialIcon} />
              </a>
            </div>
          </div>

          <div>
            <h4 className={styles.colTitle}>Company</h4>
            <ul className={styles.linkList}>
              <li><Link href="/about" className={styles.linkItem}>About Us</Link></li>
              <li><Link href="/collection" className={styles.linkItem}>Explore Products</Link></li>
              <li><Link href="/policies" className={styles.linkItem}>Brand Policy/ Terms of Service</Link></li>
              <li><Link href="/policy" className={styles.linkItem}>Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Support</h4>
            <ul className={styles.linkList}>
              <li><Link href="/contact" className={styles.linkItem}>Contact Us</Link></li>
              <li><Link href="/faq" className={styles.linkItem}>FAQs</Link></li>
              <li><Link href="/size-guide" className={styles.linkItem}>Size Guide</Link></li>
            </ul>
          </div>


          <div>
            <h4 className={styles.colTitle}>Stay Connected</h4>
            
            <a href="mailto:ruachhfashion@gmail.com" className={styles.emailLink}>
              <Mail className={styles.emailIcon} strokeWidth={1.5} />
               ruachhfashion@gmail.com
            </a>

            <a href="https://wa.me/message/WMJSYNTKNIYTE1" className={styles.emailLink}>
                <WhatsappIcon className={styles.emailIcon} /> Chat with us
            </a>
           
            <a href="#" className={styles.emailLink}>
                <LocationIcon className={styles.emailIcon} /> Nigeria
            </a>
           
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} RUACH H. FASHION. All rights reserved.
          </p>
          <div>
            <span>Designed with precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
