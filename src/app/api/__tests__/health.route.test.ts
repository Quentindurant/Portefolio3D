// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { GET } from '../health/route';

describe('GET /api/health', () => {
  it('répond une sonde exploitable par la CI et PM2', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    await expect(response.json()).resolves.toMatchObject({ status: 'ok' });
  });
});
