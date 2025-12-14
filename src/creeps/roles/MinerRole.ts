import profiler from "screeps-profiler";
import { utils } from "../../utils";

const MINER_STATUS_HARVESTING = "harvesting";
const MINER_STATUS_TRANSFERRING = "transferring";

class MinerRole implements CreepRoleHandler {
  public name = "miner";
  public defaultMinBody: SpawnCreepBody[] = [
    { count: 1, body: WORK },
    { count: 1, body: MOVE },
  ];
  public defaultIsEmergency = true;
  public defaultPriority = 10;
  public defaultPreSpawnTicks = 100;

  public run(creep: Creep): void {
    this.switchState(creep);

    if (creep.getStatus() === MINER_STATUS_HARVESTING) {
      this.doHarvest(creep);
    } else {
      // MINER_STATUS_TRANSFERRING
      this.doTransfer(creep);
    }
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
    const source = getTargetSource(creep);

    if (source == null) {
      utils.log("Error miner: source not found for creep", creep.name);
      return;
    }

    const harvestRes = creep.harvest(source);
    if (harvestRes == ERR_NOT_IN_RANGE) {
      creep.customMoveTo(source);
    }

    // Try to transfer energy periodically to avoid getting full
    if (
      harvestRes == OK &&
      Game.time % 2 == 0 &&
      creep.store.getUsedCapacity(RESOURCE_ENERGY) >
        creep.store.getCapacity() / 2
    ) {
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
      // If no link or container, just drop the energy
      creep.drop(RESOURCE_ENERGY);
    }
  }

  private findTransferTarget(
    creep: Creep,
  ): StructureLink | StructureContainer | null {
    // Priority 1: Find a link within range 1
    const link = creep.pos.findInRange<StructureLink>(FIND_STRUCTURES, 1, {
      filter: (s) =>
        s.structureType === STRUCTURE_LINK &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
    })[0];

    if (link) {
      return link;
    }

    // Priority 2: Find a container within range 1
    const container = creep.pos.findInRange<StructureContainer>(
      FIND_STRUCTURES,
      1,
      {
        filter: (s) =>
          s.structureType === STRUCTURE_CONTAINER &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
      },
    )[0];

    if (container) {
      return container;
    }

    return null;
  }
}

const getTargetSource = (creep: Creep): Source | null => {
  if (creep.memory.targetId) {
    return Game.getObjectById<Source>(creep.memory.targetId);
  }

  const sources = creep.room.find(FIND_SOURCES);
  const minersInRoom = Object.values(Game.creeps).filter(
    (cr) =>
      cr.memory.room === creep.room.name &&
      cr.memory.role === creep.memory.role,
  );

  const sourceAssignmentCounts: { [sourceId: string]: number } = {};
  for (const source of sources) {
    sourceAssignmentCounts[source.id] = 0;
  }

  for (const minerCreep of minersInRoom) {
    if (
      minerCreep.memory.targetId &&
      sourceAssignmentCounts[minerCreep.memory.targetId] !== undefined
    ) {
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
};

export const miner = new MinerRole();
profiler.registerObject(miner, "Creep.Role.Miner");
