// src/wallet/WalletTest.tsx
// Development-only page (#58) that tries each step of a sale on its own:
//   connect HashPack → prepare (server) → sign in the wallet (not sent)
//   → check the signature here → submit (the server sends the sale)
// Only the last step changes anything on the chain. English only, plain
// styles: it is a tool, not part of the site.
import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { PublicKey, Transaction } from "@hiero-ledger/sdk";
import { MIRROR_NODE_URL, NETWORK, SALE_API_URL } from "../config";
import { prepareSale, submitSale, SaleApiError, type PreparedSale, type SaleResult, type TokenClass } from "./saleApi";
import {
  availableExtensions,
  connect,
  currentAccount,
  disconnect,
  signTransaction,
  type WalletAccount,
} from "./walletConnector";

const box: React.CSSProperties = { border: "1px solid #999", borderRadius: 6, padding: 12, margin: "12px 0" };
const button: React.CSSProperties = { padding: "8px 12px", margin: "4px 8px 4px 0", fontSize: 16 };

/** HashScan wants 0.0.N-seconds-nanos for a transaction ID written 0.0.N@seconds.nanos. */
const hashscanTxUrl = (id: string) => {
  const [payer, at] = id.split("@");
  return `https://hashscan.io/${NETWORK}/transaction/${payer}-${at.replace(".", "-")}`;
};

