// ComplianceDashboard.tsx
import React, { useState } from "react";
import styles from "./ComplianceDashboard.module.css";

interface ComplianceItem {
  id: string;
  stoneId: string;
  permitNumber: string;
  cutType: string;
  txId: string;
  exportStatus: "Pending" | "Verified" | "Restricted" | "Not Applicable";
  status: "Compliant" | "Pending" | "Restricted";
  lastUpdated: string;
  details: string; // full item info for modal
}

const mockData: ComplianceItem[] = [
  {
    id: "1",
    stoneId: "ST-001",
    permitNumber: "PER-123",
    cutType: "Raw",
    txId: "0.0.12345",
    exportStatus: "Verified",
    status: "Compliant",
    lastUpdated: "2026-06-20",
    details: "Stone ST-001, permit PER-123, raw cut, exported with VUCE permit VUCE-2026-EXP-100."
  },
  {
    id: "2",
    stoneId: "ST-002",
    permitNumber: "PER-456",
    cutType: "Cut",
    txId: "0.0.67890",
    exportStatus: "Pending",
    status: "Pending",
    lastUpdated: "2026-06-21",
    details: "Stone ST-002, permit PER-456, cut type, awaiting export clearance."
  },
  {
    id: "3",
    stoneId: "ST-003",
    permitNumber: "PER-789",
    cutType: "Mounted",
    txId: "0.0.54321",
    exportStatus: "Restricted",
    status: "Restricted",
    lastUpdated: "2026-06-22",
    details: "Stone ST-003 flagged as restricted item, export blocked."
  }
];

const ComplianceDashboard: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Compliance Dashboard</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Stone ID</th>
            <th>Permit Number</th>
            <th>Cut Type</th>
            <th>Tx ID</th>
            <th>Export Status</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((item) => (
            <tr
              key={item.id}
              className={item.status === "Restricted" ? styles.restrictedRow : ""}
              onClick={() => setSelectedItem(item)}
            >
              <td>{item.stoneId}</td>
              <td>{item.permitNumber}</td>
              <td>{item.cutType}</td>
              <td className={styles.txId}>{item.txId}</td>
              <td className={`${styles.exportStatus} ${styles[item.exportStatus.toLowerCase().replace(" ", "")]}`}>
                {item.exportStatus}
              </td>
              <td className={`${styles.status} ${styles[item.status.toLowerCase()]}`}>
                {item.status}
              </td>
              <td className={styles.lastUpdated}>{item.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Item Details</h2>
            <p><strong>Stone ID:</strong> {selectedItem.stoneId}</p>
            <p><strong>Permit Number:</strong> {selectedItem.permitNumber}</p>
            <p><strong>Cut Type:</strong> {selectedItem.cutType}</p>
            <p><strong>Tx ID:</strong> {selectedItem.txId}</p>
            <p><strong>Export Status:</strong> {selectedItem.exportStatus}</p>
            <p><strong>Status:</strong> {selectedItem.status}</p>
            <p><strong>Last Updated:</strong> {selectedItem.lastUpdated}</p>
            <p><strong>Details:</strong> {selectedItem.details}</p>
            <button onClick={() => setSelectedItem(null)} className={styles.closeButton}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard;
