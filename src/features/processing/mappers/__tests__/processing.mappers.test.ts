import { describe, expect, it } from 'vitest';
import type { ApiJobDetail, ApiJobListItem, ApiSourceImage } from '@/features/processing/types/processing.api';

import { mapJobListItemToPlaceholder, mapJobToConsignmentRows, mapJobToProcessedFile, mapSourceImagesToPreview } from '@/features/processing/mappers/processing.mappers';

describe('processing.mappers', () => {
  it('maps job detail to table rows with errors', () => {
    const job: ApiJobDetail = {
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
      source_images: [
        {
          id: 10,
          sequence_index: 1,
          source_name: 'image1.png',
          content_hash: 'x',
          ocr_status: 'failed',
          ocr_provider: 'ollama',
          ocr_raw_text: '',
          error_message: 'OCR falló',
          image_file: '',
          deposits: [
            {
              id: 99,
              sequence_index: 1,
              fecha_consignacion: '01/04/2026',
              hora_consignacion: '10:00',
              referencia: 'REF001',
              valor: '50000',
              is_current_month: true,
              observations: ['Fecha fuera del mes actual'],
              structured_payload: {},
              created_at: '2026-04-21T00:00:00Z',
            },
          ],
          created_at: '2026-04-21T00:00:00Z',
          updated_at: '2026-04-21T00:00:00Z',
        },
      ],
    };

    const rows = mapJobToConsignmentRows(job);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      depositId: 99,
      hora: '10:00',
      referencia: 'REF001',
      monto: '50000',
      sourceName: 'image1.png',
      estado: 'error',
    });
    expect(rows[0].errors).toEqual(['Fecha fuera del mes actual', 'OCR falló']);
  });

  it('maps list item to placeholder', () => {
    const listItem: ApiJobListItem = {
      id: 1,
      original_filename: 'file.docx',
      status: 'uploaded',
      total_images: 2,
      total_records: 0,
      started_at: null,
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
    };

    const placeholder = mapJobListItemToPlaceholder(listItem);

    expect(placeholder).toMatchObject({
      jobId: 1,
      name: 'file.docx',
      totalImages: 2,
      totalRecords: 0,
      sourceImages: [],
    });
  });

  it('maps job to processed file and computes display status', () => {
    const job: ApiJobDetail = {
      id: 1,
      original_filename: 'file.docx',
      status: 'completed',
      started_at: null,
      finished_at: null,
      source_docx: '',
      excel_file: null,
      total_images: 1,
      total_records: 0,
      error_message: '',
      provider_config_snapshot: {},
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    };

    const processed = mapJobToProcessedFile(job);

    expect(processed.displayStatus).toBe('success');
    expect(processed.jobId).toBe(1);
  });

  it('maps images to preview only when image_file exists', () => {
    const images: ApiSourceImage[] = [
      {
        id: 1,
        sequence_index: 1,
        source_name: 'a',
        content_hash: '',
        ocr_status: 'pending',
        ocr_provider: '',
        ocr_raw_text: '',
        error_message: '',
        image_file: '',
        deposits: [],
        created_at: '2026-04-21T00:00:00Z',
        updated_at: '2026-04-21T00:00:00Z',
      },
      {
        id: 2,
        sequence_index: 2,
        source_name: 'b',
        content_hash: '',
        ocr_status: 'processed',
        ocr_provider: '',
        ocr_raw_text: '',
        error_message: '',
        image_file: 'http://x/img.png',
        deposits: [],
        created_at: '2026-04-21T00:00:00Z',
        updated_at: '2026-04-21T00:00:00Z',
      },
    ];

    const previews = mapSourceImagesToPreview(images);
    expect(previews).toEqual([{ id: 2, url: 'http://x/img.png', name: 'b', status: 'processed' }]);
  });
});
