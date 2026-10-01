// src/components/Hero.tsx
import React, { useState } from "react";
import { Umina } from "../types/umina";
import { UminaFacade } from "../data/UminaFacade";
import Card from "./Card";
import StoneModal from "./StoneModal";
import styles from "./Hero.module.css";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<Umina | null>(null);
  const featured = UminaFacade.fromJSON().getFeatured(3);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroDescription}>
          <p dangerouslySetInnerHTML={{ __html: t("hero.desc1") }} />
          <p dangerouslySetInnerHTML={{ __html: t("hero.desc2") }} />
        </div>
        <div className={styles.heroGrid}>
          {featured.map((umina) => (
            <Card
              key={umina.properties.stone_id}
              item={umina}
              onClick={setOpen}
            />
          ))}
        </div>
        <section className={styles.heroCta}>
          <a href="/marketplace" className={styles.browseBtn}>
            {t("hero.browse")}
          </a>
        </section>
      </section>
      <StoneModal open={open} setOpen={setOpen} />
    </>
  );
};

export default Hero;
