import { Color } from "../../enums.ts";
import profiler from "screeps-profiler";

export const carry: CreepRoleHandler = {
  id: 6,
  name: "carry",
  run: function (creep: Creep) {
    if (creep.getStatus() === "spawned") {
      if (creep.getEnergyFromTombstone()) {
        return;
      }
      creep.setStatus("delivering");
    }

    if (creep.store.getUsedCapacity() == 0) {
      creep.setCreepTarget(null);
      creep.setStatus("refilling");
    }

    if (creep.store.getFreeCapacity() == 0) {
      creep.setCreepTarget(null);
      creep.setStatus("delivering");
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
      creep.setCreepTarget(null);
    }
  }

  if (!target) {
    target = creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
      filter: (structure) =>
        structure.structureType === STRUCTURE_CONTAINER &&
        structure.store.getUsedCapacity(RESOURCE_ENERGY) >=
          creep.store.getCapacity(),
    });
  }

  if (!target && creep.room.storage) {
    target = creep.room.storage;
  }

  if (!target) {
    console.log("Error: container for refill not found");
    return;
  }

  creep.setCreepTarget(target);
  if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.customMoveTo(target, { visualizePathStyle: { stroke: Color.GRAY } });
  }
};

function deliverEnergy(creep: Creep) {
  let target = creep.getCreepTarget<
    StructureExtension | StructureSpawn | StructureTower
  >();
  if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
    target = null;
    creep.setCreepTarget(null);
  }

  if (!target) {
    target = getFreeStructures(creep.room).sort(
      (s1, s2) => s1.pos.getRangeTo(creep) - s2.pos.getRangeTo(creep),
    )[0];
  }

  if (!target) {
    creep.setCreepTarget(null);
    creep.setStatus("carrying");
    return;
  }

  creep.setCreepTarget(target);
  if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.customMoveTo(target, {
      visualizePathStyle: { stroke: Color.ORANGE },
    });
  }
}

function carryEnergy(creep: Creep) {
  if (creep.room.controller && creep.room.controller.level < 4) {
    creep.setCreepTarget(null);
    creep.setStatus("delivering");
    return;
  }

  const storage = creep.room.storage;

  if (!storage) {
    console.log("Error carry: storage not found");

    creep.setCreepTarget(null);
    creep.setStatus("delivering");
    return;
  }

  if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.customMoveTo(storage, {
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

profiler.registerObject(carry, "Creep.Role.Carry");
