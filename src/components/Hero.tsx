"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import styles from "./Hero.module.css";
import Link from 'next/link';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      {/* Background Image */}
      <div className={styles.heroBackground}>
        <Image
          src="/Assets/photo_2026-01-25_14-06-50.jpg"
          alt="Fashion Hero Background"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        {/* Overlay */}
        <div className={styles.heroOverlay} />
      </div>

      {/* Content */}
      <div className={styles.heroContent}>
        

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className={styles.heroTitle}    
        >
           <span className={styles.subHeadline}>Breathing</span> life <br className={styles.heroTitleBr} /> into <span className={styles.subHeadline}>fashion.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className={styles.heroDescription}
        >
          Discover our latest collection blending contemporary design with timeless aesthetics. Crafted for those who dare to stand out.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Contrasting background frame to differentiate from the image */}
          <div className={styles.heroButtonContainer}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.heroButton}
            >
                <div className={styles.heroButtonText}>
                <Link href="/collection" className={styles.heroButtonText}>
                    Explore Collections
                    <ArrowRight className={styles.heroButtonIcon} />
                  </Link>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
