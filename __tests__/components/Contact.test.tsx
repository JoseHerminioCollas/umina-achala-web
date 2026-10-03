/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "../../frontend/src/i18n";
import Contact from "../../frontend/src/components/Contact";

const fillAndSend = async () => {
  await userEvent.type(screen.getByLabelText("Name"), "Ana");
  await userEvent.type(screen.getByLabelText("Email"), "ana@example.com");
  await userEvent.type(screen.getByLabelText("Message"), "Hello");
  await userEvent.click(screen.getByRole("button", { name: "Send" }));
};

describe("Contact form", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => jest.restoreAllMocks());

  it("shows the demo alert on submit", async () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<Contact />);
    await fillAndSend();
    expect(alert).toHaveBeenCalledWith("Contact form is for demonstration only.");
  });

  it("does not log the submitted name, email or message (#77)", async () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    const debug = jest.spyOn(console, "debug").mockImplementation(() => {});
    render(<Contact />);
    await fillAndSend();
    [log, info, debug].forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });

  it("requires name, email and message", async () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<Contact />);
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(alert).not.toHaveBeenCalled(); // browser validation blocks the submit
  });
});
