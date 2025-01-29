import { Event } from "nostr-tools";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogCategory = "http" | "websocket" | "general";

interface LogOptions {
  category: LogCategory;
  level?: LogLevel;
  metadata?: Record<string, any>;
}

class Logger {
  private enableLogging: boolean;

  constructor() {
    this.enableLogging = Boolean(
      process.env.EXPO_PUBLIC_ENABLE_RESPONSE_LOGGING ||
        process.env.NODE_ENV === "development",
    );
  }

  private formatMessage(message: string, options: LogOptions): string {
    const timestamp = new Date().toISOString();
    const level = options.level?.toUpperCase() || "INFO";
    const category = options.category.toUpperCase();
    return `[${timestamp}] [${level}] [${category}] ${message}`;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  log(message: string, options: LogOptions) {
    if (!this.enableLogging) return;

    const formattedMessage = this.formatMessage(message, options);

    if (options.metadata) {
      console.log(formattedMessage, options.metadata);
    } else {
      console.log(formattedMessage);
    }
  }

  // HTTP specific logging methods
  logHttpRequest(method: string, url: string, data?: any) {
    this.log(`${method.toUpperCase()} ${url}`, {
      category: "http",
      level: "info",
      metadata: data ? { body: data } : undefined,
    });
  }

  logHttpResponse(url: string, status: number, data: any, bytes?: number) {
    const metadata: Record<string, any> = { status, data };
    if (bytes) {
      metadata.size = this.formatBytes(bytes);
    }

    this.log(`Response ${url}`, {
      category: "http",
      level: status >= 400 ? "error" : "info",
      metadata,
    });
  }

  // Websocket specific logging methods
  logWebsocketMessage(method: string, data?: any) {
    this.log(`WS ${method}`, {
      category: "websocket",
      level: "info",
      metadata: data,
    });
  }

  logNostrEvent(method: string, event?: Event) {
    this.log(`Nostr ${method}`, {
      category: "websocket",
      level: "info",
      metadata: event
        ? {
            kind: event.kind,
            id: event.id,
            pubkey: event.pubkey,
          }
        : undefined,
    });
  }
}

export const logger = new Logger();
