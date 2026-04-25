import { describe, expect, it, vi, beforeEach } from 'vitest';

const httpRequestMock = vi.fn();
const resolveAssetUrlMock = vi.fn((path: string) => `RESOLVED:${path}`);

vi.mock('@/services/http/client', () => ({
  httpRequest: (...args: unknown[]) => httpRequestMock(...args),
  resolveAssetUrl: (path: string) => resolveAssetUrlMock(path),
}));

import { getJob, listJobs, saveJobCorrections } from '@/features/processing/api/processing.api';

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
});
