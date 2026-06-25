"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./Gallery.module.css";

const galleryImages = [
  {
    id: 1,
    src: "/Assets/tunde-buremo-mCt8hjAlNck-unsplash.jpg",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 2,
    src: "/Assets/photo_2026-06-25_18-58-11.jpg",
    alt: "Fashion Look 5",
    featured: false,
    
  },
  {
    id: 3,
    src: "/Assets/photo_2026-01-25_14-39-19.jpg",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 4,
    src: "/Assets/heather-suggitt-Jcg4Y4Zst0o-unsplash.jpg",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 5,
    src: "/Assets/photo_2026-01-22_00-08-05.jpg",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 6,
    src: "/Assets/photo_2026-06-25_18-55-29.jpg",
    alt: "Fashion Look 5",
    featured: false,
  },{
    id: 7,
    src: "/Assets/photo_2026-01-25_14-06-50.jpg",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 8,
    src: "/Assets/photo_2026-06-25_18-59-19.jpg",
    alt: "Fashion Look 5",
    featured: false,
  },
];

export default function Gallery() {
  const getImageSizes = (index: number) => {
    if (index === 0) {
      return "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw";
    }

    if (index === 3) {
      return "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw";
    }

    if (index === 4) {
      return "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";
    }

    return "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";
  };

  return (
    <section className={styles.gallerySection}>
      <div className={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.header}
        >
          <span className={styles.title}>GALLERY</span>
          <h2 className={styles.subtitle}>Check Out Our Custom-made Pieces</h2>
        </motion.div>

        <div className={styles.grid}>
          {galleryImages.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${styles.imageWrapper} ${img.featured ? styles.featuredImage : ''}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={getImageSizes(index)}
                className={styles.image}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
