/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../frontend/src/i18n";
import Pager from "../../frontend/src/components/Pager";

describe("Pager", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(<Pager page={1} totalPages={1} setPage={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when there are no pages", () => {
    const { container } = render(<Pager page={1} totalPages={0} setPage={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one button per page and marks the current page", () => {
    const { container } = render(<Pager page={2} totalPages={4} setPage={jest.fn()} />);
    ["1", "2", "3", "4"].forEach((n) =>
      expect(screen.getByRole("button", { name: n })).toBeInTheDocument(),
    );
    expect(container.querySelector(".activePage")).toHaveTextContent("2");
  });

  it("disables Previous on the first page", () => {
    render(<Pager page={1} totalPages={3} setPage={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("disables Next on the last page", () => {
    render(<Pager page={3} totalPages={3} setPage={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  });

  it("calls setPage with the neighbouring or chosen page", async () => {
    const setPage = jest.fn();
    render(<Pager page={2} totalPages={4} setPage={setPage} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(setPage).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(setPage).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole("button", { name: "4" }));
    expect(setPage).toHaveBeenLastCalledWith(4);
  });
});
