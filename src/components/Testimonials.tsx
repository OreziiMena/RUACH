"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import { Review } from "../types";
import styles from "./Testimonials.module.css";

const reviews: Review[] = [
  {
    id: "1",
    name: "EJiofor Elliot",
    rating: 5,
    text: "The quality is simply unmatched. The structured blazer fits perfectly and the material feels incredibly premium."
  },
  {
    id: "2",
    name: "Michael Chen",
    rating: 5,
    text: "RUACH H. FASHION has completely elevated my wardrobe. The pieces are timeless yet modern. Fast shipping too!"
  },
  {
    id: "3",
    name: "Olise Chibuzor",
    rating: 4,
    text: "Beautiful designs. The material is the softest I've ever owned. Will definitely be purchasing more."
  },
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.header}
        >
          <span className={styles.title}>Reviews</span>
          <p className={styles.description}>Hear from those who wear our vision</p>
        </motion.div>

        <div className={styles.grid}>
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={styles.card}
            >
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`${styles.star} ${i < review.rating ? styles.starFilled : styles.starEmpty}`} strokeWidth={1} />
                ))}
              </div>
              <p className={styles.text}>
                "{review.text}"
              </p>
              <div className={styles.clientInfo}>
                {review.avatar ? (
                  <div className={styles.avatarWrapper}>
                    <Image src={review.avatar} alt={review.name} fill className={styles.avatarImage} />
                  </div>
                ) : (
                  <div className={styles.avatarFallback}>
                    <span className={styles.avatarFallbackText}>{review.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h4 className={styles.clientName}>{review.name}</h4>
                  <p className={styles.clientStatus}>Verified Client</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
