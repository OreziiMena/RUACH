"use client";

import { motion } from "framer-motion";
import { Clock, Globe, ShieldCheck } from "lucide-react";
import styles from "./Features.module.css";

const features = [
  {
    icon: Clock,
    title: "24/7 Customer Support",
    description: "Our dedicated concierge team is available around the clock to assist you with styling advice and orders."
  },
  {
    icon: Globe,
    title: "Worldwide Shipping",
    description: "Experience our premium delivery service. Complimentary shipping on all international orders over $500."
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Shop with absolute confidence. All transactions are encrypted and processed securely."
  }
];

export default function Features() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={styles.featureItem}
              >
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} strokeWidth={1.5} />
                </div>
                <h3 className={styles.title}>{feature.title}</h3>
                <p className={styles.description}>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
