import * as Sentry from "@sentry/node";

const originalConsole = {...console};

export function logger(config: { dsn: string, isLocal: boolean, environment: string }) {
    // if (config.isLocal) {
    //     return originalConsole;
    // }

    Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        attachStacktrace: true,
        tracesSampleRate: 1.0,
    });

    return {
        ...console,
        error() {
            const args = [...arguments];
            let messages: string[] = [];
            let message = "";
            let error: null | { message: string } = null;
            args.map((arg) => {
                if (typeof arg === 'object' && arg.hasOwnProperty('message') && arg.hasOwnProperty('stack')) {
                    error = arg;
                    messages.push(arg.message);
                } else if (typeof arg === 'string') {
                    messages.push(arg);
                } else {
                    messages.push(JSON.stringify(arg));
                }
            })
            message = messages.join(", ");
            if (error === null) {
                error = new Error(message);
            } else {
                // @ts-ignore
                error["message"] = message;
            }
            originalConsole.error("[SentryError]", ...arguments);
            Sentry.captureException(error);
        },
    }
}