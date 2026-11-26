/** @jest-environment jsdom */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../frontend/src/i18n";
import TestnetGuide from "../../frontend/src/components/TestnetGuide";
import {
  ACHALA_TOKEN_ID,
  HASHPACK_DOWNLOAD_URL,
  HEDERA_FAUCET_URL,
  UMINA_TOKEN_ID,
} from "../../frontend/src/config";

const setup = () =>
  render(
    <MemoryRouter initialEntries={["/testnet"]}>
      <TestnetGuide />
    </MemoryRouter>,
  );

describe("How to buy on testnet (#137)", () => {
  beforeEach(() => i18n.changeLanguage("en"));

  it("says it is testnet, with no real value and nothing shipped", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("How to buy on testnet");
    expect(screen.getByText(/test HBAR, which has no value/)).toBeInTheDocument();
    expect(screen.getByText(/nothing is shipped/)).toBeInTheDocument();
    expect(document.title).toBe("How to buy on testnet | Umiña Achala");
  });

  it("lists the steps from HashPack to a purchase, in order", () => {
    setup();
    const steps = within(screen.getAllByRole("list")[0]).getAllByRole("heading", { level: 2 });
    expect(steps.map((h) => h.textContent)).toEqual([
      "Get HashPack",
      "Create a testnet account",
      "Get free test HBAR",
      "Let your account accept the NFTs",
      "Connect HashPack",
      "Buy",
    ]);
  });

  it("links HashPack and the faucet in a new tab, and gives the token IDs from the config", () => {
    setup();
    for (const [name, href] of [
      [/^Get HashPack/, HASHPACK_DOWNLOAD_URL],
      [/^Hedera faucet/, HEDERA_FAUCET_URL],
    ] as const) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
      expect(link).toHaveTextContent("(opens in a new tab)");
    }
    expect(screen.getByText(UMINA_TOKEN_ID)).toBeInTheDocument();
    expect(screen.getByText(ACHALA_TOKEN_ID)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the marketplace" })).toHaveAttribute("href", "/marketplace");
  });

  it("explains what each refusal means", () => {
    setup();
    for (const title of ["Declined in HashPack", "The time to approve ran out", "Not enough HBAR", "Someone is completing a purchase of this item"]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("is in Spanish too", async () => {
    await i18n.changeLanguage("es");
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Cómo comprar en testnet");
    expect(screen.getByText(/no se envía nada/)).toBeInTheDocument();
  });
});
