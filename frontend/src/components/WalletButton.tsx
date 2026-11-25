// src/components/WalletButton.tsx
// The header's wallet button (#58): "Connect wallet", or the connected
// account with a Disconnect action.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWallet } from "../wallet/WalletContext";
import styles from "./WalletButton.module.css";

/** 0.0.11389082 → 0.0.113…082, for a narrow header. */
export const shortAccount = (id: string): string => (id.length > 10 ? `${id.slice(0, 7)}…${id.slice(-3)}` : id);

const WalletButton: React.FC = () => {
  const { t } = useTranslation();
  const { account, restoring, openConnect, disconnect } = useWallet();
  const [busy, setBusy] = useState(false);

  if (restoring) {
    return (
      <span className={styles.wallet} aria-live="polite">
        {t("wallet.restoring")}
      </span>
    );
  }

  if (!account) {
    return (
      <button className={styles.connect} onClick={openConnect}>
        {t("wallet.connect")}
      </button>
    );
  }

  return (
    <span className={styles.wallet}>
      <span className={styles.account} title={account.accountId}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.visuallyHidden}>{t("wallet.connectedAs")} </span>
        {shortAccount(account.accountId)}
      </span>
      <button
        className={styles.disconnect}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await disconnect();
          } catch (err) {
            console.error("wallet: disconnect", err);
          } finally {
            setBusy(false);
          }
        }}
      >
        {t("wallet.disconnect")}
      </button>
    </span>
  );
};

export default WalletButton;
