import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AssistantChatProvider } from "@/features/assistant/hooks/AssistantChatContext";
import { ResultsView } from "@/features/processing/components/results/ResultsView";
import type {
  ConsignmentRow,
  PreviewImage,
} from "@/features/processing/types/processing.types";

const getJobLogsMock = vi.fn();
const reprocessDepositMock = vi.fn();

vi.mock("@/features/processing/api/processing.api", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/processing/api/processing.api")
  >("@/features/processing/api/processing.api");
  return {
    ...actual,
    getJobLogs: (...args: Parameters<typeof actual.getJobLogs>) =>
      getJobLogsMock(...args),
    reprocessDeposit: (...args: Parameters<typeof actual.reprocessDeposit>) =>
      reprocessDepositMock(...args),
  };
});

vi.mock("@/features/processing/components/results/ResultsPreviewPanel", () => ({
  ResultsPreviewPanel: ({
    onOpenImage,
  }: {
    onOpenImage: (image: PreviewImage) => void;
  }) => (
    <div>
      <p>Preview lateral</p>
      <button
        type="button"
        onClick={() =>
          onOpenImage({
            id: 1,
            url: "https://example.test/pagina-1.png",
            name: "pagina-1.png",
            status: "processed",
          })
        }
      >
        Abrir imagen completa
      </button>
    </div>
  ),
}));

const baseRows: ConsignmentRow[] = [
  {
    id: "1-10",
    depositId: 10,
    sourceImageId: 1,
    fecha: "2026-03-01",
    hora: "09:30",
    monto: "125000.00",
    referencia: "REF-001",
    sourceName: "pagina-1.png",
    estado: "error",
    errors: ["La fecha no corresponde al mes actual"],
  },
];

const baseImages: PreviewImage[] = [
  {
    id: 1,
    url: "https://example.test/pagina-1.png",
    name: "pagina-1.png",
    status: "processed",
  },
];

function renderResultsView(
  overrides: Partial<ComponentProps<typeof ResultsView>> = {},
) {
  const props: ComponentProps<typeof ResultsView> = {
    jobId: 42,
    fileName: "consignaciones.docx",
    sourceDocxUrl: "https://example.test/consignaciones.docx",
    sourceImages: baseImages,
    initialData: baseRows,
    status: "completed_with_errors",
    totalImages: 1,
    totalRecords: 1,
    errorMessage: "Hay hallazgos por revisar",
    excelUrl: "https://example.test/export.xlsx",
    isProcessing: false,
    isRefreshing: false,
    isExporting: false,
    isSavingCorrections: false,
    onProcess: vi.fn(),
    onReprocessFailed: vi.fn(),
    onRefresh: vi.fn(),
    onExport: vi.fn(),
    onSaveCorrections: vi.fn().mockResolvedValue(undefined),
    onOpenAssistant: vi.fn(),
    ...overrides,
  };

  return {
    props,
    ...render(
      <MemoryRouter initialEntries={["/results"]}>
        <AssistantChatProvider>
          <ResultsView {...props} />
        </AssistantChatProvider>
      </MemoryRouter>,
    ),
  };
}

