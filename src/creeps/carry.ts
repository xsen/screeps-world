import { Color } from "../enums.ts";

export const carry: CreepHandler = {
  id: 6,
  name: "carry",
  run: function (creep: Creep) {
    if (creep.memory.status == "spawned") {
      const tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: (t) => t.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
      });
      if (tombstone) {
        if (creep.withdraw(tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(tombstone);
        }
        return;
      }
      creep.memory.status = "delivering";
    }

    if (creep.store.getUsedCapacity() == 0) {
      creep.memory.targetId = undefined;
      creep.memory.status = "refilling";
    }

    if (creep.store.getFreeCapacity() == 0) {
      creep.memory.targetId = undefined;
      creep.memory.status = "delivering";
    }

    if (creep.memory.status == "refilling") {
      refillEnergy(creep);
    }

    if (creep.memory.status == "delivering") {
      deliverEnergy(creep);
    }

    if (creep.memory.status == "carrying") {
      carryEnergy(creep);
    }
  },
};

const refillEnergy = (creep: Creep): void => {
  let target = creep.getCreepTarget<StructureContainer | StructureStorage>();

  if (target) {
    if (
      target.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getCapacity()
    ) {
      target = null;
    }
  }

  if (!target) {
    target = creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
      filter: (structure) => {
        if (structure.structureType === STRUCTURE_CONTAINER) {
          return (
            structure.store.getUsedCapacity(RESOURCE_ENERGY) >=
            creep.store.getCapacity()
          );
        }
        return false;
      },
    });
  }

  if (!target && creep.room.storage) {
    target = creep.room.storage;
  }

  if (target == null) {
    console.log("Error: container for refill not found");
    return;
  }

  creep.setCreepTarget(target);
  if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: Color.GRAY } });
  }
};

function deliverEnergy(creep: Creep) {
  const structures = getFreeStructures(creep.room).sort(
    (s1, s2) => s1.pos.getRangeTo(creep) - s2.pos.getRangeTo(creep),
  );

  if (structures.length == 0) {
    creep.memory.targetId = undefined;
    creep.memory.status = "carrying";
    return;
  }

  const target = structures[0];
  if (target != null) {
    creep.setCreepTarget(target);
    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, {
        visualizePathStyle: { stroke: Color.ORANGE },
      });
    }
  }
}

function carryEnergy(creep: Creep) {
  const storage = creep.room.storage;

  if (storage == null) {
    console.log("Error: storage not found");
    creep.memory.targetId = undefined;
    creep.memory.status = "delivering";
    return;
  }

  if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(storage, {
      visualizePathStyle: { stroke: Color.ORANGE },
    });
  }
}

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
      return (
        types.includes(structure.structureType) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    },
  });
};
