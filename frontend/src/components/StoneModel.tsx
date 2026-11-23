// src/components/StoneModel.tsx
// An item's 3D model in the detail view (#119), in place of the large photo
// when the gallery's 3D tile is selected. <model-viewer> (Google, Apache 2.0)
// and the model load only then: the module is imported on first use, so the
// marketplace and an item's photos never load them.
//
// The stone turns slowly on its own; dragging turns it, pinching or scrolling
// zooms. A button pauses and restarts the turn (WCAG 2.2.2), and with reduced
// motion asked for, the stone starts still. On a phone, "View in your room"
// shows it at real size through the camera (AR). Without WebGL, or if the
// module or the model fails, the main photo is shown instead.
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Model } from "../utils/item";
import styles from "./StoneModel.module.css";

interface StoneModelProps {
  model: Model;
  /** The main photo's display copy: shown while the model loads, and if it fails. */
  poster: string;
  /** The alt text: the model's description, or the item's name. */
  alt: string;
}

// slow enough to look at the stone, about one turn in 12 s
const TURN = "30deg";
// seconds after the visitor lets go before the turn starts again
const RESUME_MS = 3000;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

/** Loads the <model-viewer> element once; the same promise for every caller. */
let loading: Promise<unknown> | undefined;
export const loadModelViewer = () => (loading ??= import("@google/model-viewer"));

const StoneModel: React.FC<StoneModelProps> = ({ model, poster, alt }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<"loading" | "ready" | "failed">(() =>
    hasWebGL() ? "loading" : "failed",
  );
  const [turning, setTurning] = useState(() => !prefersReducedMotion());
  const viewer = useRef<HTMLElement>(null);

  // the module, once
  useEffect(() => {
    if (state !== "loading") return;
    let live = true;
    loadModelViewer().then(
      () => live && setState("ready"),
      () => live && setState("failed"),
    );
    return () => {
      live = false;
    };
  }, [state]);

  // the model itself failing (network, a bad file) falls back to the photo
  useEffect(() => {
    const element = viewer.current;
    if (state !== "ready" || !element) return;
    const failed = () => setState("failed");
    element.addEventListener("error", failed);
    return () => element.removeEventListener("error", failed);
  }, [state]);

  if (state === "failed") {
    return (
      <div className={styles.frame}>
        <img className={styles.fallback} src={poster} alt={alt} />
        <p className={styles.note}>{t("model.unavailable")}</p>
      </div>
    );
  }

  return (
    <div className={styles.frame}>
      {state === "ready" ? (
        <model-viewer
          ref={viewer}
          class={styles.viewer}
          src={model.url}
          poster={poster}
          alt={alt}
          camera-controls=""
          auto-rotate={turning ? "" : undefined}
          auto-rotate-delay={RESUME_MS}
          rotation-per-second={TURN}
          interaction-prompt="none"
          touch-action="pan-y"
          ar=""
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="fixed"
        >
          <button slot="ar-button" type="button" className={styles.ar}>
            {t("model.viewInRoom")}
          </button>
        </model-viewer>
      ) : (
        <img className={styles.fallback} src={poster} alt={alt} />
      )}
      <button
        type="button"
        className={styles.pause}
        aria-pressed={!turning}
        aria-label={t("model.pause")}
        title={turning ? t("model.pause") : t("model.play")}
        onClick={() => setTurning((on) => !on)}
      >
        {turning ? (
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M5 3l8 5-8 5z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default StoneModel;
