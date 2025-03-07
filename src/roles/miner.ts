import { Color } from "../enums.ts";

export const miner: CreepRole = {
  id: 5,
  name: "miner",
  run: function (creep: Creep) {
    switch (creep.memory.stage) {
      case "spawned":
        const target = getSource(creep);
        if (target == null) {
          console.log("Error: no source in the current room", creep.room.name);
          break;
        }

        creep.say("⚡ min: go");
        creep.memory.stage = "harvesting";
        creep.memory.targetId = target.id;
        creep.moveTo(target, { visualizePathStyle: { stroke: Color.GRAY } });

        break;
      case "harvesting":
        if (creep.memory.targetId == undefined) {
          console.log("Error: no target in the current creep", creep.name);
          break;
        }

        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          creep.say("⚡ min: download");
          const target = Game.getObjectById<Source>(creep.memory.targetId);

          if (target == null) {
            console.log("Error: source not found", creep.memory.targetId);
            break;
          }

          if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {
              visualizePathStyle: { stroke: Color.GRAY },
            });
          }
          break;
        }

        creep.memory.stage = "transferring";
        break;

      case "transferring":
        const container = getContainer(creep);
        if (container == null) {
          console.log("Error: container not found", creep.room.name);
          break;
        }

        creep.say("⚡ min: upload");
        if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(container, {
            visualizePathStyle: { stroke: Color.ORANGE },
          });
        }

        if (creep.store.getUsedCapacity() == 0) {
          creep.memory.stage = "harvesting";
        }
        break;
    }
  },
};

const getSource = (creep: Creep): Source | null => {
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

  return minCountSource.source;
};

const getContainer = (creep: Creep): StructureContainer | null => {
  let container: StructureContainer | null;
  // todo: проверить дальность, если она больше 5, то такое не надо
  container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      return (
        structure.structureType == STRUCTURE_CONTAINER &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    },
  });

  if (container == null) {
    const containers = creep.room.find<StructureContainer>(FIND_STRUCTURES, {
      filter: (structure) =>
        structure.structureType == STRUCTURE_CONTAINER &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
    });
    containers.sort(
      (a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b),
    );
    container = containers[0];
  }

  return container;
};
