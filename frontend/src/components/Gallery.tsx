// src/components/Gallery.tsx
// All of an item's photos in the detail view (#130): the selected one large,
// the others as a row of thumbnails under it. An item with a 3D model has one
// more tile, after the photos (#119): selecting it shows the model in place
// of the large photo. The detail view owns the selection, so its arrow keys
// can step through the tiles.
import React, { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Model, Photo } from "../utils/item";
import styles from "./Gallery.module.css";

// the 3D view's code loads only when an item with a model is opened
const StoneModel = lazy(() => import("./StoneModel"));

interface GalleryProps {
  photos: Photo[];
  /** The item's 3D model, the last tile; none without one. */
  model?: Model;
  /** The selected tile: a photo's index, or photos.length for the model. */
  selected: number;
  setSelected: (index: number) => void;
  /** The item's name: the main photo's caption and alt text, which has no description. */
  name: string;
}

const Gallery: React.FC<GalleryProps> = ({ photos, model, selected, setSelected, name }) => {
  const { t } = useTranslation();
  const main = photos[0];
  if (!main) return null;
  const tiles = photos.length + (model ? 1 : 0);
  const showModel = model !== undefined && selected === photos.length;
  const current = photos[selected] ?? main;
  const caption = (photo: Photo) => photo.description || name;
  const modelCaption = model?.description || t("model.label");

  return (
    <figure className={styles.gallery}>
      {showModel ? (
        <Suspense fallback={<img className={styles.photo} src={main.display} alt={modelCaption} />}>
          <StoneModel model={model} poster={main.display} alt={modelCaption} />
        </Suspense>
      ) : (
        <img className={styles.photo} src={current.display} alt={caption(current)} />
      )}
      {tiles > 1 && (
        <>
          <figcaption className={styles.caption}>
            {showModel ? (
              <>
                {modelCaption} <span className={styles.count}>{t("model.label")}</span>
              </>
            ) : (
              <>
                {caption(current)}{" "}
                <span className={styles.count}>
                  {t("modal.photoCount", { n: selected + 1, total: photos.length })}
                </span>
              </>
            )}
          </figcaption>
          <ul className={styles.thumbs}>
            {photos.map((photo, i) => (
              <li key={photo.uri}>
                <button
                  type="button"
                  className={i === selected ? `${styles.thumb} ${styles.selected}` : styles.thumb}
                  aria-label={caption(photo)}
                  aria-current={i === selected ? "true" : undefined}
                  onClick={() => setSelected(i)}
                >
                  <img src={photo.thumb} alt="" loading="lazy" decoding="async" />
                </button>
              </li>
            ))}
            {model && (
              <li key={model.uri}>
                <button
                  type="button"
                  className={showModel ? `${styles.thumb} ${styles.selected}` : styles.thumb}
                  aria-label={t("model.label")}
                  aria-current={showModel ? "true" : undefined}
                  onClick={() => setSelected(photos.length)}
                >
                  <img src={main.thumb} alt="" loading="lazy" decoding="async" />
                  <span className={styles.badge} aria-hidden="true">
                    3D
                  </span>
                </button>
              </li>
            )}
          </ul>
        </>
      )}
    </figure>
  );
};

export default Gallery;
