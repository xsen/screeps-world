import { Color } from "../../enums.ts";

export const miner: CreepRoleHandler = {
  id: 5,
  name: "miner",
  run: function (creep: Creep) {
    if (creep.store.getFreeCapacity() == 0) {
      creep.setStatus("transferring");
    }
    if (creep.store.getUsedCapacity() == 0) {
      creep.setStatus("harvesting");
    }

    if (creep.getStatus() == "harvesting") {
      const source = getTargetSource(creep);

      if (source == null) {
        console.log("Error miner: source not found", creep.memory.targetId);
        return;
      }

      const harvestRes = creep.harvest(source);
      if (harvestRes == ERR_NOT_IN_RANGE) {
        delete creep.memory.nearbyContainerId;
        creep.customMoveTo(source, {
          visualizePathStyle: { stroke: Color.GRAY },
        });
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

    if (creep.getStatus() == "transferring") {
      const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            structure.structureType == STRUCTURE_CONTAINER &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) >
              creep.store.getUsedCapacity(RESOURCE_ENERGY)
          );
        },
      });

      if (container == null) {
        console.log("Error miner: container not found");
        return;
      }

      if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        delete creep.memory.nearbyContainerId;
        creep.customMoveTo(container, {
          visualizePathStyle: { stroke: Color.GRAY },
        });
      }
    }
  },
};

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
    filter: (cr) =>
      cr.memory.roleId == creep.memory.roleId && cr.id != creep.id,
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
