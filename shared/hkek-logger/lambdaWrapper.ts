// eslint-disable
const Sentry = require('@sentry/serverless');

export function wrapWithLogger(config: { dsn: string; environment: string; isLocal: boolean }, handler: Function) {
  if (config.isLocal) {
    // return originalConsole;
    config.environment = 'local';
  }

  Sentry.AWSLambda.init({
    dsn: config.dsn,
    environment: config.environment,
    attachStacktrace: true,
    tracesSampleRate: 1.0,
  });

  return Sentry.AWSLambda.wrapHandler(handler);
}
