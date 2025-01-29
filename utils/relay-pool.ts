import { SimplePool, Event, Filter } from "nostr-tools";
import { logger } from "./logger";

class LoggingPool {
  private pool: SimplePool;

  constructor() {
    this.pool = new SimplePool();
  }

  async ensureRelay(url: string, params?: { connectionTimeout?: number }) {
    logger.logWebsocketMessage("ensureRelay", { url, params });
    return this.pool.ensureRelay(url, params);
  }

  close(relays: string[]) {
    logger.logWebsocketMessage("close", { relays });
    this.pool.close(relays);
  }

  subscribeMany(
    relays: string[],
    filters: Filter[],
    params: {
      onevent?: (event: Event) => void;
      oneose?: () => void;
      onclose?: (reasons: string[]) => void;
      maxWait?: number;
      alreadyHaveEvent?: (id: string) => boolean;
      id?: string;
    },
  ) {
    logger.logWebsocketMessage("subscribeMany", { filters, params });
    return this.pool.subscribeMany(relays, filters, {
      ...params,
      onevent: (event) => {
        logger.logNostrEvent("subscribeMany:event", event);
        params.onevent?.(event);
      },
      oneose: () => {
        logger.logWebsocketMessage("subscribeMany:eose");
        params.oneose?.();
      },
      onclose: (reasons) => {
        logger.logWebsocketMessage("subscribeMany:close", { reasons });
        params.onclose?.(reasons);
      },
    });
  }

  async querySync(
    relays: string[],
    filter: Filter,
    params?: { id?: string; maxWait?: number },
  ): Promise<Event[]> {
    logger.logWebsocketMessage("querySync", { filter, params });
    const results = await this.pool.querySync(relays, filter, params);
    logger.logWebsocketMessage("querySync:results", { count: results.length });
    return results;
  }

  async get(
    relays: string[],
    filter: Filter,
    params?: { id?: string; maxWait?: number },
  ): Promise<Event | null> {
    logger.logWebsocketMessage("get", { filter, params });
    const result = await this.pool.get(relays, filter, params);
    result
      ? logger.logNostrEvent("get:result", result)
      : logger.logWebsocketMessage("get:result", { result: "event not found" });
    return result;
  }

  publish(relays: string[], event: Event): Promise<string>[] {
    logger.logNostrEvent("publish", event);
    const promises = this.pool.publish(relays, event);
    Promise.all(promises).then(
      (results) => logger.logWebsocketMessage("publish:complete", { results }),
      (error) => logger.logWebsocketMessage("publish:error", { error }),
    );
    return promises;
  }

  get seenOn() {
    return this.pool.seenOn;
  }

  get trackRelays() {
    return this.pool.trackRelays;
  }

  set trackRelays(value: boolean) {
    this.pool.trackRelays = value;
  }
}

export const pool = new LoggingPool();
