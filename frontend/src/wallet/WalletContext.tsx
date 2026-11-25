// src/wallet/WalletContext.tsx
// The visitor's wallet connection, shared by the header's Connect button and
// both Buy buttons (the card and the detail view) (#58).
//
// The wallet code (walletConnector.ts, with the Hedera SDK) is large: it is
// loaded only when the visitor asks for the wallet, or when a connection was
// kept from an earlier visit (KEPT_KEY), never on a plain page load.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { WalletAccount } from "./walletConnector";
import WalletModal from "../components/WalletModal";

export type WalletModule = typeof import("./walletConnector");
export type { WalletAccount };

/** Loads the wallet code; tests pass their own. */
export type LoadWallet = () => Promise<WalletModule>;
const loadWalletCode: LoadWallet = () => import("./walletConnector");

// Set while a connection is kept, so the next visit restores it without loading the wallet code first
const KEPT_KEY = "ua.wallet.connected";

function keep(on: boolean): void {
  try {
    if (on) localStorage.setItem(KEPT_KEY, "1");
    else localStorage.removeItem(KEPT_KEY);
  } catch {
    // no storage: the connection is not restored on the next visit
  }
}

function kept(): boolean {
  try {
    return localStorage.getItem(KEPT_KEY) === "1";
  } catch {
    return false;
  }
}

export interface WalletState {
  /** The connected account, or null. */
  account: WalletAccount | null;
  /** True while a kept connection is being restored. */
  restoring: boolean;
  /**
   * The wallet app to open on this phone while a signature is awaited
   * ("HashPack"), or null (a computer, the extension).
   */
  appName: string | null;
  /** Opens the connect dialog. */
  openConnect: () => void;
  /**
   * The connected account; opens the connect dialog first when there is none.
   * Rejects when the visitor closes the dialog without connecting.
   */
  requireAccount: () => Promise<WalletAccount>;
  disconnect: () => Promise<void>;
  /** The wallet code, loaded on first use (signing, opening the wallet app). */
  wallet: () => Promise<WalletModule>;
}

const notProvided = () => Promise.reject(new Error("no WalletProvider"));

const WalletContext = createContext<WalletState>({
  account: null,
  restoring: false,
  appName: null,
  openConnect: () => undefined,
  requireAccount: notProvided,
  disconnect: notProvided,
  wallet: notProvided,
});

export const useWallet = (): WalletState => useContext(WalletContext);

/** Thrown by requireAccount when the visitor closes the connect dialog. */
export class ConnectCancelled extends Error {
  constructor() {
    super("the visitor closed the connect dialog");
    this.name = "ConnectCancelled";
  }
}

interface Waiter {
  resolve: (a: WalletAccount) => void;
  reject: (e: Error) => void;
}

export const WalletProvider: React.FC<{ children: React.ReactNode; load?: LoadWallet }> = ({
  children,
  load = loadWalletCode,
}) => {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [appName, setAppName] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const waiters = useRef<Waiter[]>([]);
  const loading = useRef<Promise<WalletModule> | null>(null);

  const wallet = useCallback(() => {
    loading.current ??= load().catch((err) => {
      loading.current = null;
      throw err;
    });
    return loading.current;
  }, [load]);

  const connected = useCallback(
    async (a: WalletAccount | null) => {
      setAccount(a);
      keep(!!a);
      setAppName(a ? await (await wallet()).walletAppName().catch(() => null) : null);
    },
    [wallet],
  );

  // A connection kept from an earlier visit comes back
  useEffect(() => {
    if (!kept()) return;
    let live = true;
    setRestoring(true);
    wallet()
      .then((w) => w.currentAccount())
      .then(async (a) => {
        if (live) await connected(a);
      })
      .catch((err) => {
        console.error("wallet: the kept connection did not come back", err);
        if (live) connected(null);
      })
      .finally(() => {
        if (live) setRestoring(false);
      });
    return () => {
      live = false;
    };
  }, [wallet, connected]);

  const settle = (a: WalletAccount | null) => {
    const ws = waiters.current;
    waiters.current = [];
    ws.forEach((w) => (a ? w.resolve(a) : w.reject(new ConnectCancelled())));
  };

  const onConnected = useCallback(
    async (a: WalletAccount) => {
      await connected(a);
      setDialogOpen(false);
      settle(a);
    },
    [connected],
  );

  const onClose = useCallback(() => {
    setDialogOpen(false);
    settle(null);
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      account,
      restoring,
      appName,
      openConnect: () => setDialogOpen(true),
      requireAccount: () =>
        account
          ? Promise.resolve(account)
          : new Promise<WalletAccount>((resolve, reject) => {
              waiters.current.push({ resolve, reject });
              setDialogOpen(true);
            }),
      disconnect: async () => {
        await (await wallet()).disconnect();
        await connected(null);
      },
      wallet,
    }),
    [account, restoring, appName, wallet, connected],
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
      {dialogOpen && <WalletModal wallet={wallet} onConnected={onConnected} onClose={onClose} />}
    </WalletContext.Provider>
  );
};
