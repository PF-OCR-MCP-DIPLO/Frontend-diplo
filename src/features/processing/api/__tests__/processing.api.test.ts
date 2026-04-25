import { HttpError } from '@/services/http/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpRequestMock = vi.fn();
const resolveAssetUrlMock = vi.fn((path: string) => `RESOLVED:${path}`);

vi.mock('@/services/http/client', () => ({
  HttpError: class extends Error {
    status: number;
    code?: string;
    details?: unknown;

    constructor(status: number, message: string, extras?: { code?: string; details?: unknown }) {
      super(message);
      this.status = status;
      this.code = extras?.code;
      this.details = extras?.details;
    }
  },
  httpRequest: (...args: unknown[]) => httpRequestMock(...args),
  resolveAssetUrl: (path: string) => resolveAssetUrlMock(path),
}));

import { deleteJob, getJob, listJobs, processJob, saveJobCorrections } from '@/features/processing/api/processing.api';

describe('processing.api', () => {
  beforeEach(() => {
    httpRequestMock.mockReset();
    resolveAssetUrlMock.mockClear();
  });

  it('lists jobs', async () => {
    httpRequestMock.mockResolvedValueOnce([]);
    await listJobs();
    expect(httpRequestMock).toHaveBeenCalledWith('jobs/');
  });

  it('normalizes asset urls on job detail', async () => {
    httpRequestMock.mockResolvedValueOnce({
      id: 1,
      original_filename: 'file.docx',
      status: 'uploaded',
      source_docx: '/media/doc.docx',
      excel_file: '/media/out.xlsx',
      total_images: 1,
      total_records: 0,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [
        {
          id: 10,
          sequence_index: 1,
          source_name: 'image1.png',
          content_hash: 'x',
          ocr_status: 'pending',
          ocr_provider: 'ollama',
          ocr_raw_text: '',
          error_message: '',
          image_file: '/media/image1.png',
          deposits: [],
          created_at: '2026-04-21T00:00:00Z',
          updated_at: '2026-04-21T00:00:00Z',
        },
      ],
    });

    const job = await getJob(1);

    expect(job.source_docx).toBe('RESOLVED:/media/doc.docx');
    expect(job.excel_file).toBe('RESOLVED:/media/out.xlsx');
    expect(job.source_images[0].image_file).toBe('RESOLVED:/media/image1.png');
  });

  it('normalizes partial job detail with safe arrays and null export', async () => {
    httpRequestMock.mockResolvedValueOnce({
      id: 2,
      original_filename: 'partial.docx',
      source_images: undefined,
      excel_file: null,
    });

    const job = await getJob(2);

    expect(job.status).toBe('uploaded');
    expect(job.source_images).toEqual([]);
    expect(job.excel_file).toBeNull();
    expect(job.provider_config_snapshot).toEqual({});
  });

  it('sends process requests and accepts idempotent 200 responses', async () => {
    httpRequestMock.mockResolvedValueOnce({
      id: 7,
      original_filename: 'done.docx',
      status: 'completed',
      source_docx: '',
      excel_file: null,
      total_images: 1,
      total_records: 3,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });

    const job = await processJob(7);

    expect(httpRequestMock).toHaveBeenCalledWith('jobs/7/process/', { method: 'POST' });
    expect(job.status).toBe('completed');
  });

  it('propagates process conflicts from the backend', async () => {
    httpRequestMock.mockRejectedValueOnce(new HttpError(409, 'Esta ejecución ya se encuentra en procesamiento.', { code: 'job_already_processing' }));

    await expect(processJob(7)).rejects.toMatchObject({
      status: 409,
      code: 'job_already_processing',
    });
  });

  it('sends bulk correction payload to the dedicated endpoint', async () => {
    httpRequestMock.mockResolvedValueOnce({
      id: 1,
      original_filename: 'file.docx',
      status: 'completed',
      source_docx: '',
      excel_file: null,
      total_images: 1,
      total_records: 1,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });

    await saveJobCorrections(1, {
      items: [
        {
          id: 99,
          fecha_consignacion: '22/04/2026',
          hora_consignacion: '15:45',
          referencia: 'REF999',
          valor: '175000',
        },
      ],
    });

    expect(httpRequestMock).toHaveBeenCalledWith('jobs/1/deposits/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            id: 99,
            fecha_consignacion: '22/04/2026',
            hora_consignacion: '15:45',
            referencia: 'REF999',
            valor: '175000',
          },
        ],
      }),
    });
  });

  it('deletes jobs with the dedicated endpoint and supports 204 responses', async () => {
    httpRequestMock.mockResolvedValueOnce(undefined);

    await expect(deleteJob(12)).resolves.toBeUndefined();
    expect(httpRequestMock).toHaveBeenCalledWith('jobs/12/', { method: 'DELETE' });
  });

  it('propagates delete errors without removing the job client-side', async () => {
    httpRequestMock.mockRejectedValueOnce(new HttpError(409, 'No puedes borrar una ejecución mientras sigue procesando.', { code: 'job_delete_conflict' }));

    await expect(deleteJob(12)).rejects.toMatchObject({
      status: 409,
      code: 'job_delete_conflict',
    });
  });
});
