import { describe, expect, it, vi, beforeEach } from 'vitest';

const httpRequestMock = vi.fn();
const resolveAssetUrlMock = vi.fn((path: string) => `RESOLVED:${path}`);

vi.mock('@/services/http/client', () => ({
  httpRequest: (...args: unknown[]) => httpRequestMock(...args),
  resolveAssetUrl: (path: string) => resolveAssetUrlMock(path),
}));

import { getJob, listJobs } from '@/features/processing/api/processing.api';

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
});

