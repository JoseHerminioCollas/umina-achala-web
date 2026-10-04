/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import "../../frontend/src/i18n";
import ComplianceDashboard from "../../frontend/src/components/ComplianceDashboard";

const search = () => screen.getByPlaceholderText(/Search by Stone ID/);
// rows minus the header row
const bodyRows = () => screen.getAllByRole("row").slice(1);

describe("ComplianceDashboard", () => {
  it("renders the title, column headers and all rows", () => {
    render(<MemoryRouter><ComplianceDashboard /></MemoryRouter>);
    expect(
      screen.getByRole("heading", { level: 1, name: /Compliance Dashboard/ }),
    ).toBeInTheDocument();
    ["Stone ID", "Permit Number", "Cut Type", "Tx ID", "Export Status", "Status", "Last Updated"].forEach(
      (h) => expect(screen.getByRole("columnheader", { name: h })).toBeInTheDocument(),
    );
    expect(bodyRows()).toHaveLength(3);
  });

  it("filters by stone ID", async () => {
    render(<MemoryRouter><ComplianceDashboard /></MemoryRouter>);
    await userEvent.type(search(), "ST-002");
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toHaveTextContent("ST-002");
  });

  it("filters by permit number and by transaction ID", async () => {
    render(<MemoryRouter><ComplianceDashboard /></MemoryRouter>);
    await userEvent.type(search(), "PER-789");
    expect(bodyRows()).toHaveLength(1);
    await userEvent.clear(search());
    await userEvent.type(search(), "0.0.12345");
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toHaveTextContent("ST-001");
  });

  it("filters by cut type regardless of case", async () => {
    render(<MemoryRouter><ComplianceDashboard /></MemoryRouter>);
    await userEvent.type(search(), "mounted");
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toHaveTextContent("ST-003");
  });

  it("shows no rows when nothing matches and all rows when cleared", async () => {
    render(<MemoryRouter><ComplianceDashboard /></MemoryRouter>);
    await userEvent.type(search(), "zzz");
    expect(screen.queryAllByRole("row").slice(1)).toHaveLength(0);
    await userEvent.clear(search());
    expect(bodyRows()).toHaveLength(3);
  });

  it("highlights restricted rows", () => {
    render(<MemoryRouter><ComplianceDashboard /></MemoryRouter>);
    const restricted = screen.getByText("ST-003").closest("tr");
    expect(restricted).toHaveClass("restrictedRow");
    expect(screen.getByText("ST-001").closest("tr")).not.toHaveClass("restrictedRow");
  });

  it("renders the audit trail from the translations", () => {
    render(<MemoryRouter><ComplianceDashboard /></MemoryRouter>);
    expect(screen.getByText("Stone registered → Permit issued")).toBeInTheDocument();
  });

  test.todo("search by stone ID, permit and Tx ID is case-insensitive (#78)");
});
