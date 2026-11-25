// src/hooks/useBuying.tsx
// Buying from a page that shows cards and the detail view (the home page and
// the marketplace, #58): the buy dialog, and the items sold during this
// visit, hidden at once on every page. The loaded catalog stays as it is
// until the next visit loads the rebuilt one.
import React, { useCallback, useEffect, useReducer, useState } from "react";
import BuyDialog from "../components/BuyDialog";
import { CatalogItem, Media } from "../types/catalog";

const soldIds = new Set<string>();
const listeners = new Set<() => void>();

function markSold(stoneId: string): void {
  soldIds.add(stoneId);
  listeners.forEach((l) => l());
}

/** Forgets the items sold during this visit (tests). */
export function resetSold(): void {
  soldIds.clear();
}

export function useBuying(media: Media | undefined, onSold?: (item: CatalogItem) => void) {
  const [buying, setBuying] = useState<CatalogItem | null>(null);
  const [version, bump] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    listeners.add(bump);
    return () => {
      listeners.delete(bump);
    };
  }, []);

  /** The items not sold during this visit; a new function after each sale, for useMemo. */
  const unsold = useCallback(
    (items: CatalogItem[]) => items.filter((it) => !soldIds.has(it.stone_id)),
    [version], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const dialog = buying ? (
    <BuyDialog
      item={buying}
      media={media}
      onClose={() => setBuying(null)}
      onSold={(item) => {
        markSold(item.stone_id);
        onSold?.(item);
      }}
    />
  ) : null;

  return { startBuy: setBuying, unsold, dialog };
}
