// src/components/StoneModal.tsx
import React, { useEffect } from "react";
import { Umina } from "../types/umina";
import styles from "./StoneModal.module.css";
import { useTranslation } from "react-i18next";

interface StoneModalProps {
  open: Umina | null;
  setOpen: (item: Umina | null) => void;
}

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

  return (
    <div className={styles.modal} onClick={() => setOpen(null)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            {open.attributes.find((a) => a.trait_type === "Stone Type")?.value}
          </h2>
          <button className={styles.close} onClick={() => setOpen(null)}>×</button>
        </div>
        <div className={styles.modalBody}>
          <img src={open.image} alt={open.name} />
          <div>
            <div className={styles.attributeList}>
              <dl>
                {open.attributes
                  .filter(
                    (attr) =>
                      attr.trait_type !== "HS Code" &&
                      attr.value !== "" &&
                      attr.trait_type !== "Stone Type",
                  )
                  .map((attr) => (
                    <div className={styles.traitType} key={attr.trait_type}>
                      <dt>{attr.trait_type}</dt>
                      <dd>{attr.value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
            <div className={styles.hashscanLinks}>
              {open.tokenId && open.serialNumber && (
                <p>
                  <a
                    href={`https://hashscan.io/mainnet/token/${open.tokenId}/nft/${open.serialNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("modal.viewHashscan")}
                  </a>
                </p>
              )}
              {open.properties.hcs_compliance_topic && (
                <p>
                  <a
                    href={`https://hashscan.io/mainnet/topic/${open.properties.hcs_compliance_topic}`}
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
