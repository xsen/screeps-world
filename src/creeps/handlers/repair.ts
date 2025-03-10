import { Color } from "../../enums.ts";

export const repair: CreepHandler = {
  id: 4,
  name: "repair",

  run: function (creep: Creep) {
    if (creep.store.getUsedCapacity() == 0) {
      creep.memory.status = "refilling";
    }

    if (creep.store.getFreeCapacity() == 0) {
      creep.memory.status = "repairing";
    }

    if (creep.memory.status == "refilling") {
      creep.getEnergy();
    }

    if (creep.memory.status == "repairing") {
      repairStructures(creep);
    }
  },
};

export const repairStructures = (creep: Creep) => {
  const target = creep.memory.targetId
    ? creep.getCreepTarget<AnyStructure>()
    : getRepairTarget(creep);

  if (target && target.hits < target.hitsMax) {
    creep.setCreepTarget(target);
    repairStructure(creep, target);
  } else {
    creep.memory.targetId = undefined;
    repairDefense(creep);
  }
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
          structure.hits < structure.hitsMax * 0.8
        );
      },
    })
    .sort((s1, s2) => s1.hits / s1.hitsMax - s2.hits / s2.hitsMax);

  return damagedStructures[0];
};

const repairDefense = (creep: Creep) => {
  //@todo: hotfix
  [
    10000, 30000, 50000, 100000, 300000, 500000, 700000, 1000000, 1500000,
    2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 10000000, 15000000,
  ].some((h) => {
    const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) =>
        s.hits < h &&
        // @ts-ignore
        (s.structureType == STRUCTURE_WALL ||
          s.structureType == STRUCTURE_RAMPART),
    });

    if (target) {
      repairStructure(creep, target);
      return true;
    }
  });

  // const damagedStructures = creep.room
  //   .find(FIND_STRUCTURES, {
  //     filter: (structure) => {
  //       return (
  //         (structure.structureType == STRUCTURE_WALL ||
  //           structure.structureType == STRUCTURE_RAMPART) &&
  //         structure.hits != structure.hitsMax
  //       );
  //     },
  //   })
  //   .sort((s1, s2) => s1.hits / s1.hitsMax - s2.hits / s2.hitsMax);
  //
  // const target = damagedStructures[0];
  // if (target) {
  //   repairStructure(creep, target);
  // }
};
