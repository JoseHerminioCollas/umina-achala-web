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
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={() => setOpen(null)}>
          ×
        </button>

        <h2>
          {open.properties.stone_id} — {open.name}
        </h2>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className={styles.thumb}>🪨</div>
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <h3>Metadata</h3>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                maxHeight: 240,
                overflow: "auto",
              }}
            >
              {JSON.stringify(open.properties, null, 2)}
            </pre>

            <p>
              <strong>Compliance HCS:</strong>{" "}
              {open.properties.hcs_compliance_topic ||
                open.properties.compliance_proof_hcs ||
                "—"}
            </p>

            <p>
              <a href="#">Download Compliance Certificate (PDF)</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoneModal;
