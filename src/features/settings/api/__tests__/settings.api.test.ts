import { describe, expect, it, vi, beforeEach } from 'vitest';

const httpRequestMock = vi.fn();

vi.mock('@/services/http/client', () => ({
  httpRequest: (...args: unknown[]) => httpRequestMock(...args),
}));

import { getProcessingSettings, getProcessingSettingsOptions, updateProcessingSettings } from '@/features/settings/api/settings.api';

describe('settings.api', () => {
  beforeEach(() => {
    httpRequestMock.mockReset();
  });

  it('calls processing/settings/', async () => {
    httpRequestMock.mockResolvedValueOnce({ ocr_mode: 'vision' });
    await getProcessingSettings();
    expect(httpRequestMock).toHaveBeenCalledWith('processing/settings/');
  });

  it('calls processing/settings/options/', async () => {
    httpRequestMock.mockResolvedValueOnce({ ocr_modes: ['vision'] });
    await getProcessingSettingsOptions();
    expect(httpRequestMock).toHaveBeenCalledWith('processing/settings/options/');
  });

  it('PATCHes update payload as json', async () => {
    httpRequestMock.mockResolvedValueOnce({ ocr_mode: 'vision' });
    const payload: Record<string, unknown> = { ocr_mode: 'auto', assistant_model: 'gemma4:e2b' };
    await updateProcessingSettings(payload);
    const [, init] = httpRequestMock.mock.calls[0];
    expect(httpRequestMock.mock.calls[0][0]).toBe('processing/settings/');
    expect(init).toMatchObject({ method: 'PATCH' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(init.body).toBe(JSON.stringify({ ocr_mode: 'auto', assistant_model: 'gemma4:e2b' }));
  });
});
