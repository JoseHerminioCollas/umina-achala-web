// src/components/BuyDialog.tsx
// Buying one item with HashPack (#58), from the card's cart button or the
// detail view's Buy button: confirm, then one flow — prepare (the sale
// backend builds the transfer and signs UA's side), sign in HashPack, submit
// as soon as the signature arrives. The prepared sale is valid about two
// minutes, so it is prepared only after Confirm, and nothing is left for the
// buyer to press once they have approved.
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Dialog from "./Dialog";
import { CatalogItem, Media } from "../types/catalog";
import { formatPrice, imageUrl, title } from "../utils/item";
import { hashscanTransactionUrl } from "../utils/chainLinks";
import { NETWORK } from "../config";
import { ConnectCancelled, useWallet } from "../wallet/WalletContext";
import { prepareSale, submitSale, type PreparedSale, type SaleResult } from "../wallet/saleApi";
import { buyProblem, type BuyProblem } from "../wallet/buyErrors";
import styles from "./BuyDialog.module.css";

interface BuyDialogProps {
  item: CatalogItem;
  media?: Media;
  onClose: () => void;
  /** The item was sold, here or meanwhile: the site stops offering it. */
  onSold: (item: CatalogItem) => void;
}

type Phase = "confirm" | "preparing" | "signing" | "submitting" | "done" | "error";

const BuyDialog: React.FC<BuyDialogProps> = ({ item, media, onClose, onSold }) => {
  const { t } = useTranslation();
  const { account, kind, appName, requireAccount, wallet } = useWallet();
  const [phase, setPhase] = useState<Phase>("confirm");
  const [sale, setSale] = useState<PreparedSale | null>(null);
  const [result, setResult] = useState<SaleResult | null>(null);
  const [problem, setProblem] = useState<BuyProblem | null>(null);
  const [now, setNow] = useState(Date.now());
  // The attempt that is still wanted; a late answer to an older one is ignored
  const attempt = useRef(0);

  const name = title(item);
  const price = formatPrice(item.price);
  const secondsLeft = sale ? Math.max(0, Math.ceil((Date.parse(sale.expiresAt) - now) / 1000)) : 0;

  const fail = (err: unknown) => {
    console.error("buy", err);
    const p = buyProblem(err);
    setProblem(p);
    setPhase("error");
    if (p.gone) onSold(item);
  };

  const buy = async () => {
    const mine = ++attempt.current;
    const current = () => mine === attempt.current;
    setProblem(null);
    setSale(null);
    try {
      const buyer = await requireAccount();
      if (!current()) return;
      setPhase("preparing");
      const prepared = await prepareSale(item.kind, item.serial, buyer.accountId);
      if (!current()) return;
      setSale(prepared);
      setNow(Date.now());
      setPhase("signing");
      const signed = await (await wallet()).signTransaction(buyer.accountId, prepared.transaction);
      if (!current()) return;
      setPhase("submitting");
      const sold = await submitSale(prepared.saleId, signed);
      if (!current()) return;
      setResult(sold);
      setPhase("done");
      onSold(item);
    } catch (err) {
      if (!current()) return;
      if (err instanceof ConnectCancelled) setPhase("confirm");
      else fail(err);
    }
  };

  // The countdown while the buyer approves, rounded up so it reaches 0 when the
  // sale backend lets the item go; past it, the prepared sale is gone
  useEffect(() => {
    if (phase !== "signing") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "signing" && sale && secondsLeft === 0) {
      attempt.current++; // a signature arriving now is not submitted
      setProblem({ key: "expired", retry: true });
      setPhase("error");
    }
  }, [phase, sale, secondsLeft]);

  const close = () => {
    attempt.current++; // nothing more is sent for this dialog
    onClose();
  };

  const busy = phase === "preparing" || phase === "submitting";

  return (
    <Dialog title={phase === "done" ? t("buy.doneTitle") : t("buy.title", { name })} onClose={close} busy={busy}>
      <div className={styles.item}>
        <img src={imageUrl(item, "thumb", media)} alt="" className={styles.thumb} />
        <div>
          <p className={styles.name}>{name}</p>
          <p className={styles.id}>{item.stone_id}</p>
          <p className={styles.price}>{price}</p>
        </div>
      </div>

      {phase === "confirm" && (
        <>
          {item.kind === "achala" && <p>{t("buy.achalaStones", { count: item.stones.length })}</p>}
          <p>{t("buy.intro", { price, network: NETWORK })}</p>
          {account && <p className={styles.muted}>{t("buy.payingFrom", { account: account.accountId })}</p>}
          {NETWORK === "testnet" && (
            <p className={styles.muted}>
              {t("buy.testnetNote")}{" "}
              <Link to="/testnet" onClick={close}>
                {t("buy.howToBuy")}
              </Link>
            </p>
          )}
          <div className={styles.actions}>
            <button className={styles.primary} onClick={buy}>
              {account ? t("buy.confirm", { price }) : t("buy.connectAndPay", { price })}
            </button>
            <button className={styles.secondary} onClick={close}>
              {t("buy.cancel")}
            </button>
          </div>
        </>
      )}

      {phase === "preparing" && (
        <p role="status" className={styles.status}>
          {t("buy.preparing")}
        </p>
      )}

      {phase === "signing" && (
        <div role="status" className={styles.status}>
          <p className={styles.strong}>{t(`buy.approve.${kind ?? "extension"}`)}</p>
          <p className={styles.muted}>{t("buy.secondsLeft", { count: secondsLeft })}</p>
          {kind === "app" && appName && (
            <div className={styles.actions}>
              <button className={styles.secondary} onClick={() => wallet().then((w) => w.openWallet())}>
                {t("buy.openApp", { name: appName })}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "submitting" && (
        <p role="status" className={styles.status}>
          {t("buy.submitting")}
        </p>
      )}

      {phase === "done" && result && (
        <>
          <p className={styles.strong}>{t("buy.done", { name })}</p>
          <p className={styles.muted}>{t("buy.doneRefresh")}</p>
          <div className={styles.actions}>
            <a
              className={styles.secondary}
              href={hashscanTransactionUrl(result.transactionId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("buy.viewTransaction")}
            </a>
            <button className={styles.primary} onClick={close}>
              {t("buy.close")}
            </button>
          </div>
        </>
      )}

      {phase === "error" && problem && (
        <>
          <p role="alert" className={styles.error}>
            {t(`buy.error.${problem.key}`, { count: problem.seconds })}
          </p>
          {!problem.gone && <p className={styles.muted}>{t("buy.nothingMoved")}</p>}
          <div className={styles.actions}>
            {problem.retry && (
              <button className={styles.primary} onClick={buy}>
                {t("buy.tryAgain")}
              </button>
            )}
            <button className={problem.retry ? styles.secondary : styles.primary} onClick={close}>
              {t("buy.close")}
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
};

export default BuyDialog;
