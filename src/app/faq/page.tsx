"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./faq.module.css";

const faqData = [
  {
    id: "faq-1",
    q: "Is browsing the digital collection free?",
    a: "Yes, browsing the full RUACH H. FASHION collection is completely free. We encourage you to curate your collection and create your account for exclusive access."
  },
  {
    id: "faq-2",
    q: "Are your items verified for authenticity?",
    a: "Every piece in the RUACH H. FASHION collection undergoes a rigorous authentication process by our expert curators to ensure highest quality and provenance."
  },
  {
    id: "faq-3",
    q: "Can I track individual item care instructions?",
    a: "Yes. Once an item is added to your personal collection or purchased, detailed care instructions specific to that garment's fabric and origin are unlocked in your dashboard."
  },
  {
    id: "faq-4",
    q: "Do you offer international shipping in specific currencies?",
    a: "We currently ship globally. Upon checkout, your total will be dynamically calculated based on real-time exchange rates and applicable international shipping zones."
  },
  {
    id: "faq-5",
    q: "How do I update my profile and curated list?",
    a: "Navigate to your Account Dashboard. From there, you can edit your shipping details, update personal preferences, and seamlessly add or remove items from your curated lists."
  },
  {
    id: "faq-6",
    q: "What is the procedure for special collaborator collections?",
    a: "Collaborator collections are often released in limited quantities. Registered members receive 48-hour early access via email before the collection opens to the public."
  }
];

export default function FAQPage() {
  // Initialize with the first question open to match your design request
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleQuestion = (id: string) => {
    setOpenId((prevId) => (prevId === id ? null : id));
  };

  return (
      <div className={styles.container}>
        
        {/* LEFT COLUMN: Branding & Info */}
        <aside className={styles.leftColumn}>

          <h1 className={styles.title}>General FAQs</h1>
          
          <p className={styles.description}>
            Everything you need to know about the RUACH H. FASHION Collection and how it works. 
            Can&apos;t find an answer?{' '}
            <Link href="/contact" className={styles.chatLink}>
              Chat to our team.
            </Link>
          </p>
          <div className={styles.brandHeader}>
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

        </aside>

        {/* RIGHT COLUMN: Accordion */}
        <section className={styles.rightColumn}>
          <div className={styles.accordion}>
            {faqData.map((item) => {
              const isOpen = openId === item.id;

              return (
                <div 
                  key={item.id} 
                  className={`${styles.accordionItem} ${isOpen ? styles.active : ""}`}
                >
                  <button 
                    className={styles.questionBtn} 
                    onClick={() => toggleQuestion(item.id)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.questionText}>{item.q}</span>
                    
                    {/* The Antique Gold Toggle Button */}
                    <div className={styles.toggleIcon}>
                      {isOpen ? (
                        <ChevronUp size={20} strokeWidth={2.5} />
                      ) : (
                        <ChevronDown size={20} strokeWidth={2.5} />
                      )}
                    </div>
                  </button>

                  {/* Smooth CSS Grid Transition Wrapper */}
                  <div className={`${styles.answerWrapper} ${isOpen ? styles.open : ""}`}>
                    <div className={styles.answerInner}>
                      <p className={styles.answerText}>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
  );
}