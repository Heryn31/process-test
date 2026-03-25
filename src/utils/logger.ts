import { LogLevel, LogContext } from "../types/logger";

const log = (level: LogLevel, message: string, context: LogContext = {}) => {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  console.log(JSON.stringify(logEntry));
};

export const logger = {
  info: (msg: string, ctx?: LogContext) => log("info", msg, ctx),
  error: (msg: string, ctx?: LogContext) => log("error", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log("warn", msg, ctx),
};