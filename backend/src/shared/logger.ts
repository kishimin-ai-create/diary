export type LogMeta = Record<string, boolean | number | string | undefined>;

export interface AppLogger {
  error(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
}

/**
 * Logger used by tests and injected app instances that should stay silent.
 */
export const noopLogger: AppLogger = {
  error: () => {},
  info: () => {},
  warn: () => {},
};

/**
 * Logger used by the production backend so Render can capture runtime events.
 */
export const consoleLogger: AppLogger = {
  error: (message, meta) => {
    console.error(message, meta ?? {});
  },
  info: (message, meta) => {
    console.info(message, meta ?? {});
  },
  warn: (message, meta) => {
    console.warn(message, meta ?? {});
  },
};

/**
 * Converts an unknown thrown value into log-safe metadata.
 */
export function errorLogMeta(error: unknown): LogMeta {
  if (error instanceof Error) {
    return {
      errorMessage: error.message,
      errorName: error.name,
    };
  }

  return {
    errorMessage: "Unknown non-Error thrown",
    errorName: "UnknownError",
  };
}
