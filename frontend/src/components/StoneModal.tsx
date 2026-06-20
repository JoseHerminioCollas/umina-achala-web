// src/components/StoneModal.tsx
import React from "react";
import { Rumi } from "../types/rumi";
import styles from "./StoneModal.module.css";

interface StoneModalProps {
  open: Rumi | null;
  setOpen: (item: Rumi | null) => void;
}

const StoneModal: React.FC<StoneModalProps> = ({ open, setOpen }) => {
  if (!open) return null;

  return (
    <div className={styles.modal} onClick={() => setOpen(null)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={() => setOpen(null)}>
          ×
        </button>

        <div className={styles.modalBody}>
          <div className={styles.thumb}>🪨</div>
          <div>
            <h2>
              {
                open.attributes.find((a) => a.trait_type === "Stone Type")
                  ?.value
              }
            </h2>
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
              {/* Minted token link (only if tokenId + serialNumber exist) */}
              {open.tokenId && open.serialNumber && (
                <p>
                  <a
                    href={`https://hashscan.io/mainnet/token/${open.tokenId}/nft/${open.serialNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Minted Token on HashScan
                  </a>
                </p>
              )}

              {/* Compliance HCS link (from hcs_compliance_topic) */}
              {open.properties.hcs_compliance_topic && (
                <p>
                  <a
                    href={`https://hashscan.io/mainnet/topic/${open.properties.hcs_compliance_topic}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Compliance HCS Topic
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