describe("ResultsView", () => {
  beforeEach(() => {
    window.localStorage.clear();
    HTMLElement.prototype.scrollTo = vi.fn();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    getJobLogsMock.mockReset();
    reprocessDepositMock.mockReset();
    getJobLogsMock.mockResolvedValue([
      {
        id: 1,
        sequence_index: 1,
        stage: "ocr",
        provider: "ollama",
        model: "qwen2.5:7b",
        ocr_mode: "vision",
        notes: "OCR completo",
        raw_payload: {},
        raw_text: "",
        is_error: false,
        source_image_id: 1,
        created_at: "2026-04-25T00:00:00Z",
      },
    ]);
    reprocessDepositMock.mockResolvedValue(undefined);
  });

  it("renders the current result table, findings and primary actions with the dock closed by default", () => {
    renderResultsView();

    expect(screen.getAllByText("consignaciones.docx").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByRole("button", { name: /Reprocesar fallidos/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Actualizar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Exportar/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Descargar/i })).toHaveAttribute(
      "href",
      "https://example.test/export.xlsx",
    );
    expect(
      screen.getByRole("columnheader", { name: /Referencia/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("REF-001").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /1 hallazgos/i }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("results-dock-panel")).not.toBeInTheDocument();
  });

  it("opens the assistant from results", () => {
    const { props } = renderResultsView();

    fireEvent.click(
      screen.getAllByRole("button", { name: /Abrir asistente/i })[0],
    );
    expect(props.onOpenAssistant).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({ page: "results", jobId: 42 }),
      }),
    );
  });

  it("calls the failed-source reprocess action from the top bar", () => {
    const { props } = renderResultsView();

    fireEvent.click(
      screen.getByRole("button", { name: /Reprocesar fallidos/i }),
    );

    expect(props.onReprocessFailed).toHaveBeenCalledTimes(1);
  });

  it("renders safely with empty results and no source images", () => {
    renderResultsView({
      sourceImages: [],
      initialData: [],
      totalImages: 0,
      totalRecords: 0,
      errorMessage: "",
      excelUrl: null,
      status: "uploaded",
    });

    expect(screen.getAllByText("consignaciones.docx").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByRole("columnheader", { name: /Referencia/i }),
    ).toBeInTheDocument();
  });

  it("does not render processing progress inside the results top bar", () => {
    renderResultsView({
      status: "processing",
      isProcessing: true,
    });

    expect(screen.queryByText(/Procesando imagen/i)).not.toBeInTheDocument();
  });

  it("surfaces diagnostics access and slowest stage for partial failures", () => {
    renderResultsView({
      diagnosticsSummary: {
        ocr_calls: 2,
        llm_calls: 2,
        failed_images: 1,
        processed_images: 1,
        slowest_stage: "llm_structuring",
        slowest_source_image_id: 9,
        total_ocr_duration_ms: 100,
        total_llm_duration_ms: 1200,
        avg_ocr_duration_ms: 50,
        avg_llm_duration_ms: 600,
        polling_suspected: false,
        provider_suspected: true,
        stale_processing: false,
        last_event_at: "2026-04-25T00:00:00Z",
      },
    });

    expect(
      screen.getByText(/Etapa lenta: llm_structuring/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Diagnóstico/i }),
    ).toBeInTheDocument();
  });

  it("opens preview in exactly one main dock panel", async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole("button", { name: /Previsualizar/i }));

    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "preview",
    );
    expect(screen.getByTestId("results-dock-panel")).toHaveAttribute(
      "data-state",
      "open",
    );
    expect(screen.getAllByTestId("results-dock-panel")).toHaveLength(1);
    expect(screen.getByText("Preview lateral")).toBeInTheDocument();
  });

  it("keeps only one main dock panel active when switching from preview to logs", async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole("button", { name: /Previsualizar/i }));
    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "preview",
    );

    fireEvent.click(screen.getByRole("button", { name: /Diagnóstico/i }));

    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "logs",
    );
    expect(screen.queryByText("Preview lateral")).not.toBeInTheDocument();
    expect(screen.getByText("OCR completo")).toBeInTheDocument();
    expect(screen.getAllByTestId("results-dock-panel")).toHaveLength(1);
  });

  it("switches from issues to preview without rendering two overlay surfaces", async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole("button", { name: /1 hallazgos/i }));
    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "issues",
    );
    expect(
      await screen.findByText("Hay hallazgos por revisar"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Previsualizar/i }));

    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "preview",
    );
    expect(
      screen.queryByText("Hay hallazgos por revisar"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId("results-dock-panel")).toHaveLength(1);
  });

  it("opens field detail in the dock without creating an absolute conflicting aside", async () => {
    renderResultsView();

    fireEvent.focus(
      screen.getByRole("button", { name: /Editar Fecha de la fila REF-001/i }),
    );

    const dock = await screen.findByTestId("results-dock-panel");
    expect(dock).toHaveAttribute("data-panel", "field-detail");
    expect(dock.className).not.toContain("absolute inset-y-0 right-0 z-20");
    expect(screen.getAllByTestId("results-dock-panel")).toHaveLength(1);
    expect(screen.getByText(/Detalle de Fecha/i)).toBeInTheDocument();
  });

  it("allows opening field detail after issues without leaving the previous content covering the dock", async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole("button", { name: /1 hallazgos/i }));
    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "issues",
    );

    fireEvent.focus(
      screen.getByRole("button", { name: /Editar Fecha de la fila REF-001/i }),
    );

    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "field-detail",
    );
    expect(
      screen.queryByText("Hay hallazgos por revisar"),
    ).not.toBeInTheDocument();
  });

  it("minimizes and restores the dock while preserving the active mode", async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole("button", { name: /Previsualizar/i }));
    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "preview",
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Minimizar panel Preview/i }),
    );
    expect(screen.getByTestId("results-dock-panel")).toHaveAttribute(
      "data-state",
      "minimized",
    );
    expect(screen.queryByText("Preview lateral")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Restaurar panel Preview/i }),
    );
    expect(screen.getByTestId("results-dock-panel")).toHaveAttribute(
      "data-state",
      "open",
    );
    expect(screen.getByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "preview",
    );
    expect(screen.getByText("Preview lateral")).toBeInTheDocument();
  });

  it("clears the active panel when the user closes it", async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole("button", { name: /Previsualizar/i }));
    expect(await screen.findByTestId("results-dock-panel")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Cerrar panel Preview/i }),
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("results-dock-panel"),
      ).not.toBeInTheDocument();
    });
  });

  it("opens the fullscreen image preview and closes it when logs are opened", async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole("button", { name: /Previsualizar/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /Abrir imagen completa/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /pagina-1\.png/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Diagnóstico/i }));

    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "logs",
    );
    expect(
      screen.queryByRole("dialog", { name: /pagina-1\.png/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps assistant actions contextualized from field detail", async () => {
    const { props } = renderResultsView();

    fireEvent.focus(
      screen.getByRole("button", { name: /Editar Fecha de la fila REF-001/i }),
    );
    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "field-detail",
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Preguntar al asistente/i }),
    );

    expect(props.onOpenAssistant).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          page: "results",
          jobId: 42,
          selectedRowId: "1-10",
          selectedField: "fecha",
        }),
      }),
    );
  });

  it("handles reprocessing loading and refresh after success without breaking the UI", async () => {
    let resolveRequest: (() => void) | undefined;
    reprocessDepositMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { props } = renderResultsView();
    fireEvent.focus(
      screen.getByRole("button", { name: /Editar Fecha de la fila REF-001/i }),
    );
    expect(await screen.findByTestId("results-dock-panel")).toHaveAttribute(
      "data-panel",
      "field-detail",
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Reprocesar esta consignación/i }),
    );
    expect(
      screen.getByRole("button", { name: /Reprocesando…/i }),
    ).toBeDisabled();

    resolveRequest?.();

    await waitFor(() => {
      expect(props.onRefresh).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.getByRole("button", { name: /Reprocesar esta consignación/i }),
    ).toBeEnabled();
  });

  it("keeps export blocked when there are unsaved changes", async () => {
    renderResultsView();

    fireEvent.click(
      screen.getByRole("button", { name: /Editar Fecha de la fila REF-001/i }),
    );
    const input = screen.getByRole("textbox", {
      name: /Editar Fecha de la fila REF-001/i,
    });
    fireEvent.change(input, { target: { value: "2026-04-12" } });

    expect(screen.getByRole("button", { name: /Exportar/i })).toBeDisabled();
  });

  it("saves corrections with the updated rows after the refactor", async () => {
    const { props } = renderResultsView();

    fireEvent.click(
      screen.getByRole("button", { name: /Editar Fecha de la fila REF-001/i }),
    );
    const input = screen.getByRole("textbox", {
      name: /Editar Fecha de la fila REF-001/i,
    });
    fireEvent.change(input, { target: { value: "2026-04-12" } });

    fireEvent.click(screen.getByRole("button", { name: /^Guardar$/i }));

    await waitFor(() => {
      expect(props.onSaveCorrections).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "1-10",
          fecha: "2026-04-12",
        }),
      ]);
    });
  });
});
