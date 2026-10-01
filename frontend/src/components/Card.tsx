// src/components/Card.tsx
import React from "react";
import { Umina } from "../types/umina";
import styles from "./Card.module.css";
import { useTranslation } from "react-i18next";

interface CardProps {
  item: Umina;
  onClick: (item: Umina) => void;
}

const Card: React.FC<CardProps> = ({ item, onClick }) => {
  const { t } = useTranslation();
  const cut = item.attributes.find((a) => a.trait_type === "Stone Cut")?.value;
  const type = item.attributes.find(
    (a) => a.trait_type === "Stone Type",
  )?.value;
  const mountedBy = item.attributes.find(
    (a) => a.trait_type === "Mounted By",
  )?.value;

  return (
    <div className={styles.card}>
      <div className={styles.thumb} onClick={() => onClick(item)}>
        <img src={item.image} alt={item.name} width="100%" height="100%" />
      </div>
      <div className={styles.meta}>
        <h3 className={styles.type}>{type}</h3>
        {cut && <span className={styles.badge}>{cut}</span>}{" "}
        {mountedBy && (
          <p className={styles.mountedBy}>
            <span className={styles.label}>{t("card.mountedBy")}</span> {mountedBy}
          </p>
        )}
        <div className={styles.cardActions}>
        <button onClick={() => onClick(item)}>
          {item.properties.stone_id ? t("card.viewUmina") : t("card.viewAchala")}
        </button>
          {/* <button onClick={() => onClick(item)}>View Umiña</button> */}
          <button className={styles.cartIcon} onClick={() => alert(t("card.buySoon"))}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 
                     7 22s2-.9 2-2-.9-2-2-2zm10 
                     0c-1.1 0-1.99.9-1.99 2S15.9 
                     22 17 22s2-.9 2-2-.9-2-2-2zM7.16 
                     14l.84-2h7.45c.75 0 1.41-.41 
                     1.75-1.03l3.58-6.49A1 1 0 
                     0019.58 3H5.21l-.94-2H1v2h2l3.6 
                     7.59-1.35 2.44C4.52 13.37 5.48 
                     15 7.16 15H19v-2H7.16z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
