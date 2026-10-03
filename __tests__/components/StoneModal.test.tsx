/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../frontend/src/i18n";
import StoneModal from "../../frontend/src/components/StoneModal";
import { UminaFacade } from "../../frontend/src/data/UminaFacade";

const base = UminaFacade.fromJSON().getAll()[0];
const typeOf = (u: typeof base) =>
  u.attributes.find((a) => a.trait_type === "Stone Type")!.value;

const item = (over: Record<string, unknown> = {}) => ({ ...base, ...over }) as typeof base;

describe("StoneModal", () => {
  it("renders nothing when no stone is open", () => {
    const { container } = render(<StoneModal open={null} setOpen={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the stone type as the heading and the image", () => {
    render(<StoneModal open={base} setOpen={jest.fn()} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(typeOf(base));
    expect(screen.getByRole("img", { name: base.name })).toBeInTheDocument();
  });

  it("lists attributes but hides HS Code, Stone Type and empty values", () => {
    const open = item({
      attributes: [
        { trait_type: "Stone Type", value: "jade" },
        { trait_type: "HS Code", value: "7103" },
        { trait_type: "Stone Cut", value: "Step Cut" },
        { trait_type: "Mounted By", value: "" },
      ],
    });
    render(<StoneModal open={open} setOpen={jest.fn()} />);
    expect(screen.getByText("Stone Cut")).toBeInTheDocument();
    expect(screen.getByText("Step Cut")).toBeInTheDocument();
    expect(screen.queryByText("HS Code")).not.toBeInTheDocument();
    expect(screen.queryByText("Mounted By")).not.toBeInTheDocument();
    expect(screen.queryByText("Stone Type")).not.toBeInTheDocument();
  });

  it("closes from the × button", async () => {
    const setOpen = jest.fn();
    render(<StoneModal open={base} setOpen={setOpen} />);
    await userEvent.click(screen.getByRole("button", { name: "×" }));
    expect(setOpen).toHaveBeenCalledWith(null);
  });

  it("closes when the backdrop is clicked but not when the content is", async () => {
    const setOpen = jest.fn();
    const { container } = render(<StoneModal open={base} setOpen={setOpen} />);
    await userEvent.click(screen.getByRole("heading", { level: 2 }));
    expect(setOpen).not.toHaveBeenCalled();
    await userEvent.click(container.firstElementChild as Element);
    expect(setOpen).toHaveBeenCalledWith(null);
  });

  it("closes on Escape while open", () => {
    const setOpen = jest.fn();
    render(<StoneModal open={base} setOpen={setOpen} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(setOpen).toHaveBeenCalledWith(null);
  });

  it("ignores Escape when closed and other keys when open", () => {
    const setOpen = jest.fn();
    const { rerender } = render(<StoneModal open={null} setOpen={setOpen} />);
    fireEvent.keyDown(document, { key: "Escape" });
    rerender(<StoneModal open={base} setOpen={setOpen} />);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(setOpen).not.toHaveBeenCalled();
  });

  it("stops listening for Escape after unmounting", () => {
    const setOpen = jest.fn();
    const { unmount } = render(<StoneModal open={base} setOpen={setOpen} />);
    unmount();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(setOpen).not.toHaveBeenCalled();
  });

  it("links to the compliance HCS topic in a new tab when a topic exists", () => {
    const topic = "0.0.123456";
    const open = item({ properties: { ...base.properties, hcs_compliance_topic: topic } });
    render(<StoneModal open={open} setOpen={jest.fn()} />);
    const link = screen.getByRole("link", { name: "View Compliance HCS Topic" });
    expect(link.getAttribute("href")).toContain(`/topic/${topic}`);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("omits the compliance link when there is no topic", () => {
    const open = item({ properties: { ...base.properties, hcs_compliance_topic: "" } });
    render(<StoneModal open={open} setOpen={jest.fn()} />);
    expect(screen.queryByRole("link", { name: "View Compliance HCS Topic" })).not.toBeInTheDocument();
  });

  it("shows the HashScan token link only when tokenId and serialNumber are set", () => {
    const { rerender } = render(<StoneModal open={base} setOpen={jest.fn()} />);
    expect(screen.queryByRole("link", { name: "View Minted Token on HashScan" })).not.toBeInTheDocument();
    rerender(<StoneModal open={item({ tokenId: "0.0.555", serialNumber: 7 })} setOpen={jest.fn()} />);
    const link = screen.getByRole("link", { name: "View Minted Token on HashScan" });
    expect(link.getAttribute("href")).toContain("/token/0.0.555/nft/7");
  });
});
