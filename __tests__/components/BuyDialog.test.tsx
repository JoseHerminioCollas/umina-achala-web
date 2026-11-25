/** @jest-environment jsdom */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../frontend/src/i18n";
import BuyDialog from "../../frontend/src/components/BuyDialog";
import {
  WalletProvider,
  type WalletAccount,
  type WalletModule,
} from "../../frontend/src/wallet/WalletContext";
import { achala, umina } from "../fixtures/catalog";

const buyer: WalletAccount = { accountId: "0.0.11389082", network: "testnet" };
const TX_ID = "0.0.4631334@1795638934.109883093";

function fakeWallet(over: Partial<Record<keyof WalletModule, unknown>> = {}) {
  const w = {
    getConnector: jest.fn().mockResolvedValue({}),
    availableExtensions: jest.fn().mockResolvedValue([{ id: "hp", name: "HashPack" }]),
    connect: jest.fn().mockResolvedValue(buyer),
    disconnect: jest.fn().mockResolvedValue(undefined),
    currentAccount: jest.fn().mockResolvedValue(buyer),
    walletAppName: jest.fn().mockResolvedValue(null),
    walletKind: jest.fn().mockResolvedValue("extension"),
    openWallet: jest.fn(),
    signTransaction: jest.fn().mockResolvedValue("c2lnbmVk"),
    ...over,
  };
  return { w, load: jest.fn().mockResolvedValue(w as unknown as WalletModule) };
}

const prepared = {
  saleId: "11111111-2222-3333-4444-555555555555",
  transaction: "dHg=",
  transactionId: TX_ID,
  stoneId: umina.stone_id,
  price: { amount: "45", currency: "HBAR" },
  nfts: [`${umina.token_id}/${umina.serial}`],
};

type Answer = { status: number; body: unknown };
const ok = (body: unknown): Answer => ({ status: 200, body });
const fail = (status: number, code: string, extra: object = {}): Answer => ({
  status,
  body: { error: { code, message: code, ...extra } },
});

