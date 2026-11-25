/** @jest-environment jsdom */
import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../frontend/src/i18n";
import WalletButton, { shortAccount } from "../../frontend/src/components/WalletButton";
import {
  ConnectCancelled,
  WalletProvider,
  useWallet,
  type WalletAccount,
  type WalletModule,
} from "../../frontend/src/wallet/WalletContext";

const buyer: WalletAccount = { accountId: "0.0.11389082", network: "testnet" };
const KEPT = "ua.wallet.connected";
// the dialog waits about a second for the browser extension to answer
const SLOW = { timeout: 3000 };

/** The wallet code's surface the site uses, with nothing real behind it. */
function fakeWallet(over: Partial<Record<keyof WalletModule, unknown>> = {}) {
  const w = {
    getConnector: jest.fn().mockResolvedValue({}),
    availableExtensions: jest.fn().mockResolvedValue([{ id: "hp", name: "HashPack" }]),
    connect: jest.fn().mockResolvedValue(buyer),
    disconnect: jest.fn().mockResolvedValue(undefined),
    currentAccount: jest.fn().mockResolvedValue(null),
    walletAppName: jest.fn().mockResolvedValue(null),
    walletKind: jest.fn().mockResolvedValue("extension"),
    openWallet: jest.fn(),
    signTransaction: jest.fn(),
    ...over,
  };
  const load = jest.fn().mockResolvedValue(w as unknown as WalletModule);
  return { w, load };
}

function renderButton(load: () => Promise<WalletModule>, extra?: React.ReactNode) {
  return render(
    <WalletProvider load={load}>
      <WalletButton />
      {extra}
    </WalletProvider>,
  );
}

describe("WalletButton", () => {
  beforeEach(() => localStorage.clear());

  it("shortens an account ID for the header", () => {
    expect(shortAccount("0.0.11389082")).toBe("0.0.113…082");
    expect(shortAccount("0.0.42")).toBe("0.0.42");
  });

  it("does not load the wallet code on a plain page load", () => {
    const { load } = fakeWallet();
    renderButton(load);
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
    expect(load).not.toHaveBeenCalled();
  });

  it("connects with the HashPack extension and shows the account", async () => {
    const { w, load } = fakeWallet();
    renderButton(load);
    await userEvent.click(screen.getByRole("button", { name: "Connect wallet" }));
    expect(screen.getByRole("dialog", { name: "Connect your wallet" })).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "HashPack (browser extension)" }, SLOW));
    expect(w.connect).toHaveBeenCalledWith("hp");
    expect(await screen.findByText("0.0.113…082")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(KEPT)).toBe("1");
  });

  it("offers the QR code when no extension is found, and a link to get HashPack", async () => {
    const { w, load } = fakeWallet({ availableExtensions: jest.fn().mockResolvedValue([]) });
    renderButton(load);
    await userEvent.click(screen.getByRole("button", { name: "Connect wallet" }));
    const qr = await screen.findByRole("button", { name: "HashPack on your phone (QR code)" }, SLOW);
    expect(screen.getByText(/No HashPack browser extension was found/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get HashPack" })).toHaveAttribute("href", "https://www.hashpack.app/download");
    await userEvent.click(qr);
    expect(w.connect).toHaveBeenCalledWith(undefined);
  });

  it("refuses an account on another network and disconnects it", async () => {
    const { w, load } = fakeWallet({ connect: jest.fn().mockResolvedValue({ ...buyer, network: "mainnet" }) });
    renderButton(load);
    await userEvent.click(screen.getByRole("button", { name: "Connect wallet" }));
    await userEvent.click(await screen.findByRole("button", { name: "HashPack (browser extension)" }, SLOW));
    expect(await screen.findByRole("alert")).toHaveTextContent("switch HashPack to testnet");
    expect(w.disconnect).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
  });

  it("says so when the connection is cancelled", async () => {
    const { load } = fakeWallet({ connect: jest.fn().mockRejectedValue(new Error("User rejected pairing")) });
    renderButton(load);
    await userEvent.click(screen.getByRole("button", { name: "Connect wallet" }));
    await userEvent.click(await screen.findByRole("button", { name: "HashPack (browser extension)" }, SLOW));
    expect(await screen.findByRole("alert")).toHaveTextContent("The connection was cancelled.");
  });

  it("restores a kept connection on the next visit", async () => {
    localStorage.setItem(KEPT, "1");
    const { load } = fakeWallet({ currentAccount: jest.fn().mockResolvedValue(buyer) });
    renderButton(load);
    expect(await screen.findByText("0.0.113…082")).toBeInTheDocument();
  });

  it("forgets a kept connection that did not come back", async () => {
    localStorage.setItem(KEPT, "1");
    const { load } = fakeWallet();
    renderButton(load);
    expect(await screen.findByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
    expect(localStorage.getItem(KEPT)).toBeNull();
  });

  it("disconnects", async () => {
    localStorage.setItem(KEPT, "1");
    const { w, load } = fakeWallet({ currentAccount: jest.fn().mockResolvedValue(buyer) });
    renderButton(load);
    await userEvent.click(await screen.findByRole("button", { name: "Disconnect" }));
    expect(w.disconnect).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
    expect(localStorage.getItem(KEPT)).toBeNull();
  });

  it("requireAccount opens the dialog and rejects when it is closed with Escape", async () => {
    const { load } = fakeWallet();
    let asked: Promise<WalletAccount> | undefined;
    const Asker = () => {
      const { requireAccount } = useWallet();
      return <button onClick={() => (asked = requireAccount())}>Buy</button>;
    };
    renderButton(load, <Asker />);
    await userEvent.click(screen.getByRole("button", { name: "Buy" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(asked).rejects.toBeInstanceOf(ConnectCancelled);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("requireAccount resolves with the account once connected", async () => {
    const { load } = fakeWallet();
    let asked: Promise<WalletAccount> | undefined;
    const Asker = () => {
      const { requireAccount } = useWallet();
      return <button onClick={() => (asked = requireAccount())}>Buy</button>;
    };
    renderButton(load, <Asker />);
    await userEvent.click(screen.getByRole("button", { name: "Buy" }));
    await userEvent.click(await screen.findByRole("button", { name: "HashPack (browser extension)" }, SLOW));
    await act(async () => {
      await expect(asked).resolves.toEqual(buyer);
    });
  });
});
