/**
 * Journalisation structurée.
 * Un point d'entrée unique évite les `console.log` éparpillés et permettra de
 * brancher un collecteur (pino, Loki) sans toucher au code métier.
 */
type Level = 'info' | 'warn' | 'error';

function write(level: Level, event: string, payload: Record<string, unknown>): void {
  const line = JSON.stringify({ level, event, at: new Date().toISOString(), ...payload });
  // eslint-disable-next-line no-console -- sortie standard lue par PM2
  if (level === 'info') console.info(line);
  else if (level === 'warn') console.warn(line);
  else console.error(line);
}

export const logger = {
  info: (event: string, payload: Record<string, unknown> = {}) => write('info', event, payload),
  warn: (event: string, payload: Record<string, unknown> = {}) => write('warn', event, payload),
  error: (event: string, payload: Record<string, unknown> = {}) => write('error', event, payload),
};
