"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
      <div className={styles.splitLayout}>
        {/* Left Side: The Sticky Image */}
        <div className={styles.imageColumn}>
          <div className={styles.stickyImageWrapper}>
            <Image
              src="/Assets/brandd-logo-white.png" 
              alt="RUACH H. FASHION Heritage"
              fill
              priority
              className={styles.image}
            />
          </div>
        </div>

        {/* Right Side: The Scrolling Story */}
        <div className={styles.textColumn}>
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={styles.textContent}
          >
            <span className={styles.subtitle}>Our Story</span>
            <h1 className={styles.title}>RUACH H. FASHION</h1>
            
            <p className={styles.paragraph}>
              RUACH H. FASHION is more than a fashion brand—it is a statement of identity, intention, and modern expression. 
            </p>
            
            <p className={styles.paragraph}>
             The name is rooted in the Hebrew word, Ruach which means breath, wind, or Spirit and HaKodesh which means the holy or set-apart. We believe that fashion should be a living 
             expression of the Ruach HaKodesh, the holy Spirit by reflecting purity, power, and excellence in every thread.
            </p>

             <p className={styles.paragraph}>
                We offer the following services
               </p>

              <ul className={styles.paragraph}>
                <li>We make male and female traditional attires</li>
                <li>We make male and female coperate wears</li>
                <li>We make uniforms</li>
                <li>We train</li>
              </ul>

              <p className={styles.paragraph}>
                Breathing life into fashion.
              </p>
      
            <div className={styles.quoteBlock}>
              <div className={styles.quoteLine}></div>
              <blockquote>
               To transform the way we dress, moving beyond trends to creating a living witness of faith, quality, and ethical craftsmanship.
              </blockquote>
            </div>

          </motion.div>
        </div>
      </div>
  );
}