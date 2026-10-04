/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../frontend/src/i18n";
import Contact from "../../frontend/src/components/Contact";
import { CONTACT_FORM_URL } from "../../frontend/src/config";

const setup = () =>
  render(
    <MemoryRouter>
      <Contact />
    </MemoryRouter>,
  );

describe("Contact page (embedded Google Form)", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => jest.restoreAllMocks());

  it("explains what the form is for", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Contact Umiña Achala");
    expect(screen.getByText(/notified when the site launches/i)).toBeInTheDocument();
  });

  it("embeds the Google Form in the page", () => {
    setup();
    const frame = screen.getByTitle("Contact form");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("src", `${CONTACT_FORM_URL}?embedded=true`);
    expect(frame).toHaveAttribute("scrolling", "no"); // no scroll bar inside the page's own
  });

  it("also offers the form in a new tab", () => {
    setup();
    const link = screen.getByRole("link", { name: "Open the form in a new tab" });
    expect(link).toHaveAttribute("href", CONTACT_FORM_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("has a button that opens the form in a new tab (used on phones instead of the embed)", () => {
    setup();
    const button = screen.getByRole("link", { name: "Open the contact form" });
    expect(button).toHaveAttribute("href", CONTACT_FORM_URL);
    expect(button).toHaveAttribute("target", "_blank");
    expect(button).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("points to the privacy page and says Google Forms collects the data", () => {
    setup();
    expect(screen.getByText(/collected with Google Forms/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy & Cookies" })).toHaveAttribute("href", "/privacy");
  });

  it("is shown in Spanish", async () => {
    await i18n.changeLanguage("es");
    setup();
    expect(screen.getByTitle("Formulario de contacto")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir el formulario en una pestaña nueva" })).toHaveAttribute(
      "href",
      CONTACT_FORM_URL,
    );
    expect(screen.getByText(/se recoge con Google Forms/i)).toBeInTheDocument();
  });

  it("no longer has its own input fields (nothing to log, #77)", () => {
    setup();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send" })).not.toBeInTheDocument();
  });
});
