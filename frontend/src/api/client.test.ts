import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiError } from './client';

describe('API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws NETWORK_ERROR on fetch failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(apiClient('/test')).rejects.toThrow(ApiError);
    await expect(apiClient('/test')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('throws EMPTY_RESPONSE on empty 502', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('', { status: 502 }));
    await expect(apiClient('/test')).rejects.toThrow(ApiError);
  });

  it('throws INVALID_RESPONSE on non-JSON', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('<html>Error</html>', { status: 500 }));
    await expect(apiClient('/test')).rejects.toThrow(ApiError);
  });

  it('returns data on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { id: 1 } }), { status: 200 })
    );
    const result = await apiClient('/test');
    expect(result).toEqual({ id: 1 });
  });

  it('throws ApiError on API error response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }), { status: 404 })
    );
    await expect(apiClient('/test')).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
