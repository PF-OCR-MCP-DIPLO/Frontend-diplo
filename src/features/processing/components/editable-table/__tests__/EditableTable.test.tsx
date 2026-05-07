import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { EditableTable } from "@/features/processing/components/editable-table/EditableTable";
import type { ResultsValidationMap } from "@/features/processing/components/results/results-validation";
import type { ConsignmentRow } from "@/features/processing/types/processing.types";

const rows: ConsignmentRow[] = [
  {
    id: "row-1",
    depositId: 1,
    sourceImageId: 1,
    fecha: "15/04/2026",
    hora: "09:30",
    monto: "50000",
    referencia: "REF001",
    sourceName: "image1.png",
    estado: "valid",
    errors: [],
  },
];

const validationMap: ResultsValidationMap = {
  fieldIssuesByRow: {},
  imageIssuesById: {},
  generalIssues: [],
};

describe("EditableTable", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders sticky headers with resize handles", () => {
    render(
      <EditableTable
        data={rows}
        validationMap={validationMap}
        onDataChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("columnheader", { name: /Referencia/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Redimensionar columna Referencia/i })).toBeInTheDocument();
  });

  it("persists column widths in localStorage while resizing", () => {
    render(
      <EditableTable
        data={rows}
        validationMap={validationMap}
        onDataChange={vi.fn()}
      />,
    );

    const handle = screen.getByRole("button", {
      name: /Redimensionar columna Referencia/i,
    });
    fireEvent.pointerDown(handle, { clientX: 100 });
    fireEvent.pointerMove(window, { clientX: 160 });
    fireEvent.pointerUp(window);

    expect(window.localStorage.getItem("diplo.results-table.column-widths.v1")).toContain("referencia");
  });
});
