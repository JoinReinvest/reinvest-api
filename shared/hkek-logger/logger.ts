import * as Sentry from '@sentry/node';

const originalConsole = { ...console };

export function logger(config: { dsn: string; environment: string; isLocal: boolean }): console {
  if (config.isLocal) {
    // return originalConsole;
    config.environment = 'local';
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    attachStacktrace: true,
    tracesSampleRate: 1.0,
  });

  return {
    ...originalConsole,
    warn: function (...rest: unknown[]) {
      return originalConsole.warn('[Warning]', ...rest);
    },
    log: function (...rest: unknown[]) {
      return originalConsole.log('[Log]', ...rest);
    },
    debug: function (...rest: unknown[]) {
      return originalConsole.log('[Debug]', ...rest);
    },
    info: function (...rest: unknown[]) {
      return originalConsole.log('[Info]', ...rest);
    },
    error: function (...rest: unknown[]) {
      const args = [...rest];
      const messages: string[] = [];
      let message = '';
      let error: null | { message: string } = null;
      args.map(arg => {
        // eslint-disable-next-line no-prototype-builtins
        if (typeof arg === 'object' && arg.hasOwnProperty('message') && arg.hasOwnProperty('stack')) {
          error = arg;
          messages.push(arg.message);
        } else if (typeof arg === 'string') {
          messages.push(arg);
        } else {
          messages.push(JSON.stringify(arg));
        }
      });
      message = messages.join(', ');

      if (error === null) {
        error = new Error(message);
      } else {
        error['message'] = message;
      }

      originalConsole.error('[Error]', ...arguments);
      Sentry.captureException(error);
    },
  };
}
