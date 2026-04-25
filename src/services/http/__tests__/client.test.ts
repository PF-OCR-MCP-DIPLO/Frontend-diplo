import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { HttpError, httpRequest, resolveAssetUrl } from '@/services/http/client';

describe('http client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolveAssetUrl keeps absolute urls', () => {
    expect(resolveAssetUrl('https://example.com/a')).toBe('https://example.com/a');
  });

  it('resolveAssetUrl handles relative, root, empty and null paths', () => {
    expect(resolveAssetUrl('media/a.png')).toBe('http://localhost:8000/api/media/a.png');
    expect(resolveAssetUrl('/media/a.png')).toBe('http://localhost:8000/media/a.png');
    expect(resolveAssetUrl('')).toBe('');
    expect(resolveAssetUrl(null)).toBe('');
  });

  it('httpRequest throws HttpError using backend error envelope', async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          code: 'validation_error',
          message: 'Solicitud invalida.',
          details: { ocr_mode: ['Campo requerido'] },
        },
      }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );

    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(response);

    await expect(httpRequest('processing/settings/', { method: 'PATCH' })).rejects.toMatchObject({
      name: 'HttpError',
      status: 400,
      code: 'validation_error',
      message: 'Solicitud invalida.',
    });
  });

  it('httpRequest falls back to first validation detail when message is missing', async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          code: 'validation_error',
          message: '',
          details: { ocr_mode: ['Campo requerido'] },
        },
      }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );

    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(response);

    try {
      await httpRequest('processing/settings/', { method: 'PATCH' });
      throw new Error('Expected httpRequest to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toMatchObject({ message: 'Campo requerido' });
    }
  });

  it('httpRequest reports invalid JSON responses clearly', async () => {
    const response = new Response('{bad json', { status: 200, headers: { 'content-type': 'application/json' } });
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(response);

    await expect(httpRequest('jobs/')).rejects.toMatchObject({
      name: 'HttpError',
      status: 200,
      code: 'invalid_json',
      message: 'Respuesta invalida del servidor',
    });
  });

  it('httpRequest handles non-json HTTP errors', async () => {
    const response = new Response('Service unavailable', { status: 503 });
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(response);

    await expect(httpRequest('jobs/')).rejects.toMatchObject({
      name: 'HttpError',
      status: 503,
      message: 'Service unavailable',
    });
  });
});
