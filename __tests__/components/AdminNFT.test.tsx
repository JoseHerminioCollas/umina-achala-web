/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../frontend/src/i18n";
import AdminNFT from "../../frontend/src/components/AdminNFT";

describe("AdminNFT login form", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => jest.restoreAllMocks());

  it("shows the demo alert on submit", async () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<MemoryRouter><AdminNFT /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText("Username"), "admin");
    await userEvent.type(screen.getByLabelText("Password"), "s3cret");
    await userEvent.click(screen.getByRole("button", { name: "Log In" }));
    expect(alert).toHaveBeenCalledWith("Admin login is for demonstration only.");
  });

  it("does not log the submitted credentials (#77)", async () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    const debug = jest.spyOn(console, "debug").mockImplementation(() => {});
    render(<MemoryRouter><AdminNFT /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText("Username"), "admin");
    await userEvent.type(screen.getByLabelText("Password"), "s3cret");
    await userEvent.click(screen.getByRole("button", { name: "Log In" }));
    [log, info, debug].forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });

  it("masks the password field", () => {
    render(<MemoryRouter><AdminNFT /></MemoryRouter>);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });
});
