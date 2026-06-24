// Privacy.jsx
import React from "react";
import styles from "./Privacy.module.css";

const Privacy = () => {
  return (
    <div className={styles.privacy}>
      <h1 className={styles.title}>Privacy & Cookies</h1>

      <section className={styles.section}>
        <h2>🔒 Privacy Policy</h2>
        <p>
          Umina Achala values your privacy. We collect only the information
          necessary to provide secure transactions, verify compliance, and
          support artisans. Personal data is never sold or shared with
          third‑parties outside the ecosystem.
        </p>
        <ul>
          <li>Wallet addresses are used solely for authentication and transactions.</li>
          <li>Compliance identifiers (Concession ID, REINFO ID, RUC, RNA) are stored immutably on Hedera.</li>
          <li>Metadata is linked to NFTs for provenance and transparency.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>🍪 Cookies</h2>
        <p>
          Our platform uses cookies to improve user experience and ensure secure
          access. Cookies help us remember preferences, maintain session
          integrity, and analyze platform usage.
        </p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for login, wallet connection, and secure navigation.</li>
          <li><strong>Preference Cookies:</strong> Store language, display, and accessibility settings.</li>
          <li><strong>Analytics Cookies:</strong> Provide insights into platform usage to improve services.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>⚖️ Your Rights</h2>
        <p>
          You may request access to your data, ask for corrections, or request
          deletion where applicable. Blockchain records are immutable, but
          off‑chain data such as preferences can be updated or removed.
        </p>
      </section>

      <section className={styles.section}>
        <h2>📧 Contact</h2>
        <p>
          For privacy or cookie inquiries, please reach out to our compliance
          team at <a href="mailto:privacy@uminaachala.org">privacy@uminaachala.org</a>.
        </p>
      </section>
    </div>
  );
};

export default Privacy;
