"use client";

import styles from "../policy.module.css";

export default function PoliciesPage() {
  return (
    <div>
       <div className={styles.header}>
          <h1 className={styles.pageTitle}>Mo’orafrika Policies</h1>
          <p className={styles.pageSubtitle}>Effective Date: May 2026</p>
        </div>

      
      <div className={styles.documentCard}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Orders</h2>
          <p className={styles.paragraph}>All orders are confirmed upon full payment.</p>
          <p className={styles.paragraph}>
            Some pieces are made in limited quantities or produced on demand, so processing begins immediately after confirmation. Orders cannot be changed or canceled once production has started.
          </p>
        </section>

        {/* Section 2 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Production Time</h2>
          <ul className={styles.list}>
            <li><strong>Ready-to-wear:</strong> 3–7 working days</li>
            <li><strong>Made-to-order:</strong> 7–21 working days</li>
          </ul>
          <p className={styles.paragraph}>
            Timelines may vary slightly during high-demand periods.
          </p>
        </section>

        {/* Section 3 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Shipping</h2>
          <p className={styles.paragraph}>We deliver both locally and internationally.</p>
          <ul className={styles.list}>
            <li><strong>Nigeria:</strong> 2–5 working days after dispatch</li>
            <li><strong>International:</strong> 5–10 working days</li>
          </ul>
          <p className={styles.paragraph}>
            Shipping costs are calculated at checkout. Delivery timelines depend on courier services.
          </p>
        </section>

        {/* Section 4 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Returns & Exchanges</h2>
          <p className={styles.paragraph}>We operate an exchange-only policy.</p>
          <ul className={styles.list}>
            <li>Requests must be made within 3 days of delivery.</li>
            <li>Items must be unworn and in original condition.</li>
          </ul>
          <p className={styles.paragraph}>
            <em>Custom pieces are not eligible for exchange or return.</em>
          </p>
        </section>

        {/* Section 5 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Sizing</h2>
          <p className={styles.paragraph}>
            Please review our size guide carefully before ordering. For custom pieces, ensure measurements are accurate.
          </p>
          <p className={styles.paragraph}>
            We are not responsible for sizing errors provided by customers.
          </p>
        </section>

        {/* Section 6 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Quality & Pricing</h2>
          <p className={styles.paragraph}>
            Each piece is carefully inspected before dispatch. If you receive a defective item, notify us within 48 hours with proof.
          </p>
          <p className={styles.paragraph}>
            All prices reflect the quality, craftsmanship, and design process behind each piece. Prices are fixed.
          </p>
        </section>

        {/* Section 7 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Intellectual Property & Updates</h2>
          <p className={styles.paragraph}>
            All designs and brand assets are owned by Mo’orafrika. Unauthorized use or reproduction is not permitted.
          </p>
          <p className={styles.paragraph}>
            Policies may be updated periodically. Orders are governed by the policy in effect at the time of purchase.
          </p>
        </section>

      </div>
    </div>
  );
}