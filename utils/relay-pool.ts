import { SimplePool, Event, Filter } from "nostr-tools";

class LoggingPool {
  private pool: SimplePool;
  private enableLogging: boolean = false;

  constructor() {
    this.pool = new SimplePool();
    if (process.env.NODE_ENV === "development") {
      this.enableLogging = true;
    }
  }

  setLogging(enabled: boolean) {
    this.enableLogging = enabled;
  }

  private log(method: string, ...args: any[]) {
    if (this.enableLogging) {
      console.log(`[NostrPool] ${method}:`, ...args);
    }
  }

  async ensureRelay(url: string, params?: { connectionTimeout?: number }) {
    this.log("ensureRelay", { url, params });
    return this.pool.ensureRelay(url, params);
  }

  close(relays: string[]) {
    this.log("close", { relays });
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
    this.log("subscribeMany", { filters, params });
    return this.pool.subscribeMany(relays, filters, {
      ...params,
      onevent: (event) => {
        // this.log("subscribeMany:event", event);
        params.onevent?.(event);
      },
      oneose: () => {
        // this.log("subscribeMany:eose");
        params.oneose?.();
      },
      onclose: (reasons) => {
        // this.log("subscribeMany:close", reasons);
        params.onclose?.(reasons);
      },
    });
  }

  async querySync(
    relays: string[],
    filter: Filter,
    params?: { id?: string; maxWait?: number },
  ): Promise<Event[]> {
    this.log("querySync", filter.kinds, "authors:", filter.authors?.length, {
      params,
    });
    const results = await this.pool.querySync(relays, filter, params);
    this.log("querySync:results", results.length);
    return results;
  }

  async get(
    relays: string[],
    filter: Filter,
    params?: { id?: string; maxWait?: number },
  ): Promise<Event | null> {
    this.log("get", filter.kinds, "authors:", filter.authors?.length, params);
    const result = await this.pool.get(relays, filter, params);
    this.log("get:result", result?.kind, result?.id);
    return result;
  }

  publish(relays: string[], event: Event): Promise<string>[] {
    this.log("publish", { event });
    const promises = this.pool.publish(relays, event);
    Promise.all(promises).then(
      (results) => this.log("publish:complete", results),
      (error) => this.log("publish:error", error),
    );
    return promises;
  }

  // listConnectionStatus(): Map<string, boolean> {
  //   this.log("listConnectionStatus");
  //   const status = this.pool.listConnectionStatus();
  //   this.log("listConnectionStatus:result", Object.fromEntries(status));
  //   return status;
  // }

  // destroy() {
  //   this.log("destroy");
  //   this.pool.destroy();
  // }

  // Expose seenOn map from the underlying pool
  get seenOn() {
    return this.pool.seenOn;
  }

  // Expose trackRelays property
  get trackRelays() {
    return this.pool.trackRelays;
  }

  set trackRelays(value: boolean) {
    this.pool.trackRelays = value;
  }
}

export const pool = new LoggingPool();
