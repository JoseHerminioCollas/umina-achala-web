// src/components/Gallery.tsx
// All of an item's photos in the detail view (#130): the selected one large,
// the others as a row of thumbnails under it. The detail view owns the
// selection, so its arrow keys can step through the photos.
import React from "react";
import { useTranslation } from "react-i18next";
import { Photo } from "../utils/item";
import styles from "./Gallery.module.css";

interface GalleryProps {
  photos: Photo[];
  selected: number;
  setSelected: (index: number) => void;
  /** The item's name: the main photo's caption and alt text, which has no description. */
  name: string;
}

const Gallery: React.FC<GalleryProps> = ({ photos, selected, setSelected, name }) => {
  const { t } = useTranslation();
  const current = photos[selected] ?? photos[0];
  if (!current) return null;
  const caption = (photo: Photo) => photo.description || name;

  return (
    <figure className={styles.gallery}>
      <img className={styles.photo} src={current.display} alt={caption(current)} />
      {photos.length > 1 && (
        <>
          <figcaption className={styles.caption}>
            {caption(current)}{" "}
            <span className={styles.count}>
              {t("modal.photoCount", { n: selected + 1, total: photos.length })}
            </span>
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
          </ul>
        </>
      )}
    </figure>
  );
};

export default Gallery;
