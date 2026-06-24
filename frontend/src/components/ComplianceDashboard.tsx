// ComplianceDashboard.tsx
import React, { useState } from "react";
import styles from "./ComplianceDashboard.module.css";
import { useTranslation } from "react-i18next";

interface ComplianceItem {
  id: string;
  stoneId: string;
  permitNumber: string;
  cutType: string;
  txId: string;
  exportStatus: "Pending" | "Verified" | "Restricted" | "Not Applicable";
  status: "Compliant" | "Pending" | "Restricted";
  lastUpdated: string;
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
    lastUpdated: "2026-06-20"
  },
  {
    id: "2",
    stoneId: "ST-002",
    permitNumber: "PER-456",
    cutType: "Cut",
    txId: "0.0.67890",
    exportStatus: "Pending",
    status: "Pending",
    lastUpdated: "2026-06-21"
  },
  {
    id: "3",
    stoneId: "ST-003",
    permitNumber: "PER-789",
    cutType: "Mounted",
    txId: "0.0.54321",
    exportStatus: "Restricted",
    status: "Restricted",
    lastUpdated: "2026-06-22"
  }
];

const ComplianceDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredData = mockData.filter(
    (item) =>
      item.stoneId.includes(search) ||
      item.permitNumber.includes(search) ||
      item.cutType.toLowerCase().includes(search.toLowerCase()) ||
      item.txId.includes(search)
  );

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>{t("compliance.title")}</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder={t("compliance.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("compliance.stoneId")}</th>
            <th>{t("compliance.permitNumber")}</th>
            <th>{t("compliance.cutType")}</th>
            <th>{t("compliance.txId")}</th>
            <th>{t("compliance.exportStatus")}</th>
            <th>{t("compliance.status")}</th>
            <th>{t("compliance.lastUpdated")}</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id} className={item.status === "Restricted" ? styles.restrictedRow : ""}>
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

      <section className={styles.columnTitles}>
        <h2>{t("compliance.columnTitles")}</h2>
        <ul>
          <li><strong>{t("compliance.stoneId")}</strong> — {t("compliance.stoneIdDesc")}</li>
          <li><strong>{t("compliance.permitNumber")}</strong> — {t("compliance.permitNumberDesc")}</li>
          <li><strong>{t("compliance.cutType")}</strong> — {t("compliance.cutTypeDesc")}</li>
          <li><strong>{t("compliance.txId")}</strong> — {t("compliance.txIdDesc")}</li>
          <li><strong>{t("compliance.exportStatus")}</strong> — {t("compliance.exportStatusDesc")}</li>
          <li><strong>{t("compliance.status")}</strong> — {t("compliance.statusDesc")}</li>
          <li><strong>{t("compliance.lastUpdated")}</strong> — {t("compliance.lastUpdatedDesc")}</li>
        </ul>
      </section>

      <section className={styles.timeline}>
        <h2>{t("compliance.auditTrail")}</h2>
        <ul>
          {(t("compliance.auditItems", { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ComplianceDashboard;
