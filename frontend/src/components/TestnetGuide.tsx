// src/components/TestnetGuide.tsx
// "How to buy on testnet" (#137): what testnet is, and the steps from no
// wallet to a purchase with test HBAR. Linked from the header notice, the
// connect dialog and the buy dialog.
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "../hooks/usePageMeta";
import { ACHALA_TOKEN_ID, HASHPACK_DOWNLOAD_URL, HEDERA_FAUCET_URL, UMINA_TOKEN_ID } from "../config";
import styles from "./TestnetGuide.module.css";

/** An external link: a new tab, announced as such. */
const External: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  const { t } = useTranslation();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.external}>
      {children}
      <span className={styles.visuallyHidden}> {t("testnet.newTab")}</span>
      <span aria-hidden="true"> ↗</span>
    </a>
  );
};

const PROBLEMS = ["declined", "expired", "notAssociated", "balance", "beingBought", "mainnet"] as const;

const TestnetGuide: React.FC = () => {
  const { t } = useTranslation();
  usePageMeta("testnet");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("testnet.title")}</h1>
      <p className={styles.intro}>{t("testnet.intro")}</p>

      <ol className={styles.steps}>
        <li>
          <h2>{t("testnet.hashpackTitle")}</h2>
          <p>{t("testnet.hashpackText")}</p>
          <p>
            <External href={HASHPACK_DOWNLOAD_URL}>{t("testnet.hashpackLink")}</External>
          </p>
        </li>
        <li>
          <h2>{t("testnet.accountTitle")}</h2>
          <p>{t("testnet.accountText")}</p>
        </li>
        <li>
          <h2>{t("testnet.hbarTitle")}</h2>
          <p>{t("testnet.hbarText")}</p>
          <p>
            <External href={HEDERA_FAUCET_URL}>{t("testnet.faucetLink")}</External>
          </p>
        </li>
        <li>
          <h2>{t("testnet.associateTitle")}</h2>
          <p>{t("testnet.associateText")}</p>
          <ul className={styles.tokens}>
            <li>
              {t("testnet.uminaToken")} <code>{UMINA_TOKEN_ID}</code>
            </li>
            <li>
              {t("testnet.achalaToken")} <code>{ACHALA_TOKEN_ID}</code>
            </li>
          </ul>
          <p>{t("testnet.associateAuto")}</p>
        </li>
        <li>
          <h2>{t("testnet.connectTitle")}</h2>
          <p>{t("testnet.connectText")}</p>
        </li>
        <li>
          <h2>{t("testnet.buyTitle")}</h2>
          <p>{t("testnet.buyText")}</p>
          <p>
            <Link to="/marketplace">{t("testnet.marketplaceLink")}</Link>
          </p>
        </li>
      </ol>

      <h2 className={styles.problemsTitle}>{t("testnet.problemsTitle")}</h2>
      <p>{t("testnet.problemsIntro")}</p>
      <dl className={styles.problems}>
        {PROBLEMS.map((p) => (
          <React.Fragment key={p}>
            <dt>{t(`testnet.problems.${p}.title`)}</dt>
            <dd>{t(`testnet.problems.${p}.text`)}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
};

export default TestnetGuide;
