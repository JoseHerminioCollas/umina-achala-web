// src/components/Hero.tsx
import React, { useState } from "react";
import { Rumi } from "../types/rumi";
import { RumiFacade } from "../data/RumiFacade";
import StoneModal from "./StoneModal";
import styles from "./Hero.module.css";

const Hero = () => {
  // Local state for modal
  const [open, setOpen] = useState<Rumi | null>(null);

  // Hero fetches its own featured Rumis via the facade
  const featured = RumiFacade.fromJSON().getFeatured(3);

  return (
    <section className={styles.hero}>
      <div className={styles.heroDescription}>
        <p>
          Discover artisan‑crafted minerals with verified provenance and
          transparent compliance.
        </p>
      </div>

      <div className={styles.heroGrid}>
        {featured.map((rumi) => (
          <div key={rumi.properties.stone_id} className={styles.heroCard}>
            <div className={styles.heroImage}>🪨</div>
            <div className={styles.heroInfo}>
              <h3>{rumi.name}</h3>
              <p>
                Origin: {rumi.properties.jurisdiction} · Artisan:{" "}
                {rumi.attributes.find((a) => a.trait_type === "Artisan")?.value}
                · Cut:{" "}
                {
                  rumi.attributes.find((a) => a.trait_type === "Stone Cut")
                    ?.value
                }
              </p>
              <div className={styles.heroActions}>
                <button onClick={() => setOpen(rumi)}>View Rumi</button>
                <button>Buy with RUMI</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shared StoneModal, controlled locally */}
      <StoneModal open={open} setOpen={setOpen} />

      <section className={styles.heroCta}>
        <a href="/marketplace" className={styles.browseBtn}>
          Browse Marketplace
        </a>
      </section>
    </section>
  );
};

export default Hero;
