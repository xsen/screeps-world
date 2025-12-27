interface CacheEntry {
  value: any;
  validUntil: number;
}

export const memoryCache = {
  get<T>(key: string): T | null {
    if (!Memory.cache) {
      return null;
    }

    const entry = Memory.cache[key] as CacheEntry | undefined;
    if (!entry) {
      return null;
    }

    if (entry.validUntil && Game.time > entry.validUntil) {
      delete Memory.cache[key];
      return null;
    }

    return entry.value as T;
  },

  set<T>(key: string, value: T, ticksToLive: number): void {
    if (!Memory.cache) {
      Memory.cache = {};
    }
    Memory.cache[key] = {
      value: value,
      validUntil: Game.time + ticksToLive,
    };
  },

  forever<T>(key: string, value: T): void {
    if (!Memory.cache) {
      Memory.cache = {};
    }
    Memory.cache[key] = {
      value: value,
      // No validUntil means it lives forever (or until manually cleared)
    };
  },

  clear(key: string): void {
    if (Memory.cache) {
      delete Memory.cache[key];
    }
  }
};