/** The sale backend: one answer for prepare, one for submit. */
function mockSaleApi(prepare: Answer, submit: Answer = ok({ status: "SUCCESS", transactionId: TX_ID, stoneId: umina.stone_id, nfts: prepared.nfts })) {
  const fetchMock = jest.fn(async (url: string) => {
    const a = url.endsWith("/sale/prepare") ? prepare : submit;
    return { ok: a.status < 400, status: a.status, json: async () => a.body } as Response;
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const inTwoMinutes = () => new Date(Date.now() + 120_000).toISOString();

function renderDialog(load: () => Promise<WalletModule>, item = umina) {
  const onSold = jest.fn();
  const onClose = jest.fn();
  render(
    <WalletProvider load={load}>
      <BuyDialog item={item} onClose={onClose} onSold={onSold} />
    </WalletProvider>,
  );
  return { onSold, onClose };
}

describe("BuyDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("ua.wallet.connected", "1"); // a kept connection: buyer
  });

  it("asks to confirm with the price and the paying account", async () => {
    const { load } = fakeWallet();
    renderDialog(load);
    expect(screen.getByRole("dialog", { name: "Buy Agate" })).toBeInTheDocument();
    expect(await screen.findByText("Paying from 0.0.11389082.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm and pay 45 HBAR" })).toBeInTheDocument();
  });

  it("prepares, signs and submits in one go after Confirm, then hides the item", async () => {
    const { w, load } = fakeWallet();
    const api = mockSaleApi(ok({ ...prepared, expiresAt: inTwoMinutes() }));
    const { onSold } = renderDialog(load);
    await userEvent.click(await screen.findByRole("button", { name: "Confirm and pay 45 HBAR" }));

    expect(await screen.findByText("Agate is now in your wallet.")).toBeInTheDocument();
    expect(JSON.parse(api.mock.calls[0][1].body)).toEqual({ token: "umina", serial: umina.serial, buyer: buyer.accountId });
    expect(w.signTransaction).toHaveBeenCalledWith(buyer.accountId, prepared.transaction);
    expect(JSON.parse(api.mock.calls[1][1].body)).toEqual({ saleId: prepared.saleId, transaction: "c2lnbmVk" });
    expect(screen.getByRole("link", { name: "View the transaction on HashScan" })).toHaveAttribute(
      "href",
      "https://hashscan.io/testnet/transaction/0.0.4631334-1795638934-109883093",
    );
    expect(screen.getByText(/refresh HashPack/)).toBeInTheDocument();
    expect(onSold).toHaveBeenCalledWith(umina);
  });

  it("tells a buyer paired by QR code to approve on their phone, with the time left", async () => {
    let approve: (s: string) => void = () => undefined;
    const { load } = fakeWallet({
      walletKind: jest.fn().mockResolvedValue("remote"),
      signTransaction: jest.fn(() => new Promise<string>((r) => (approve = r))),
    });
    mockSaleApi(ok({ ...prepared, expiresAt: inTwoMinutes() }));
    renderDialog(load);
    await userEvent.click(await screen.findByRole("button", { name: "Confirm and pay 45 HBAR" }));
    expect(await screen.findByText(/Open HashPack on your phone and approve the request/)).toBeInTheDocument();
    expect(screen.getByText(/seconds left to approve/)).toBeInTheDocument();
    approve("c2lnbmVk");
    expect(await screen.findByText("Agate is now in your wallet.")).toBeInTheDocument();
  });

  it("offers to open the HashPack app on a phone while waiting", async () => {
    const { w, load } = fakeWallet({
      walletKind: jest.fn().mockResolvedValue("app"),
      walletAppName: jest.fn().mockResolvedValue("HashPack"),
      signTransaction: jest.fn(() => new Promise<string>(() => undefined)),
    });
    mockSaleApi(ok({ ...prepared, expiresAt: inTwoMinutes() }));
    renderDialog(load);
    await userEvent.click(await screen.findByRole("button", { name: "Confirm and pay 45 HBAR" }));
    expect(await screen.findByText(/then come back to this page/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open HashPack" }));
    expect(w.openWallet).toHaveBeenCalled();
  });

  it("says when the purchase was declined in HashPack, and offers to try again", async () => {
    const { load } = fakeWallet({ signTransaction: jest.fn().mockRejectedValue({ message: "USER_REJECT" }) });
    mockSaleApi(ok({ ...prepared, expiresAt: inTwoMinutes() }));
    const { onSold } = renderDialog(load);
    await userEvent.click(await screen.findByRole("button", { name: "Confirm and pay 45 HBAR" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The purchase was declined in HashPack.");
    expect(screen.getByText("Nothing was charged and nothing moved.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(onSold).not.toHaveBeenCalled();
  });

  it("hides an item that is no longer for sale", async () => {
    const { load } = fakeWallet();
    mockSaleApi(fail(409, "not_available"));
    const { onSold } = renderDialog(load);
    await userEvent.click(await screen.findByRole("button", { name: "Confirm and pay 45 HBAR" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("This item is no longer for sale.");
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
    expect(onSold).toHaveBeenCalledWith(umina);
  });

  it("says when the account does not hold enough HBAR", async () => {
    const { load } = fakeWallet();
    mockSaleApi(ok({ ...prepared, expiresAt: inTwoMinutes() }), fail(502, "failed", { status: "INSUFFICIENT_PAYER_BALANCE" }));
    renderDialog(load);
    await userEvent.click(await screen.findByRole("button", { name: "Confirm and pay 45 HBAR" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("does not hold enough HBAR");
  });

  it("says when the time to approve ran out", async () => {
    const { load } = fakeWallet({ signTransaction: jest.fn(() => new Promise<string>(() => undefined)) });
    mockSaleApi(ok({ ...prepared, expiresAt: new Date(Date.now() + 1500).toISOString() }));
    renderDialog(load);
    await userEvent.click(await screen.findByRole("button", { name: "Confirm and pay 45 HBAR" }));
    expect(await screen.findByRole("alert", {}, { timeout: 4000 })).toHaveTextContent("The time to approve ran out.");
  });

  it("connects first when no wallet is connected, and goes back to Confirm when that is closed", async () => {
    localStorage.clear();
    const { load } = fakeWallet({ currentAccount: jest.fn().mockResolvedValue(null) });
    renderDialog(load);
    await userEvent.click(screen.getByRole("button", { name: "Connect wallet and pay 45 HBAR" }));
    expect(screen.getByRole("dialog", { name: "Connect your wallet" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Connect your wallet" })).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Connect wallet and pay 45 HBAR" })).toBeInTheDocument();
  });

  it("says that an Achala's stones move with it", () => {
    const { load } = fakeWallet();
    renderDialog(load, achala);
    expect(screen.getByText(/This piece includes 1 stone/)).toBeInTheDocument();
  });
});
