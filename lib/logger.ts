type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private log(level: LogLevel, message: string, data?: unknown) {
    if (!this.isDev && level === "debug") return;
    const timestamp = new Date().toISOString();
    const prefix = `[Titan ${level.toUpperCase()}] ${timestamp}`;
    if (data !== undefined) {
      console[level === "debug" ? "log" : level](prefix, message, data);
    } else {
      console[level === "debug" ? "log" : level](prefix, message);
    }
  }

  debug(message: string, data?: unknown) {
    this.log("debug", message, data);
  }

  info(message: string, data?: unknown) {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown) {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown) {
    this.log("error", message, data);
  }
}

export const logger = new Logger();
