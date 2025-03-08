import { Color } from "./enums.ts";

export const utils = {
  getEnergy: (creep: Creep, range: number = 6): void => {
    const containers = creep.pos
      .findInRange(FIND_STRUCTURES, range, {
        filter: (structure) => {
          if (structure.structureType === STRUCTURE_CONTAINER) {
            return (
              structure.store.getUsedCapacity() >= creep.store.getCapacity()
            );
          }
          return false;
        },
      })
      .sort((s1, s2) => s1.pos.getRangeTo(creep) - s2.pos.getRangeTo(creep));

    const target = containers.length > 0 ? containers[0] : creep.room.storage;
    if (target == null) {
      console.log("Error: container for refill not found");
      return;
    }

    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: Color.GRAY } });
    }
  },
};
