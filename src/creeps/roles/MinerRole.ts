import profiler from "screeps-profiler";
import { utils } from "../../utils";

const MINER_STATUS_HARVESTING = "harvesting";
const MINER_STATUS_TRANSFERRING = "transferring";

class MinerRole {
  public name = "miner";

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
      utils.log("Error miner: source not found", creep.memory.targetId);
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

  const otherCreeps = creep.room.find(FIND_MY_CREEPS, {
    filter: (cr) => cr.memory.role === creep.memory.role && cr.id != creep.id, // Используем имя роли
  });

  if (otherCreeps.length == 0) {
    return creep.pos.findClosestByPath(FIND_SOURCES);
  }

  const sourceCounts = creep.room.find(FIND_SOURCES).map((source) => {
    const count = otherCreeps.filter(
      (cr) => cr.memory.targetId == source.id,
    ).length;
    return { source: source, count };
  });

  const minCountSource = sourceCounts.reduce((prev, curr) =>
    prev.count < curr.count ? prev : curr,
  );

  creep.memory.targetId = minCountSource.source.id;
  return minCountSource.source;
};

export const miner = new MinerRole();
profiler.registerObject(miner, "Creep.Role.Miner");
