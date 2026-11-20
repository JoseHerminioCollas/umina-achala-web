// src/hooks/useCatalog.ts
// The catalog for a page, loaded once per visit and shared by every page.
import { useEffect, useState } from "react";
import { CatalogFacade, loadCatalog } from "../data/CatalogFacade";

export type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; catalog: CatalogFacade };

let pending: Promise<CatalogFacade> | null = null;

function getCatalog(): Promise<CatalogFacade> {
  if (!pending) {
    pending = loadCatalog().then(CatalogFacade.fromCatalog);
    // a failed load is tried again on the next page that asks
    pending.catch(() => {
      pending = null;
    });
  }
  return pending;
}

/** Forgets the loaded catalog (tests). */
export function resetCatalog() {
  pending = null;
}

export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({ status: "loading" });

  useEffect(() => {
    let live = true;
    getCatalog().then(
      (catalog) => live && setState({ status: "ready", catalog }),
      (err) => {
        console.error(err);
        if (live) setState({ status: "error" });
      },
    );
    return () => {
      live = false;
    };
  }, []);

  return state;
}
