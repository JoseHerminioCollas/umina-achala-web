// src/wallet/buyErrors.ts
// What the buy dialog tells the buyer when a purchase stops (#58), from the
// sale backend's error codes (saleApi.ts) and the wallet's refusals.
import { SaleApiError } from "./saleApi";

export interface BuyProblem {
  /** The i18n key of the message, under buy.error. */
  key:
    | "rejected"
    | "expired"
    | "replaced"
    | "gone"
    | "beingBought"
    | "notAssociated"
    | "balance"
    | "account"
    | "signature"
    | "network"
    | "busy"
    | "failed";
  /** The item is no longer for sale: the site hides it. */
  gone?: boolean;
  /** Starting again can work. */
  retry: boolean;
  /** beingBought: about how many seconds until the other buyer's sale ends. */
  seconds?: number;
}

/** The message of an Error, or of the plain objects wallets reject with. */
function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return String(err ?? "");
}

export function buyProblem(err: unknown): BuyProblem {
  if (err instanceof SaleApiError) {
    switch (err.code) {
      case "expired":
        return { key: "expired", retry: true };
      case "replaced":
        // the buyer started again elsewhere: that newer request is the one to approve
        return { key: "replaced", retry: false };
      case "not_listed":
      case "not_available":
        return { key: "gone", gone: true, retry: false };
      case "being_bought": {
        // another buyer's sale holds the item for a while: it stays for sale
        const seconds = Number(err.details.retryAfter);
        return { key: "beingBought", retry: true, seconds: Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 120 };
      }
      case "insufficient_balance":
        return { key: "balance", retry: false };
      case "not_associated":
        return { key: "notAssociated", retry: true };
      case "unsupported_account":
        return { key: "account", retry: false };
      case "bad_signature":
        return { key: "signature", retry: true };
      case "network":
        return { key: "network", retry: true };
      case "rate_limited":
        return { key: "busy", retry: true };
      case "failed":
        // the network refused the transfer, e.g. INSUFFICIENT_PAYER_BALANCE
        if (/INSUFFICIENT/.test(String(err.details.status ?? ""))) return { key: "balance", retry: false };
        return { key: "failed", retry: true };
      default:
        return { key: "failed", retry: true };
    }
  }
  if (/reject|denied|declin|cancel/i.test(messageOf(err))) return { key: "rejected", retry: true };
  return { key: "failed", retry: true };
}