function describe(err: unknown): string {
  if (err instanceof SaleApiError) {
    const extra = Object.keys(err.details).length ? ` ${JSON.stringify(err.details)}` : "";
    return `${err.code} (HTTP ${err.status}): ${err.message}${extra}`;
  }
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * The same check the server makes before it sends the sale: the account's key
 * (from the mirror node) has signed the transaction.
 */
async function checkSignature(accountId: string, signedBase64: string): Promise<string> {
  const response = await fetch(`${MIRROR_NODE_URL}/api/v1/accounts/${accountId}`);
  if (!response.ok) throw new Error(`mirror node answered ${response.status}`);
  const { key } = await response.json();
  let publicKey: PublicKey;
  if (key?._type === "ED25519") publicKey = PublicKey.fromStringED25519(key.key);
  else if (key?._type === "ECDSA_SECP256K1") publicKey = PublicKey.fromStringECDSA(key.key);
  else throw new Error(`the account's key is ${key?._type ?? "missing"}: the server takes a single ED25519 or ECDSA key`);
  const tx = Transaction.fromBytes(Buffer.from(signedBase64, "base64"));
  return publicKey.verifyTransaction(tx)
    ? `the ${key._type} key of ${accountId} has signed it`
    : `no valid signature by the ${key._type} key of ${accountId}`;
}

export default function WalletTest(): JSX.Element {
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [extensions, setExtensions] = useState<{ id: string; name: string }[]>([]);
  const [token, setToken] = useState<TokenClass>("umina");
  const [serial, setSerial] = useState("29");
  const [sale, setSale] = useState<PreparedSale | null>(null);
  const [signed, setSigned] = useState<string | null>(null);
  const [result, setResult] = useState<SaleResult | null>(null);
  const [now, setNow] = useState(Date.now());

  const note = (line: string) =>
    setLog((l) => [...l, `${new Date().toLocaleTimeString()}  ${line}`]);

  async function step(name: string, run: () => Promise<void>) {
    setBusy(true);
    note(`${name}…`);
    try {
      await run();
    } catch (err) {
      note(`✗ ${name}: ${describe(err)}`);
      console.error(name, err);
    } finally {
      setBusy(false);
    }
  }

  // Start the connector: a kept session comes back, and extensions announce themselves
  useEffect(() => {
    step("start the wallet connector", async () => {
      const a = await currentAccount();
      setAccount(a);
      note(a ? `✓ session kept: ${a.accountId} on ${a.network}` : "✓ ready, no wallet connected");
      // Extensions answer a message from the connector, shortly after it starts
      setTimeout(async () => setExtensions(await availableExtensions()), 1000);
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const secondsLeft = sale ? Math.round((Date.parse(sale.expiresAt) - now) / 1000) : 0;
  const wrongNetwork = account && account.network !== NETWORK;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>
      <h1>Wallet test</h1>
      <p>
        Development only (#58). Network <b>{NETWORK}</b>, sale backend <code>{SALE_API_URL}</code>. Only
        step 5 sends a transaction.
      </p>

      <section style={box}>
        <h2>1. Connect</h2>
        <p>
          {account ? (
            <>
              Connected: <b>{account.accountId}</b> on {account.network}
              {wrongNetwork && <b style={{ color: "#b00" }}> — not {NETWORK}: switch the network in HashPack</b>}
            </>
          ) : (
            "No wallet connected."
          )}
        </p>
        {extensions.map((e) => (
          <button
            key={e.id}
            style={button}
            disabled={busy}
            onClick={() =>
              step(`connect with the ${e.name} extension`, async () => {
                const a = await connect(e.id);
                setAccount(a);
                note(`✓ connected ${a.accountId} on ${a.network}`);
              })
            }
          >
            Connect with {e.name} (extension)
          </button>
        ))}
        <button
          style={button}
          disabled={busy}
          onClick={() =>
            step("connect with WalletConnect", async () => {
              const a = await connect();
              setAccount(a);
              note(`✓ connected ${a.accountId} on ${a.network}`);
            })
          }
        >
          Connect with WalletConnect (QR code or app)
        </button>
        <button
          style={button}
          disabled={busy || !account}
          onClick={() =>
            step("disconnect", async () => {
              await disconnect();
              setAccount(null);
              note("✓ disconnected");
            })
          }
        >
          Disconnect
        </button>
      </section>

      <section style={box}>
        <h2>2. Prepare the sale (server)</h2>
        <label>
          Token{" "}
          <select value={token} onChange={(e) => setToken(e.target.value as TokenClass)}>
            <option value="umina">umina</option>
            <option value="achala">achala</option>
          </select>
        </label>{" "}
        <label>
          Serial <input value={serial} onChange={(e) => setSerial(e.target.value)} size={6} inputMode="numeric" />
        </label>
        <div>
          <button
            style={button}
            disabled={busy || !account}
            onClick={() =>
              step(`prepare ${token} ${serial} for ${account?.accountId}`, async () => {
                setSale(null);
                setSigned(null);
                setResult(null);
                const s = await prepareSale(token, Number(serial), account!.accountId);
                setSale(s);
                note(`✓ prepared ${s.stoneId} at ${s.price.amount} ${s.price.currency} (${s.transactionId}), valid until ${new Date(s.expiresAt).toLocaleTimeString()}`);
              })
            }
          >
            Prepare
          </button>
        </div>
        {sale && (
          <p>
            {sale.stoneId}, {sale.price.amount} {sale.price.currency}, moves {sale.nfts.join(", ")}.{" "}
            {secondsLeft > 0 ? `${secondsLeft} s left to sign and submit.` : <b>Expired: prepare again.</b>}
          </p>
        )}
      </section>

      <section style={box}>
        <h2>3. Sign in the wallet (not sent)</h2>
        <button
          style={button}
          disabled={busy || !sale || !account || secondsLeft <= 0}
          onClick={() =>
            step("sign in the wallet (approve it in HashPack)", async () => {
              const s = await signTransaction(account!.accountId, sale!.transaction);
              setSigned(s);
              note(`✓ signed by the wallet (${s.length} base64 characters)`);
            })
          }
        >
          Sign
        </button>
      </section>

      <section style={box}>
        <h2>4. Check the signature (here, nothing sent)</h2>
        <button
          style={button}
          disabled={busy || !signed}
          onClick={() =>
            step("check the signature against the account's key", async () => {
              note(`✓ ${await checkSignature(account!.accountId, signed!)}`);
            })
          }
        >
          Check
        </button>
      </section>

      <section style={box}>
        <h2>5. Submit (the server sends the sale)</h2>
        <button
          style={{ ...button, fontWeight: "bold" }}
          disabled={busy || !signed || !sale || secondsLeft <= 0 || !!result}
          onClick={() =>
            step(`submit ${sale!.stoneId}`, async () => {
              const r = await submitSale(sale!.saleId, signed!);
              setResult(r);
              note(`✓ ${r.status}: ${r.stoneId} (${r.nfts.join(", ")}), ${r.transactionId}`);
            })
          }
        >
          Submit the sale
        </button>
        {result && (
          <p>
            {result.status}:{" "}
            <a href={hashscanTxUrl(result.transactionId)} target="_blank" rel="noreferrer">
              {result.transactionId} on HashScan
            </a>
          </p>
        )}
      </section>

      <section style={box}>
        <h2>Log</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{log.join("\n")}</pre>
      </section>
    </div>
  );
}
