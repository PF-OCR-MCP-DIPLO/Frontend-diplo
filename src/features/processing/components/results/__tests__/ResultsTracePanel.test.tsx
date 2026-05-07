import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResultsTracePanel } from "@/features/processing/components/results/ResultsTracePanel";
import type { ApiProcessingTrace } from "@/features/processing/types/processing.api";

const trace: ApiProcessingTrace = {
  job_id: 7,
  status: "completed_with_errors",
  started_at: "2026-05-07T00:00:00Z",
  finished_at: "2026-05-07T00:00:03Z",
  duration_ms: 3000,
  summary: {
    total_images: 2,
    processed_images: 1,
    failed_images: 1,
    total_records: 4,
    terminal_status: true,
  },
  source_images: [
    {
      id: 10,
      sequence_index: 1,
      source_name: "image1.png",
      context_date: "01/04/2026",
      context_text: "01 ABRIL 2026",
      context_payload: {},
      explicit_ocr_date: "01/04/2026",
      final_date_used: "01/04/2026",
      final_date_source: "image_explicit",
      llm_candidates_count: 1,
      fallback_candidates_count: 0,
      rejected_candidates: [{ reason: "amount_looks_like_year" }],
      persisted_records: [{ referencia: "M08326455" }],
    },
  ],
  events: [
    {
      id: 1,
      timestamp: "2026-05-07T00:00:01Z",
      stage: "ocr",
      status: "completed",
      source_image_id: 10,
      sequence_index: 1,
      agent: "OCRAgent",
      provider: "ollama",
      model: "gemma",
      ocr_mode: "vision",
      attempt: 1,
      duration_ms: 120,
      input: { image_file: "image1.png" },
      output: { raw_text_preview: "Banco valor 1000" },
      decision: "selected OCR text",
      error: null,
      notes: "",
      raw_payload: {},
    },
    {
      id: 2,
      timestamp: "2026-05-07T00:00:02Z",
      stage: "llm_structuring",
      status: "failed",
      source_image_id: 11,
      sequence_index: 2,
      agent: "StructuringAgent",
      provider: "ollama",
      model: "qwen",
      ocr_mode: "vision",
      attempt: 1,
      duration_ms: 250,
      input: { ocr_text_preview: "texto" },
      output: {},
      decision: "stop source image",
      error: { class: "TimeoutError", message: "slow provider" },
      notes: "provider failed",
      raw_payload: {},
    },
  ],
};

describe("ResultsTracePanel", () => {
  it("renders summary and events by agent", () => {
    render(
      <ResultsTracePanel
        trace={trace}
        isLoading={false}
        error={null}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("Trazabilidad del proceso")).toBeInTheDocument();
    expect(screen.getByText("1/2 imágenes · 4 registros")).toBeInTheDocument();
    expect(screen.getByText("Resumen por imagen")).toBeInTheDocument();
    expect(screen.getByText(/Contexto 01\/04\/2026/)).toBeInTheDocument();
    expect(screen.getByText("OCRAgent · intento 1 · imagen 10")).toBeInTheDocument();
    expect(screen.getByText(/TimeoutError: slow provider/i)).toBeInTheDocument();
  });

  it("expands input and output JSON", () => {
    render(
      <ResultsTracePanel
        trace={trace}
        isLoading={false}
        error={null}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByText("ocr")[1]);

    expect(screen.getAllByText("Input").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/image1\.png/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Banco valor 1000/)).toBeInTheDocument();
  });

  it("filters by agent", () => {
    render(
      <ResultsTracePanel
        trace={trace}
        isLoading={false}
        error={null}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Filtrar por agente"), {
      target: { value: "StructuringAgent" },
    });

    expect(screen.queryByText("OCRAgent · intento 1 · imagen 10")).not.toBeInTheDocument();
    expect(screen.getByText("StructuringAgent · intento 1 · imagen 11")).toBeInTheDocument();
  });
});
