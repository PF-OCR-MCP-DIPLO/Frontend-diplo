import { describe, expect, it } from 'vitest';
import { DEFAULT_PROCESSING_SETTINGS, normalizeSettings } from '@/features/settings/utils/settings-normalizers';

describe('normalizeSettings', () => {
  it('normalizes valid consignation period values safely', () => {
    const normalized = normalizeSettings({
      valid_consignation_month: '4' as unknown as number,
      valid_consignation_year: '2026' as unknown as number,
    });

    expect(normalized.valid_consignation_month).toBe(4);
    expect(normalized.valid_consignation_year).toBe(2026);
  });

  it('falls back to defaults for out of range valid consignation period values', () => {
    const normalized = normalizeSettings({
      valid_consignation_month: 13,
      valid_consignation_year: 1800,
    });

    expect(normalized.valid_consignation_month).toBe(DEFAULT_PROCESSING_SETTINGS.valid_consignation_month);
    expect(normalized.valid_consignation_year).toBe(DEFAULT_PROCESSING_SETTINGS.valid_consignation_year);
  });
});
