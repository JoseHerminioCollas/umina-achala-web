// src/wallet/walletConnector.ts
// Connects a Hedera wallet (HashPack) over WalletConnect with the
// hedera-wallet-connect DAppConnector (#58). It finds the HashPack browser
// extension; otherwise WalletConnect's modal shows a QR code or opens the app.
//
// This module is large (the Hedera SDK): import it only when the visitor
// asks for the wallet, with a dynamic import().
//
// Only the DAppConnector part of the library is imported: its main entry also
// loads the Reown AppKit adapter, which pulls in ethers and AppKit.
import { Buffer } from "buffer";
import { LedgerId, Transaction } from "@hiero-ledger/sdk";
import {
  DAppConnector,
  type DAppSigner,
} from "@hashgraph/hedera-wallet-connect/dist/lib/dapp/index.js";
import {
  HederaChainId,
  HederaJsonRpcMethod,
  HederaSessionEvent,
} from "@hashgraph/hedera-wallet-connect/dist/lib/shared/index.js";
import { NETWORK, SITE_URL, WALLETCONNECT_PROJECT_ID } from "../config";
import { isPhone } from "./device";

export interface WalletAccount {
  /** 0.0.N */
  accountId: string;
  /** The network the wallet's account is on, from its session. */
  network: string;
}

// The wallet app link WalletConnect's modal saves when the visitor picks a
// wallet on a phone. With it, each signing request opens the wallet with a
// wc?requestId=… link, which HashPack reads as a new pairing ("pairing error:
// missing or invalid pair() uri#relay-protocol") and the request never shows.
// It is removed, and the wallet is opened with its plain app link instead
// (WALLET_APPS), which brings it to the front with the request waiting.
const WALLET_LINK_KEY = "WALLETCONNECT_DEEPLINK_CHOICE";

function forgetWalletLink(): void {
  try {
    localStorage.removeItem(WALLET_LINK_KEY);
  } catch {
    // no storage (private window, blocked site data): nothing was saved
  }
}

/** Wallet apps opened by their plain app link on a phone, by the name in their WalletConnect session. */
const WALLET_APPS: { match: RegExp; name: string; link: string }[] = [
  { match: /hashpack/i, name: "HashPack", link: "hashpack://" },
];

let connector: DAppConnector | null = null;
let starting: Promise<DAppConnector> | null = null;

/** The one DAppConnector of the page, initialised once; a kept session comes back with it. */
export async function getConnector(): Promise<DAppConnector> {
  if (connector) return connector;
  starting ??= (async () => {
    const c = new DAppConnector(
      {
        name: "Umiña Achala",
        description: "Peruvian stones and jewelry, origin verified",
        // Must be the page's own origin, or the wallet refuses the request
        url: window.location.origin,
        icons: [new URL("og-image.png", SITE_URL).toString()],
      },
      NETWORK === "mainnet" ? LedgerId.MAINNET : LedgerId.TESTNET,
      WALLETCONNECT_PROJECT_ID,
      Object.values(HederaJsonRpcMethod),
      [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
      [NETWORK === "mainnet" ? HederaChainId.Mainnet : HederaChainId.Testnet],
    );
    await c.init({ logger: "error" });
    // A session kept from an earlier visit may still have the link saved
    forgetWalletLink();
    connector = c;
    return c;
  })();
  try {
    return await starting;
  } catch (err) {
    starting = null;
    throw err;
  }
}

function accountOf(signer: DAppSigner): WalletAccount {
  return {
    accountId: signer.getAccountId().toString(),
    network: signer.getLedgerId().toString(),
  };
}

/** The connected account, or null. */
export async function currentAccount(): Promise<WalletAccount | null> {
  const c = await getConnector();
  const signer = c.signers[0];
  return signer ? accountOf(signer) : null;
}

/** The browser extensions the connector found (HashPack, …), as { id, name }. */
export async function availableExtensions(): Promise<{ id: string; name: string }[]> {
  const c = await getConnector();
  return c.extensions
    .filter((e) => e.available)
    .map((e) => ({ id: e.id, name: e.name ?? e.id }));
}

/**
 * Connects a wallet: through the given browser extension, or WalletConnect's
 * modal (QR code on a computer, the wallet app on a phone).
 */
export async function connect(extensionId?: string): Promise<WalletAccount> {
  const c = await getConnector();
  if (extensionId) await c.connectExtension(extensionId);
  else await c.openModal(undefined, true);
  forgetWalletLink();
  const signer = c.signers[0];
  if (!signer) throw new Error("the wallet did not share an account");
  return accountOf(signer);
}

export async function disconnect(): Promise<void> {
  const c = await getConnector();
  if (c.signers.length) await c.disconnectAll();
}

/** The wallet app the visitor approves in on this phone, or null (a computer, an extension, another wallet). */
function walletAppOf(c: DAppConnector, signer: DAppSigner | undefined): (typeof WALLET_APPS)[number] | null {
  if (!signer || signer.extensionId || !isPhone()) return null;
  let peer = "";
  try {
    peer = c.walletConnectClient?.session.get(signer.topic).peer.metadata.name ?? "";
  } catch {
    return null; // the session is gone
  }
  return WALLET_APPS.find((w) => w.match.test(peer)) ?? null;
}

/**
 * The name of the wallet app the connected account approves in on this phone
 * ("HashPack"), for an "Open HashPack" button while a signature is awaited;
 * null when there is none to open.
 */
export async function walletAppName(): Promise<string | null> {
  const c = await getConnector();
  return walletAppOf(c, c.signers[0])?.name ?? null;
}

/**
 * Where the visitor approves a request, for what the site tells them while it
 * waits: "extension" (a window in this browser), "app" (the wallet app on this
 * phone), or "remote" (a wallet on another device, paired by QR code); null
 * with no connection.
 */
export type WalletKind = "extension" | "app" | "remote";

export async function walletKind(): Promise<WalletKind | null> {
  const c = await getConnector();
  const signer = c.signers[0];
  if (!signer) return null;
  if (signer.extensionId) return "extension";
  return isPhone() ? "app" : "remote";
}

/** Brings the wallet app to the front, where the waiting request shows. Call it from a tap. */
export async function openWallet(): Promise<void> {
  const c = await getConnector();
  const app = walletAppOf(c, c.signers[0]);
  if (app) window.location.href = app.link;
}

/**
 * Asks the wallet to sign a frozen transaction (base64) without sending it
 * (hedera_signTransaction), and returns the transaction with the account's
 * signature added, in base64. On a phone, the wallet app is opened once the
 * request has reached the relay (not before: Chrome may pause the page once
 * it is in the background), so call it from the visitor's tap.
 */
export async function signTransaction(accountId: string, transactionBase64: string): Promise<string> {
  const c = await getConnector();
  const tx = Transaction.fromBytes(Buffer.from(transactionBase64, "base64"));
  const signer = c.signers.find((s) => s.getAccountId().toString() === accountId);
  const app = walletAppOf(c, signer);
  const client = c.walletConnectClient;
  const onSent = ({ topic }: { topic: string }) => {
    if (topic !== signer?.topic) return;
    client?.events.off("session_request_sent", onSent);
    if (app) window.location.href = app.link;
  };
  if (app && client) client.events.on("session_request_sent", onSent);
  try {
    const signed = await c.signTransaction({
      signerAccountId: `hedera:${NETWORK}:${accountId}`,
      transactionBody: tx,
    });
    if (!(signed instanceof Transaction)) throw new Error("the wallet did not return a transaction");
    return Buffer.from(signed.toBytes()).toString("base64");
  } finally {
    client?.events.off("session_request_sent", onSent);
  }
}
