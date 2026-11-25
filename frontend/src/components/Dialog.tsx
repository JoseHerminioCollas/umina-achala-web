// src/components/Dialog.tsx
// A small accessible dialog (#58, #79): labelled by its title, focus moves
// into it on open and back where it was on close, Escape and the backdrop
// close it (unless `busy`), Tab stays inside.
import React, { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Dialog.module.css";

interface DialogProps {
  title: string;
  onClose: () => void;
  /** While true, Escape and the backdrop do not close it (a step that must finish). */
  busy?: boolean;
  children: React.ReactNode;
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Dialog: React.FC<DialogProps> = ({ title, onClose, busy = false, children }) => {
  const { t } = useTranslation();
  const titleId = useId();
  const box = useRef<HTMLDivElement>(null);

  // focus in on open, back on close
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const first = box.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? box.current)?.focus();
    return () => before?.focus?.();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation(); // a dialog over the detail view closes alone
      if (!busy) onClose();
    } else if (e.key === "Tab" && box.current) {
      const all = [...box.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (all.length === 0) return;
      const [first, last] = [all[0], all[all.length - 1]];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div className={styles.backdrop} onClick={() => !busy && onClose()}>
      <div
        ref={box}
        className={styles.box}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          <button className={styles.close} onClick={onClose} disabled={busy} aria-label={t("dialog.close")}>
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
