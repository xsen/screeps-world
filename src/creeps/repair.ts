import { utils } from "../utils.ts";
import { Color } from "../enums.ts";

export const repair: CreepHandler = {
  id: 4,
  name: "repair",

  run: function (creep: Creep) {
    if (creep.store.getUsedCapacity() == 0) {
      creep.memory.stage = "refilling";
    }

    if (creep.memory.stage == "refilling") {
      utils.getEnergy(creep);
      if (creep.store.getFreeCapacity() == 0) {
        creep.memory.stage = "repairing";
      }
    }

    if (creep.memory.stage == "repairing") {
      repairStructures(creep);
    }
  },
};

export const repairStructures = (creep: Creep) => {
  if (creep.memory.targetId) {
    // @maybe: проверить что таргет уже не лечат?
    const target = Game.getObjectById<Structure>(creep.memory.targetId);
    if (target == undefined || target.hits == target.hitsMax) {
      creep.memory.targetId = undefined;
    } else {
      repairStructure(creep, target);
    }
  }

  const target = getRepairTarget(creep);
  if (target) {
    creep.memory.targetId = target.id;
    repairStructure(creep, target);
    return;
  }

  repairDefense(creep);
};

const repairStructure = (creep: Creep, target: Structure) => {
  if (creep.repair(target) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: Color.BLUE } });
  }
};

const getRepairTarget = (creep: Creep) => {
  const damagedStructures = creep.room
    .find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          structure.structureType != STRUCTURE_WALL &&
          structure.structureType != STRUCTURE_RAMPART &&
          structure.hits != structure.hitsMax
        );
      },
    })
    .sort((s1, s2) => s1.hits / s1.hitsMax - s2.hits / s2.hitsMax);

  return damagedStructures[0];
};

const repairDefense = (creep: Creep) => {
  const damagedStructures = creep.room
    .find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          (structure.structureType == STRUCTURE_WALL ||
            structure.structureType == STRUCTURE_RAMPART) &&
          structure.hits != structure.hitsMax
        );
      },
    })
    .sort((s1, s2) => s1.hits / s1.hitsMax - s2.hits / s2.hitsMax);

  const target = damagedStructures[0];
  if (target) {
    repairStructure(creep, target);
  }
};
