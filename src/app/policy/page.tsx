"use client";

import Link from "next/link"; 
import styles from "../policy.module.css";

export default function PoliciesPage() {
  return (
    <div>
       <div className={styles.header}>
          <h1 className={styles.pageTitle}>RUACH H. FASHION Privacy Policy</h1>
          <p className={styles.pageSubtitle}>Last Updated: May 15, 2026</p>
        </div>

      <div className={styles.documentCard}>
        
        {/* Intro */}
        <section className={styles.section}>
          <p className={styles.paragraph}>
            Welcome to <strong>RUACH H. FASHION</strong>. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from our collection.
          </p>
          <p className={styles.paragraph}>
            Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
        </section>

        {/* Section 1 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
          <p className={styles.paragraph}>We collect information that you voluntarily provide to us when you register on the site, express an interest in obtaining information about us or our products, or otherwise contact us.</p>
          <ul className={styles.list}>
            <li><strong>Personal Information:</strong> Name, email address, shipping address, billing address, and phone number.</li>
            <li><strong>Account Data:</strong> If you create an account, we store your login credentials securely and maintain a history of your active shopping cart and past orders.</li>
            <li><strong>Payment Information:</strong> We do not store your full credit card numbers or bank details on our servers. All financial transactions are encrypted and processed directly through our secure third-party payment gateways (e.g., Paystack).</li>
            <li><strong>Technical Data:</strong> When you access the site, we automatically collect certain information including your IP address, browser type, device information, and browsing patterns.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. How We Use Your Information</h2>
          <p className={styles.paragraph}>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We may use information collected about you via the site to:</p>
          <ul className={styles.list}>
            <li>Process and fulfill your orders, including managing shipping and returns.</li>
            <li>Create and manage your personal account and secure your active user sessions.</li>
            <li>Email you regarding your order status, account updates, or customer service inquiries.</li>
            <li>Deliver targeted advertising, newsletters, and promotional information regarding our newest collections (only if you have opted in).</li>
            <li>Monitor and analyze usage and trends to improve your experience with the website.</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. How We Share Your Information</h2>
          <p className={styles.paragraph}>We do not sell, trade, or rent your personal identification information to others. We may share information we have collected about you in certain situations:</p>
          <ul className={styles.list}>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, secure data and media hosting, order fulfillment, and delivery logistics.</li>
            <li><strong>Legal Obligations:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Tracking Technologies & Cookies</h2>
          <p className={styles.paragraph}>
            We use cookies and similar tracking technologies (like web beacons and session tokens) to access or store information. This includes maintaining your logged-in status and keeping track of the items in your shopping cart as you browse the site. You can instruct your browser to refuse all cookies, but this may prevent you from using features like the shopping cart or account checkout.
          </p>
        </section>

        {/* Section 5 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Data Security</h2>
          <p className={styles.paragraph}>
            We use administrative, technical, and physical security measures to help protect your personal information. Your data is stored on secure, authenticated databases. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
        </section>

        {/* Section 6 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Your Data Rights</h2>
          <p className={styles.paragraph}>Depending on your location, you may have the right to:</p>
          <ul className={styles.list}>
            <li>Request access to the personal data we hold about you.</li>
            <li>Request that we correct any inaccuracies in your personal data.</li>
            <li>Request the deletion of your personal data and account closure.</li>
            <li>Withdraw your consent for promotional marketing emails at any time.</li>
          </ul>
          <p className={styles.paragraph}>To exercise any of these rights, please contact us using the information provided below.</p>
        </section>

        {/* Section 7 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Changes to This Privacy Policy</h2>
          <p className={styles.paragraph}>
            We may update this Privacy Policy from time to time in order to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will alert you about any changes by updating the &quot;Last Updated&quot; date of this Privacy Policy.
          </p>
        </section>

        {/* Section 8 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Contact Us</h2>
          <p className={styles.paragraph}>
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <ul className={styles.list} style={{ listStyleType: 'none', paddingLeft: 0 }}>
            <li><strong>RUACH H. FASHION</strong></li>
            <li>Email: <Link href="mailto:ruachhfashion@gmail.com" style={{ textDecoration: 'underline' }}>ruachhfashion@gmail.com</Link></li>
          </ul>
        </section>

      </div>
    </div>
  );
}