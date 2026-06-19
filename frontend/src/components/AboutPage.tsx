import React from "react";
import styles from "./AboutPage.module.css";

const AboutPage = () => {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.logoWrapper}>
        <img src="logo.svg" alt="Rumi Logo" className={styles.logo} />
      </div>

      <h1 className={styles.title}>About Rumi</h1>
      <p className={styles.tagline}>
        Automating compliance, illuminating provenance, recognizing artisans.
      </p>

      <section className={styles.section}>
        <h2>🌍 What is Rumi?</h2>
        <p>
          The word <strong>“Rumi”</strong> is Quechua for <em>stone</em>. Rumi
          represents the tokenization of stones and minerals from Peru, blending
          cultural heritage with modern technology.
        </p>
      </section>

      <section className={styles.section}>
        <h2>⚖️ Compliance</h2>
        <p>
          Rumi establishes stones and minerals as{" "}
          <strong>Real World Assets (RWAs)</strong>, ensuring provenance is
          immutable and verifiable.
        </p>
        <ul>
          <li>Concession ID (INGEMMET)</li>
          <li>REINFO ID</li>
          <li>Vendor RUC (SUNAT)</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>💻 Online Platform</h2>
        <p>
          Buyers can connect wallets, purchase Rumi NFTs, and view provenance
          details. Transactions are recorded on Hedera, ensuring transparency
          and routing royalties to artisans.
        </p>
      </section>

      <section className={styles.section}>
        <h2>✨ Artistry</h2>
        <p>Metadata captures mount type, artisan recognition, technique, and cut.</p>
        <ul>
          <li>Mount Type: Silver bezel, gold prong, textile wrap</li>
          <li>Artisan Recognition: Craftsman name or ID</li>
          <li>Technique: Filigree, inlay, carving, weaving</li>
          <li>Stone Cut: Brilliant, cabochon, emerald, princess</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>♻️ Lifecycle</h2>
        <ol>
          <li>Minting: NFT creation with provenance metadata</li>
          <li>Mounting/Cutting: Artisan RNA notarized</li>
          <li>Sales: Royalties routed to artisan and treasury</li>
          <li>Export: Linked to VUCE COD and HS Code</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>🌟 Future Vision</h2>
        <h3>Rumi Coin</h3>
        <p>
          RUMI will serve as the ecosystem’s native currency, enabling NFT
          transactions, artisan rewards, and fractional ownership.
        </p>

        <h3>Achala</h3>
        <p>
          Achala is the jewelry counterpart to Rumi, representing composite
          artisanal creations. While Rumi certifies stones, Achala elevates them
          into culturally significant jewelry.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
