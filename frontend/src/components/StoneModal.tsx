// src/components/StoneModal.tsx
import React, { useEffect, useId, useMemo, useState } from "react";
import { CatalogItem, Media } from "../types/catalog";
import { attribute, complianceEvent, documents, formatPrice, photos, title } from "../utils/item";
import Gallery from "./Gallery";
import styles from "./StoneModal.module.css";
import { useTranslation } from "react-i18next";
import { hashscanNftUrl, hashscanTopicUrl, hashscanMessageUrl } from "../utils/chainLinks";

interface StoneModalProps {
  open: CatalogItem | null;
  setOpen: (item: CatalogItem | null) => void;
  /** The catalog's copies of photos and documents; without them, they load through the gateway. */
  media?: Media;
}

// shown as the heading, or not at all
const HIDDEN_TRAITS = ["HS Code", "Stone Type", "Piece Type"];

const ExternalIcon = () => (
  <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M6 3H3v10h10v-3M9 2h5v5M14 2 7 9" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const PdfIcon = () => (
  <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3M5.5 8.5h5M5.5 11h5" fill="none" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

interface NewTabLinkProps {
  href: string;
  /** the id of the hidden "opens in a new tab" text */
  describedBy: string;
  className: string;
  pdf?: boolean;
  children: React.ReactNode;
}

/** A link that opens in a new tab, marked ↗ and announced as such (#132). */
const NewTabLink: React.FC<NewTabLinkProps> = ({ href, describedBy, className, pdf, children }) => (
  <a
    className={className}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-describedby={describedBy}
  >
    {pdf && <PdfIcon />}
    <span>{children}</span>
    <ExternalIcon />
  </a>
);

const StoneModal: React.FC<StoneModalProps> = ({ open, setOpen, media }) => {
  const { t } = useTranslation();
  const gallery = useMemo(() => (open ? photos(open, media) : []), [open, media]);
  const [selected, setSelected] = useState(0);
  const newTabId = useId();

  // each item opens on its first photo
  useEffect(() => setSelected(0), [open]);

  // Escape closes; left / right step through the photos (#130)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
      } else if (gallery.length > 1 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        const step = e.key === "ArrowRight" ? 1 : -1;
        setSelected((i) => (i + step + gallery.length) % gallery.length);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen, gallery.length]);

  if (!open) return null;

  // the item's own compliance record; the whole topic when it has none
  const compliance = complianceEvent(open);
  const topic = open.metadata.properties.hcs_compliance_topic;
  // the item's own PDFs, in metadata order (#132); not an Achala's stones' PDFs
  const pdfs = documents(open, media).filter((d) => d.type === "application/pdf");

  const complianceUrl = compliance?.consensus_timestamp
    ? hashscanMessageUrl(compliance.consensus_timestamp)
    : topic && hashscanTopicUrl(topic);

  return (
    <div className={styles.modal} onClick={() => setOpen(null)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title(open)}</h2>
          <button className={styles.close} onClick={() => setOpen(null)}>×</button>
        </div>
        <div className={styles.modalBody}>
          <Gallery
            photos={gallery}
            selected={selected}
            setSelected={setSelected}
            name={open.metadata.name}
          />
          <div>
            <p className={styles.price}>
              {t("modal.price")} {formatPrice(open.price)}
            </p>
            <div className={styles.attributeList}>
              <dl>
                {open.metadata.attributes
                  .filter(
                    (attr) => !HIDDEN_TRAITS.includes(attr.trait_type) && attr.value !== "",
                  )
                  .map((attr) => (
                    <div className={styles.traitType} key={attr.trait_type}>
                      <dt>{attr.trait_type}</dt>
                      <dd>{String(attr.value)}</dd>
                    </div>
                  ))}
              </dl>
            </div>
            <span id={newTabId} hidden>
              {t("modal.newTab")}
            </span>
            {pdfs.length > 0 && (
              <section className={styles.section}>
                <h3>{t("modal.documents")}</h3>
                <ul className={styles.linkList}>
                  {pdfs.map((doc, i) => (
                    <li key={doc.uri}>
                      <NewTabLink href={doc.url} describedBy={newTabId} className={styles.linkButton} pdf>
                        {doc.description || t("modal.documentN", { n: i + 1 })}
                      </NewTabLink>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {open.kind === "achala" && (
              <section className={`${styles.section} ${styles.stones}`}>
                <h3>{t("modal.stonesInPiece")}</h3>
                <ul>
                  {open.stones.map((stone) => (
                    <li key={stone.stone_id}>
                      {title(stone)}
                      {attribute(stone, "Weight") && <> · {attribute(stone, "Weight")}</>}
                      {" · "}
                      <NewTabLink
                        href={hashscanNftUrl(stone.token_id, stone.serial)}
                        describedBy={newTabId}
                        className={styles.inlineLink}
                      >
                        {stone.stone_id}
                      </NewTabLink>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className={styles.section}>
              <h3>{t("modal.chainRecord")}</h3>
              <ul className={styles.linkList}>
                <li>
                  <NewTabLink
                    href={hashscanNftUrl(open.token_id, open.serial)}
                    describedBy={newTabId}
                    className={styles.linkButton}
                  >
                    {t("modal.viewHashscan")}
                  </NewTabLink>
                </li>
                {complianceUrl && (
                  <li>
                    <NewTabLink href={complianceUrl} describedBy={newTabId} className={styles.linkButton}>
                      {t("modal.viewCompliance")}
                    </NewTabLink>
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoneModal;
