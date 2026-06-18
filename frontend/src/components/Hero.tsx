// src/components/Hero.tsx
import React, { useState } from "react";
import { Rumi } from "../types/rumi";
import { RumiFacade } from "../data/RumiFacade";
import StoneModal from "./StoneModal";

const Hero = () => {
  // Local state for modal
  const [open, setOpen] = useState<Rumi | null>(null);

  // Hero fetches its own featured Rumis via the facade
  const featured = RumiFacade.fromJSON().getFeatured(3);

  return (
    <section className="hero">
      <div className="hero-description">
        <p>
          Discover artisan‑crafted minerals with verified provenance and
          transparent compliance.
        </p>
      </div>

      <div className="hero-grid">
        {featured.map((rumi) => (
          <div key={rumi.properties.stone_id} className="hero-card">
            <div className="hero-image">🪨</div>
            <div className="hero-info">
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
              <div className="hero-actions">
                <button onClick={() => setOpen(rumi)}>View Rumi</button>
                <button>Buy with RUMI</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shared StoneModal, controlled locally */}
      <StoneModal open={open} setOpen={setOpen} />

      <section className="hero-cta">
        <a href="/marketplace" className="browse-btn">
          Browse Marketplace
        </a>
      </section>
    </section>
  );
};

export default Hero;
