import React from "react";
import styles from "./FAQ.module.css";

const FAQ = () => {
  return (
    <div className={styles.faqPage}>
      <h1 className={styles.title}>Frequently Asked Questions</h1>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>What is Umina Achala?</h2>
        <p className={styles.answer}>
          <strong>Umina Achala</strong> is a cultural‑tech project that unites 
          stone provenance with artisanal jewelry. It bridges compliance, heritage, 
          and digital provenance, creating a transparent marketplace where certified 
          stones (Umina) are elevated into jewelry (Achala).
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>What is Umina?</h2>
        <p className={styles.answer}>
          <strong>Umina</strong> represents certified stones — raw, cut, or mounted — 
          documented with provenance records. Each Umina NFT ensures authenticity, 
          compliance with Peruvian law, and immutable proof of origin.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>What is Achala?</h2>
        <p className={styles.answer}>
          <strong>Achala</strong> is the jewelry counterpart to Umina. While Umina certifies 
          individual stones, Achala represents composite artisanal jewelry, blending 
          multiple stones into culturally significant creations while preserving provenance 
          and recognizing craftsmanship.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>How does Umina Achala ensure compliance?</h2>
        <p className={styles.answer}>
          Each NFT embeds legal identifiers such as Concession ID (INGEMMET), REINFO ID, 
          Vendor RUC (SUNAT), and Artisan RNA. These details are notarized on the 
          Hedera Consensus Service, making provenance immutable and verifiable.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>Why use Hedera blockchain?</h2>
        <p className={styles.answer}>
          Hedera provides speed, low fees, and energy efficiency. Its distributed ledger 
          ensures that provenance, compliance, and artisan recognition are securely stored, 
          auditable, and globally accessible. Smart contracts guarantee royalties flow 
          directly to artisans.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>Can I buy Umina or Achala NFTs?</h2>
        <p className={styles.answer}>
          Yes. Buyers can connect Hedera‑compatible wallets to the platform and purchase 
          NFTs directly. Transactions are transparent, and royalties are automatically 
          routed to artisans, ensuring fair recognition.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>What makes Umina Achala NFTs unique?</h2>
        <p className={styles.answer}>
          Beyond compliance and provenance, Umina Achala NFTs capture artistry — mount type, 
          artisan recognition, techniques, and composite jewelry creations. This ensures 
          both legal transparency and cultural appreciation.
        </p>
      </div>
    </div>
  );
};

export default FAQ;
