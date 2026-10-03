/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import i18n from "../../frontend/src/i18n";
import StoneModal from "../../frontend/src/components/StoneModal";
import { UminaFacade } from "../../frontend/src/data/UminaFacade";

const base = UminaFacade.fromJSON().getAll()[0];
const withTopic = {
  ...base,
  properties: { ...base.properties, hcs_compliance_topic: "0.0.123456" },
};

describe("StoneModal compliance link message (#83)", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => jest.restoreAllMocks());

  const link = () => screen.getByRole("link", { name: "View Compliance HCS Topic" });

  it("explains that there is no page because the site is not finished", () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<StoneModal open={withTopic} setOpen={jest.fn()} />);
    fireEvent.click(link());
    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert.mock.calls[0][0]).toMatch(/no compliance page/i);
    expect(alert.mock.calls[0][0]).toMatch(/not finished/i);
  });

  it("does not ask a question in the message", () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<StoneModal open={withTopic} setOpen={jest.fn()} />);
    fireEvent.click(link());
    expect(alert.mock.calls[0][0]).not.toContain("?");
  });

  it("does not open the link; OK only closes the message", () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<StoneModal open={withTopic} setOpen={jest.fn()} />);
    // fireEvent returns false when the default action was cancelled
    expect(fireEvent.click(link())).toBe(false);
  });

  it("shows the message in Spanish", async () => {
    await i18n.changeLanguage("es");
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<StoneModal open={withTopic} setOpen={jest.fn()} />);
    fireEvent.click(screen.getByRole("link", { name: "Ver Tema HCS de Cumplimiento" }));
    expect(alert.mock.calls[0][0]).toMatch(/no está terminado/i);
    expect(alert.mock.calls[0][0]).not.toContain("?");
  });

  it("does not show the message for the minted-token link", () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    const minted = { ...withTopic, tokenId: "0.0.555", serialNumber: 7 } as typeof withTopic;
    render(<StoneModal open={minted} setOpen={jest.fn()} />);
    fireEvent.click(screen.getByRole("link", { name: "View Minted Token on HashScan" }));
    expect(alert).not.toHaveBeenCalled();
  });
});
