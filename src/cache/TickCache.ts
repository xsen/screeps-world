interface TickCacheContainer {
  cache: { [key: string]: any };
  lastTick: number;
}

const getCacheContainer = (): TickCacheContainer => {
  const g = global as any;
  if (g.tickCache === undefined) {
    g.tickCache = { cache: {}, lastTick: 0 };
  }
  return g.tickCache;
};

const ensureTick = (): void => {
  const container = getCacheContainer();
  if (Game.time !== container.lastTick) {
    container.lastTick = Game.time;
    container.cache = {};
  }
};

export const tickCache = {
  get<T>(key: string, calculate: () => T): T {
    ensureTick();
    const container = getCacheContainer();
    if (container.cache[key] === undefined) {
      container.cache[key] = calculate();
    }
    return container.cache[key];
  },

  clear(key: string): void {
    ensureTick();
    const container = getCacheContainer();
    delete container.cache[key];
  },

  reset(): void {
    const container = getCacheContainer();
    container.cache = {};
    container.lastTick = 0; // Force reset on next get
  }
};
