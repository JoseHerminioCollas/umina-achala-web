// src/wallet/saleApi.ts
// The site's side of the sale backend (umina-achala-server, #116):
//   prepare → the sale transaction, already signed by UA, for the buyer to sign
//   submit  → the buyer's signed copy; the server checks it and sends it
import { SALE_API_URL } from "../config";

export type TokenClass = "umina" | "achala";

export interface PreparedSale {
  saleId: string;
  /** The frozen transaction in base64, signed by UA and the Treasury. */
  transaction: string;
  transactionId: string;
  stoneId: string;
  price: { amount: string; currency: "HBAR" };
  /** "<token>/<serial>" of every NFT that moves (an Achala with its stones). */
  nfts: string[];
  /** When the transaction stops being valid (about two minutes). */
  expiresAt: string;
}

export interface SaleResult {
  status: string;
  transactionId: string;
  stoneId: string;
  nfts: string[];
}

/** The server's error codes (umina-achala-server src/app.js), plus network for no answer. */
export type SaleErrorCode =
  | "bad_request"
  | "bad_signature"
  | "not_listed"
  | "expired"
  | "not_available"
  | "not_associated"
  | "unsupported_account"
  | "rate_limited"
  | "failed"
  | "not_found"
  | "network";

export class SaleApiError extends Error {
  constructor(
    public code: SaleErrorCode,
    message: string,
    public status: number,
    /** Extra fields of the error, such as `tokens` for not_associated. */
    public details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "SaleApiError";
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${SALE_API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new SaleApiError("network", "the sale service could not be reached", 0);
  }
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const { code, message, ...details } = json?.error ?? {};
    throw new SaleApiError(
      code ?? "failed",
      message ?? `the sale service answered ${response.status}`,
      response.status,
      details,
    );
  }
  return json as T;
}

export function prepareSale(token: TokenClass, serial: number, buyer: string): Promise<PreparedSale> {
  return post("/sale/prepare", { token, serial, buyer });
}

export function submitSale(saleId: string, transaction: string): Promise<SaleResult> {
  return post("/sale/submit", { saleId, transaction });
}
