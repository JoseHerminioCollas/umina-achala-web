import React from "react";
import styles from "./FAQPage.module.css";

const FAQPage = () => {
  return (
    <div className={styles.faqPage}>
      <h1 className={styles.title}>Frequently Asked Questions</h1>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>What is Rumi?</h2>
        <p className={styles.answer}>
          Rumi is a blockchain-based platform that tokenizes Peruvian stones and
          minerals as NFTs. It ensures provenance, compliance with Peruvian law,
          and recognition of artisans.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>How does Rumi ensure compliance?</h2>
        <p className={styles.answer}>
          Each NFT embeds legal identifiers such as Concession ID (INGEMMET),
          REINFO ID, and Vendor RUC (SUNAT). These details are notarized on
          Hedera Consensus Service, making provenance immutable and verifiable.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>Can I buy Rumi NFTs?</h2>
        <p className={styles.answer}>
          Yes. Buyers can connect their digital wallets to the Rumi platform and
          purchase NFTs directly using supported cryptocurrencies. Transactions
          are recorded on Hedera for transparency.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>What makes Rumi NFTs unique?</h2>
        <p className={styles.answer}>
          Beyond provenance, Rumi NFTs capture artistry — mount type, artisan
          recognition, techniques, and stone cuts. This ensures both compliance
          and cultural appreciation.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>What is Achala?</h2>
        <p className={styles.answer}>
          Achala is the jewelry counterpart to Rumi. While Rumi certifies
          individual stones, Achala represents composite artisanal jewelry,
          preserving provenance and recognizing craftsmanship.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>What is Rumi Coin?</h2>
        <p className={styles.answer}>
          Rumi Coin (RUMI) will be the native currency of the ecosystem. It will
          be used for NFT transactions, artisan rewards, fractional ownership of
          gems, and liquidity pools paired with USDC.
        </p>
      </div>
    </div>
  );
};

export default FAQPage;
