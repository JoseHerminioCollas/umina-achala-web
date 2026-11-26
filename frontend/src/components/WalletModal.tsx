// src/components/WalletModal.tsx
// Connect HashPack (#58): the browser extension when it is found, otherwise
// WalletConnect (a QR code on a computer, the HashPack app on a phone), and a
// link to get HashPack.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Dialog from "./Dialog";
import { HASHPACK_DOWNLOAD_URL, NETWORK } from "../config";
import { isPhone } from "../wallet/device";
import type { WalletAccount, WalletModule } from "../wallet/WalletContext";
import styles from "./WalletModal.module.css";

export { HASHPACK_DOWNLOAD_URL };

// Extensions answer the connector's message shortly after it starts
const EXTENSION_WAIT_MS = 1000;

interface WalletModalProps {
  wallet: () => Promise<WalletModule>;
  onConnected: (account: WalletAccount) => void;
  onClose: () => void;
}

type Phase = "starting" | "choose" | "connecting";

const WalletModal: React.FC<WalletModalProps> = ({ wallet, onConnected, onClose }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("starting");
  const [extensions, setExtensions] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const phone = isPhone();

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const w = await wallet();
        await w.getConnector();
        if (!phone) await new Promise((r) => setTimeout(r, EXTENSION_WAIT_MS));
        const found = phone ? [] : await w.availableExtensions();
        if (live) setExtensions(found);
      } catch (err) {
        console.error("wallet: the connector did not start", err);
        if (live) setError(t("wallet.errorStart"));
      } finally {
        if (live) setPhase("choose");
      }
    })();
    return () => {
      live = false;
    };
  }, [wallet, phone, t]);

  const connect = async (extensionId?: string) => {
    setError(null);
    setPhase("connecting");
    try {
      const account = await (await wallet()).connect(extensionId);
      if (account.network !== NETWORK) {
        await (await wallet()).disconnect().catch(() => undefined);
        setError(t("wallet.errorNetwork", { network: NETWORK }));
        setPhase("choose");
        return;
      }
      onConnected(account);
    } catch (err) {
      console.error("wallet: connect", err);
      const message = err instanceof Error ? err.message : "";
      setError(/reject|closed|cancel/i.test(message) ? t("wallet.errorCancelled") : t("wallet.errorConnect"));
      setPhase("choose");
    }
  };

  return (
    <Dialog title={t("wallet.connectTitle")} onClose={onClose}>
      <p>{t("wallet.connectIntro", { network: NETWORK })}</p>
      {phase === "starting" && <p className={styles.status}>{t("wallet.starting")}</p>}
      {phase === "connecting" && (
        <p className={styles.status} role="status">
          {t(phone ? "wallet.connectingPhone" : "wallet.connecting")}
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {phase !== "starting" && (
        <div className={styles.options}>
          {extensions.map((e) => (
            <button key={e.id} className={styles.option} disabled={phase === "connecting"} onClick={() => connect(e.id)}>
              {t("wallet.withExtension", { name: e.name })}
            </button>
          ))}
          <button
            className={extensions.length ? styles.secondary : styles.option}
            disabled={phase === "connecting"}
            onClick={() => connect()}
          >
            {t(phone ? "wallet.withApp" : "wallet.withQr")}
          </button>
        </div>
      )}
      {phase === "choose" && !phone && extensions.length === 0 && (
        <p className={styles.hint}>{t("wallet.noExtension")}</p>
      )}
      <p className={styles.get}>
        {t("wallet.newToTestnet")}{" "}
        <Link to="/testnet" onClick={onClose}>
          {t("wallet.howToBuy")}
        </Link>
      </p>
      <p className={styles.get}>
        {t("wallet.noHashpack")}{" "}
        <a href={HASHPACK_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
          {t("wallet.getHashpack")}
        </a>
      </p>
    </Dialog>
  );
};

export default WalletModal;
