import { describe, expect, it, vi } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  it('écrit une ligne JSON structurée sur le bon canal', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logger.info('contact.message', { from: 'camille@example.com' });

    const [line] = info.mock.calls[0] as [string];
    expect(JSON.parse(line)).toMatchObject({
      level: 'info',
      event: 'contact.message',
      from: 'camille@example.com',
    });
  });

  it('route les avertissements et les erreurs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logger.warn('quota.proche');
    logger.error('contact.echec');

    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
  });
});
