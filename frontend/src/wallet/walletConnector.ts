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

export interface WalletAccount {
  /** 0.0.N */
  accountId: string;
  /** The network the wallet's account is on, from its session. */
  network: string;
}

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
  const signer = c.signers[0];
  if (!signer) throw new Error("the wallet did not share an account");
  return accountOf(signer);
}

export async function disconnect(): Promise<void> {
  const c = await getConnector();
  if (c.signers.length) await c.disconnectAll();
}

/**
 * Asks the wallet to sign a frozen transaction (base64) without sending it
 * (hedera_signTransaction), and returns the transaction with the account's
 * signature added, in base64.
 */
export async function signTransaction(accountId: string, transactionBase64: string): Promise<string> {
  const c = await getConnector();
  const tx = Transaction.fromBytes(Buffer.from(transactionBase64, "base64"));
  const signed = await c.signTransaction({
    signerAccountId: `hedera:${NETWORK}:${accountId}`,
    transactionBody: tx,
  });
  if (!(signed instanceof Transaction)) throw new Error("the wallet did not return a transaction");
  return Buffer.from(signed.toBytes()).toString("base64");
}
