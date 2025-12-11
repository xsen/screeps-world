import profiler from "screeps-profiler";
import { utils } from "../../utils";

const MINER_STATUS_HARVESTING = "harvesting";
const MINER_STATUS_TRANSFERRING = "transferring";

class MinerRole implements CreepRoleHandler {
  public name = "miner";
  public defaultIsEmergency = false;
  public defaultMinBody: SpawnCreepBody[] = [
    { count: 1, body: WORK },
    { count: 1, body: MOVE },
  ];
  public defaultPriority = 10;
  public defaultPreSpawnTicks = 250;

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
      delete creep.memory.nearbyContainerId;
      creep.customMoveTo(source);
    }

    if (
      harvestRes == OK &&
      Game.time % 2 == 0 &&
      creep.store.getUsedCapacity(RESOURCE_ENERGY) > 25
    ) {
      const container = getNearbyContainer(creep);
      if (container) {
        creep.transfer(container, RESOURCE_ENERGY);
      }
    }
  }

  private doTransfer(creep: Creep): void {
    const container = creep.pos.findInRange(FIND_STRUCTURES, 5).find((s) => {
      return (
        s.structureType === STRUCTURE_CONTAINER &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) >
          creep.store.getUsedCapacity(RESOURCE_ENERGY)
      );
    });

    if (container == null) {
      utils.log("Error miner: container not found");
      creep.drop(RESOURCE_ENERGY);
      return;
    }

    if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      delete creep.memory.nearbyContainerId;
      creep.customMoveTo(container);
    }
  }
}

const getNearbyContainer = (creep: Creep): StructureContainer | null => {
  const container = creep.memory.nearbyContainerId
    ? Game.getObjectById<StructureContainer>(creep.memory.nearbyContainerId)
    : (creep.pos.findInRange(FIND_STRUCTURES, 1).find((s) => {
        return (
          s.structureType === STRUCTURE_CONTAINER &&
          (s as StructureContainer).store.getFreeCapacity() > 0
        );
      }) as StructureContainer | undefined);

  if (container && container.store.getFreeCapacity() > 0) {
    creep.memory.nearbyContainerId = container.id;
    return container;
  }

  delete creep.memory.nearbyContainerId;
  return null;
};

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
