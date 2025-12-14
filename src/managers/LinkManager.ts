import profiler from "screeps-profiler";

const CACHE_TTL = 1000;

export class LinkManager {
  private room: Room;
  private centralLink: StructureLink | undefined;
  private sourceLinks: StructureLink[];

  constructor(room: Room) {
    this.room = room;
    this.centralLink = undefined;
    this.sourceLinks = [];
  }

  public run(): void {
    if (!this.loadFromCache()) {
      this.scanAndCacheLinks();
    }

    if (!this.centralLink || this.sourceLinks.length === 0) {
      return;
    }

    this.transferEnergy();
  }

  private loadFromCache(): boolean {
    const cache = this.room.memory.linkCache;
    if (!cache || Game.time - cache.scanTime > CACHE_TTL) {
      return false; // Cache is old or doesn't exist
    }

    if (cache.centralLinkId) {
      const central = Game.getObjectById(cache.centralLinkId);
      if (!central) return false; // Link was destroyed
      this.centralLink = central;
    }

    for (const id of cache.sourceLinkIds) {
      const sourceLink = Game.getObjectById(id);
      if (!sourceLink) return false; // A link was destroyed
      this.sourceLinks.push(sourceLink);
    }

    return true; // Loaded successfully from cache
  }

  private scanAndCacheLinks(): void {
    this.centralLink = undefined;
    this.sourceLinks = [];

    const allLinks = this.room.find<StructureLink>(FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_LINK, my: true },
    });

    if (allLinks.length < 2 || !this.room.storage) {
      this.room.memory.linkCache = undefined; // Clear cache if not enough links or no storage
      return;
    }

    const newCache: NonNullable<RoomMemory["linkCache"]> = {
      sourceLinkIds: [],
      scanTime: Game.time,
    };

    for (const link of allLinks) {
      if (link.pos.inRangeTo(this.room.storage, 2)) {
        this.centralLink = link;
        newCache.centralLinkId = link.id;
      } else {
        this.sourceLinks.push(link);
        newCache.sourceLinkIds.push(link.id);
      }
    }

    this.room.memory.linkCache = newCache;
  }

  private transferEnergy(): void {
    if (!this.centralLink) return;

    for (const sourceLink of this.sourceLinks) {
      // Transfer if the source link is mostly full and the central link has space
      if (
        sourceLink.store.getUsedCapacity(RESOURCE_ENERGY) >
          sourceLink.store.getCapacity(RESOURCE_ENERGY) * 0.8 &&
        sourceLink.cooldown === 0
      ) {
        if (this.centralLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          sourceLink.transferEnergy(this.centralLink);
        }
      }
    }
  }
}

profiler.registerClass(LinkManager, "LinkManager");
