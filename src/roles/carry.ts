import { Color } from "../enums.ts";

export const carry: CreepRole = {
  id: 6,
  name: "carry",
  run: function (creep: Creep) {
    if (creep.store.getUsedCapacity() == 0 || creep.memory.stage == "spawned") {
      creep.memory.stage = "refilling";
    }

    if (creep.memory.stage == "refilling") {
      getEnergy(creep);

      if (creep.store.getFreeCapacity() == 0) {
        creep.memory.stage = "delivering";
      }
    }

    if (creep.memory.stage == "delivering") {
      const structures = getFreeStructures(creep.room).sort(
        (s1, s2) => s1.pos.getRangeTo(creep) - s2.pos.getRangeTo(creep),
      );

      if (structures.length == 0) {
        creep.memory.stage = "carrying";
        return;
      }

      const target = structures[0];
      if (target != null) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            visualizePathStyle: { stroke: Color.ORANGE },
          });
        }
        return;
      }
    }

    if (creep.memory.stage == "carrying") {
      const storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_STORAGE,
      });
      if (
        storage &&
        creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(storage, {
          visualizePathStyle: { stroke: Color.ORANGE },
        });
      }
    }
  },
};

const getFreeStructures = (
  room: Room,
): (StructureExtension | StructureSpawn | StructureTower)[] => {
  const types: StructureConstant[] = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
  ];

  return room.find(FIND_STRUCTURES, {
    filter: (
      structure: StructureExtension | StructureSpawn | StructureTower,
    ) => {
      //@todo
      return (
        types.includes(structure.structureType) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    },
  });
};
const getEnergy = (creep: Creep): void => {
  let target = creep.pos.findClosestByPath<StructureContainer>(
    FIND_STRUCTURES,
    {
      filter: (structure) => {
        if (structure.structureType === STRUCTURE_CONTAINER) {
          return structure.store.getUsedCapacity() >= creep.store.getCapacity();
        }
        return false;
      },
    },
  );

  if (target == null) {
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          structure.structureType === STRUCTURE_STORAGE &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      },
    });
  }

  if (target == null) {
    console.log("Error: container not found");
    return;
  }

  if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: Color.GRAY } });
  }
};
