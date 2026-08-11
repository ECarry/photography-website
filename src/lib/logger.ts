type LogContext = Record<string, unknown>;

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

function write(level: "error" | "warn" | "info", message: string, context?: LogContext) {
  const payload = context
    ? Object.fromEntries(
        Object.entries(context).map(([key, value]) => [
          key,
          key === "error" ? normalizeError(value) : value,
        ]),
      )
    : undefined;

  console[level](message, payload);
}

export const logger = {
  error(message: string, error?: unknown, context?: LogContext) {
    write("error", message, {
      ...context,
      ...(error !== undefined ? { error } : {}),
    });
  },
  warn(message: string, context?: LogContext) {
    write("warn", message, context);
  },
  info(message: string, context?: LogContext) {
    write("info", message, context);
  },
};
