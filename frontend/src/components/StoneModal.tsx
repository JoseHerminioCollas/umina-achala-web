// src/components/StoneModal.tsx
import React, { useEffect } from "react";
import { CatalogItem } from "../types/catalog";
import { attribute, formatPrice, imageUrl, title } from "../utils/item";
import styles from "./StoneModal.module.css";
import { useTranslation } from "react-i18next";
import { hashscanNftUrl, hashscanTopicUrl } from "../utils/chainLinks";

interface StoneModalProps {
  open: CatalogItem | null;
  setOpen: (item: CatalogItem | null) => void;
}

// shown as the heading, or not at all
const HIDDEN_TRAITS = ["HS Code", "Stone Type", "Piece Type"];

const StoneModal: React.FC<StoneModalProps> = ({ open, setOpen }) => {
  const { t } = useTranslation();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const topic = open.metadata.properties.hcs_compliance_topic;

  return (
    <div className={styles.modal} onClick={() => setOpen(null)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title(open)}</h2>
          <button className={styles.close} onClick={() => setOpen(null)}>×</button>
        </div>
        <div className={styles.modalBody}>
          <img src={imageUrl(open)} alt={open.metadata.name} />
          <div>
            <p className={styles.price}>
              {t("modal.price")} {formatPrice(open.price)}
            </p>
            <div className={styles.attributeList}>
              <dl>
                {open.metadata.attributes
                  .filter(
                    (attr) => !HIDDEN_TRAITS.includes(attr.trait_type) && attr.value !== "",
                  )
                  .map((attr) => (
                    <div className={styles.traitType} key={attr.trait_type}>
                      <dt>{attr.trait_type}</dt>
                      <dd>{String(attr.value)}</dd>
                    </div>
                  ))}
              </dl>
            </div>
            {open.kind === "achala" && (
              <section className={styles.stones}>
                <h3>{t("modal.stonesInPiece")}</h3>
                <ul>
                  {open.stones.map((stone) => (
                    <li key={stone.stone_id}>
                      {title(stone)}
                      {attribute(stone, "Weight") && <> · {attribute(stone, "Weight")}</>}
                      {" · "}
                      <a
                        href={hashscanNftUrl(stone.token_id, stone.serial)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {stone.stone_id}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <div className={styles.hashscanLinks}>
              <p>
                <a
                  href={hashscanNftUrl(open.token_id, open.serial)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("modal.viewHashscan")}
                </a>
              </p>
              {topic && (
                <p>
                  <a
                    href={hashscanTopicUrl(topic)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      // The compliance page does not exist yet: explain, don't navigate.
                      e.preventDefault();
                      window.alert(t("modal.complianceUnavailable"));
                    }}
                  >
                    {t("modal.viewCompliance")}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoneModal;
