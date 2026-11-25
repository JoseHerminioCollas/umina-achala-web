// src/components/Card.tsx
import React from "react";
import { CatalogItem, Media } from "../types/catalog";
import { attribute, formatPrice, imageUrl, model, stoneTypes, title } from "../utils/item";
import styles from "./Card.module.css";
import { useTranslation } from "react-i18next";

interface CardProps {
  item: CatalogItem;
  onClick: (item: CatalogItem) => void;
  /** The cart button: buy this item (#58); no button without it. */
  onBuy?: (item: CatalogItem) => void;
  /** The catalog's photo copies; without them, photos load through the gateway. */
  media?: Media;
}

const Card: React.FC<CardProps> = ({ item, onClick, onBuy, media }) => {
  const { t } = useTranslation();
  const cut = item.kind === "umina" ? attribute(item, "Stone Cut") : undefined;
  const metal = item.kind === "achala" ? attribute(item, "Metal") : undefined;

  return (
    <div className={styles.card}>
      <div className={styles.thumb} onClick={() => onClick(item)}>
        <img src={imageUrl(item, "thumb", media)} alt={item.metadata.name} width="100%" height="100%" />
      </div>
      <div className={styles.meta}>
        <h3 className={styles.type}>{title(item)}</h3>
        {cut && <span className={styles.badge}>{cut}</span>}
        {model(item) && (
          <span className={styles.badge} title={t("model.label")}>
            3D
          </span>
        )}
        {item.kind === "achala" && (
          <p className={styles.detail}>
            {metal && <>{metal} · </>}
            <span className={styles.label}>{t("card.stones")}</span> {stoneTypes(item).join(", ")}
          </p>
        )}
        <p className={styles.price}>{formatPrice(item.price)}</p>
        <div className={styles.cardActions}>
          <button onClick={() => onClick(item)}>
            {item.kind === "umina" ? t("card.viewUmina") : t("card.viewAchala")}
          </button>
          {onBuy && (
          <button
            className={styles.cartIcon}
            onClick={() => onBuy(item)}
            aria-label={t("card.buy", { name: title(item), price: formatPrice(item.price) })}
            title={t("card.buyShort")}
          >
            <svg
              aria-hidden="true"
              focusable="false"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
