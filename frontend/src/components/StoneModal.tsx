// src/components/StoneModal.tsx
import React from 'react';
import { Rumi } from '../types/rumi';

interface StoneModalProps {
  open: Rumi | null;
  setOpen: (item: Rumi  | null) => void;
}

const StoneModal: React.FC<StoneModalProps> = ({ open, setOpen }) => {
  if (!open) return null;

  return (
    <div className="modal" onClick={() => setOpen(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={() => setOpen(null)}>×</button>

        <h2>
          {open.properties.stone_id} — {open.name}
        </h2>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="thumb" style={{ height: 260, fontSize: 48 }}>
              🪨
            </div>
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
