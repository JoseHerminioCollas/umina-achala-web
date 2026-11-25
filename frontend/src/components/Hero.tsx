// src/components/Hero.tsx
import React, { useState } from "react";
import { CatalogItem } from "../types/catalog";
import Card from "./Card";
import StoneModal from "./StoneModal";
import styles from "./Hero.module.css";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "../hooks/usePageMeta";
import { useCatalog } from "../hooks/useCatalog";
import { useBuying } from "../hooks/useBuying";

const Hero = () => {
  const { t } = useTranslation();
  usePageMeta("home");
  const state = useCatalog();
  const [open, setOpen] = useState<CatalogItem | null>(null);
  const media = state.status === "ready" ? state.catalog.media : undefined;
  // a sold item closes its detail view
  const { startBuy, unsold, dialog } = useBuying(media, (item) =>
    setOpen((o) => (o?.stone_id === item.stone_id ? null : o)),
  );
  // the home page shows no message while loading or on error: the marketplace does
  const featured = state.status === "ready" ? unsold(state.catalog.getFeatured(3)) : [];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroDescription}>
          <p dangerouslySetInnerHTML={{ __html: t("hero.desc1") }} />
          <p dangerouslySetInnerHTML={{ __html: t("hero.desc2") }} />
        </div>
        {featured.length > 0 && (
          <div className={styles.heroGrid}>
            {featured.map((item) => (
              <Card key={item.stone_id} item={item} onClick={setOpen} onBuy={startBuy} media={media} />
            ))}
          </div>
        )}
        <section className={styles.heroCta}>
          <a href="/marketplace" className={styles.browseBtn}>
            {t("hero.browse")}
          </a>
        </section>
      </section>
      <StoneModal open={open} setOpen={setOpen} onBuy={startBuy} media={media} />
      {dialog}
    </>
  );
};

export default Hero;
