import { utils } from "../../utils";
import { memoryCache } from "../../cache/MemoryCache.ts";
import { tickCache } from "../../cache/TickCache.ts";

const MINER_STATUS_HARVESTING = "harvesting";
const MINER_STATUS_TRANSFERRING = "transferring";

class MinerRole implements CreepRoleHandler {
  public name = "miner";

  public getSpawnPlans(room: Room): SpawnPlan[] {
    const sources = tickCache.get(`sources_${room.name}`, () => room.find(FIND_SOURCES));
    const spawner = tickCache.get(`spawner_${room.name}`, () => room.find(FIND_MY_SPAWNS)[0]);

    if (!spawner) return [];

    const plans: SpawnPlan[] = [];
    const minersInRoom = tickCache.get(`miners_${room.name}`, () =>
      Object.values(Game.creeps).filter(cr => cr.memory.role === this.name && cr.memory.room === room.name)
    );

    for (const source of sources) {
      const body = this.getBody(room);
      const pathKey = `path_${spawner.id}_${source.id}`;
      let travelTime = memoryCache.get<number>(pathKey);
      if (travelTime === null) {
        const path = spawner.pos.findPathTo(source.pos, { ignoreCreeps: true });
        travelTime = path.length;
        memoryCache.set(pathKey, travelTime, 5000);
      }
      const spawnTime = body.length * 3;
      const preSpawnTicks = travelTime + spawnTime + 10;

      const creepsForThisSource = minersInRoom.filter(cr => cr.memory.targetId === source.id);
      let limit = 1;
      if (creepsForThisSource.length === 1) {
        const miner = creepsForThisSource[0];
        if (miner.ticksToLive !== undefined && miner.ticksToLive <= preSpawnTicks) {
          limit = 2;
        }
      } else if (creepsForThisSource.length === 0) {
        limit = 1;
      }

      plans.push({
        handlerName: this.name,
        body: body,
        generation: 1,
        limit: limit,
        priority: 10,
        preSpawnTicks: preSpawnTicks,
        targetId: source.id,
      });
    }
    return plans;
  }

  private getBody(room: Room): SpawnCreepBody[] {
    if (room.energyCapacityAvailable >= 700) {
      return [{ count: 5, body: WORK }, { count: 1, body: CARRY }, { count: 3, body: MOVE }];
    }
    return [{ count: 2, body: WORK }, { count: 1, body: CARRY }, { count: 1, body: MOVE }];
  }

  public run(creep: Creep): void {
    // --- Self-assignment logic for manually spawned miners ---
    if (!creep.memory.targetId) {
      const assignedSource = this.findAndAssignSource(creep);
      if (!assignedSource) {
        creep.say("NO SRC");
        return;
      }
    }
    // ---

    this.switchState(creep);

    if (creep.getStatus() === MINER_STATUS_HARVESTING) {
      this.doHarvest(creep);
    } else {
      this.doTransfer(creep);
    }
  }

  private findAndAssignSource(creep: Creep): Source | null {
    const sources = creep.room.find(FIND_SOURCES);
    const minersInRoom = Object.values(Game.creeps).filter(
      (cr) => cr.memory.room === creep.room.name && cr.memory.role === this.name
    );

    const sourceAssignmentCounts: { [sourceId: string]: number } = {};
    for (const source of sources) {
      sourceAssignmentCounts[source.id] = 0;
    }

    for (const minerCreep of minersInRoom) {
      if (minerCreep.memory.targetId && sourceAssignmentCounts[minerCreep.memory.targetId] !== undefined) {
        sourceAssignmentCounts[minerCreep.memory.targetId]++;
      }
    }

    let leastOccupiedSource: Source | null = null;
    let minCount = Infinity;

    for (const source of sources) {
      const count = sourceAssignmentCounts[source.id] || 0;
      if (count < minCount) {
        minCount = count;
        leastOccupiedSource = source;
      }
    }

    if (leastOccupiedSource) {
      creep.memory.targetId = leastOccupiedSource.id;
      return leastOccupiedSource;
    }

    return null;
  }

  private switchState(creep: Creep): void {
    if (creep.store.getFreeCapacity() === 0) {
      creep.setStatus(MINER_STATUS_TRANSFERRING);
    }
    if (creep.store.getUsedCapacity() === 0) {
      creep.setStatus(MINER_STATUS_HARVESTING);
    }
    if (!creep.getStatus()) {
      creep.setStatus(MINER_STATUS_HARVESTING);
    }
  }

  private doHarvest(creep: Creep): void {
    const source = creep.getCreepTarget<Source>();
    if (!source) {
      utils.log(`[${creep.name}] Error: Miner has no source assigned.`);
      return;
    }

    const harvestRes = creep.harvest(source);
    if (harvestRes == ERR_NOT_IN_RANGE) {
      creep.customMoveTo(source);
    }

    if (harvestRes == OK && Game.time % 2 == 0 && creep.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity() / 2) {
      const transferTarget = this.findTransferTarget(creep);
      if (transferTarget) {
        creep.transfer(transferTarget, RESOURCE_ENERGY);
      }
    }
  }

  private doTransfer(creep: Creep): void {
    const target = this.findTransferTarget(creep);
    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.customMoveTo(target);
      }
    } else {
      creep.drop(RESOURCE_ENERGY);
    }
  }

  private findTransferTarget(creep: Creep): StructureLink | StructureContainer | null {
    const structures = creep.pos.findInRange<StructureLink | StructureContainer>(FIND_STRUCTURES, 1, {
      filter: (s) =>
        (s.structureType === STRUCTURE_LINK || s.structureType === STRUCTURE_CONTAINER) &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
    });

    if (structures.length === 0) return null;

    const link = structures.find(s => s.structureType === STRUCTURE_LINK);
    if (link) return link as StructureLink;

    return structures[0] as StructureContainer;
  }
}

export const miner = new MinerRole();
